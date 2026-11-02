import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Student, ReportingPeriod, AttributeRecord, AuditLog
from app.schemas import (
    StudentResponse, AttributeRecordCreate, AttributeRecordUpdate,
    AttributeRecordResponse
)
from app.auth import get_current_user, require_student, verify_student_access
from app.rules_engine import RulesEngine, parse_date

router = APIRouter(prefix="/student", tags=["Student Portal"])

@router.get("/me", response_model=StudentResponse)
def get_my_profile(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not linked to user account")
    return student

@router.get("/periods-overview")
def get_student_periods_overview(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    BR-UI-01: Displays all weeks for the selected month,
    with week number, date range, and current student compliance status:
    'Completed' (fully compliant), 'Partial' (partially compliant), 'In progress', or 'Upcoming' (future).
    """
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    today = datetime.date.today()
    req_year = year or today.year
    req_month = month or today.month

    # Get periods
    periods = db.query(ReportingPeriod).filter(
        ReportingPeriod.period_type == "weekly",
        ReportingPeriod.year == req_year,
        ReportingPeriod.month == req_month
    ).order_by(ReportingPeriod.week_number.asc()).all()

    # Pre-fetch student records
    records = db.query(AttributeRecord).filter(
        AttributeRecord.student_id == student.id,
        AttributeRecord.is_draft == False
    ).all()

    result = []
    for p in periods:
        is_current = (p.start_date <= today <= p.end_date)
        is_future = (p.start_date > today)
        is_past = (p.end_date < today)

        # Status calculation
        if is_future:
            status_label = "Upcoming"
            status_color = "gray"
        else:
            eval_res = RulesEngine.evaluate_student_period(student, p, records, p.end_date)
            cls = eval_res["classification"]
            if cls == "Fully compliant":
                status_label = "Completed"
                status_color = "green"
            elif cls == "Partially compliant":
                status_label = "Partial"
                status_color = "yellow"
            elif cls == "No targets met":
                status_label = "Not met"
                status_color = "red"
            else:
                status_label = "In progress" if is_current else "Awaiting assessment"
                status_color = "blue" if is_current else "gray"

        result.append({
            "period_id": p.id,
            "week_number": p.week_number,
            "title": p.title,
            "start_date": p.start_date.isoformat(),
            "end_date": p.end_date.isoformat(),
            "month_name": p.start_date.strftime("%B"),
            "year": p.year,
            "is_current": is_current,
            "is_future": is_future,
            "is_past": is_past,
            "status_label": status_label,
            "status_color": status_color
        })

    return {
        "year": req_year,
        "month": req_month,
        "month_name": datetime.date(req_year, req_month, 1).strftime("%B %Y"),
        "periods": result
    }

@router.get("/periods/{period_id}/evaluation")
def get_period_evaluation(
    period_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    BR-UI-02: Returns evaluated status of the six attributes for the student
    in the chosen week.
    """
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    period = db.query(ReportingPeriod).filter(ReportingPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Reporting period not found")

    records = db.query(AttributeRecord).filter(
        AttributeRecord.student_id == student.id,
        AttributeRecord.is_draft == False
    ).all()

    as_of = period.end_date if period.end_date < datetime.date.today() else datetime.date.today()
    eval_res = RulesEngine.evaluate_student_period(student, period, records, as_of)
    return eval_res

@router.get("/records", response_model=List[AttributeRecordResponse])
def get_my_records(
    period_id: Optional[int] = Query(None),
    attribute_type: Optional[str] = Query(None),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    query = db.query(AttributeRecord).filter(AttributeRecord.student_id == student.id)
    if period_id:
        query = query.filter(AttributeRecord.period_id == period_id)
    if attribute_type:
        query = query.filter(AttributeRecord.attribute_type == attribute_type)

    return query.order_by(AttributeRecord.updated_at.desc()).all()

@router.post("/records", response_model=AttributeRecordResponse)
def create_my_record(
    record_in: AttributeRecordCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Date validations (BR-UI-03)
    if record_in.start_date and record_in.planned_end_date:
        if record_in.planned_end_date < record_in.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Planned end date cannot precede start date"
            )

    # Completion validation (BR-11 / FR-06)
    if record_in.current_status == "Completed":
        has_evidence = bool(
            (record_in.evidence_url and record_in.evidence_url.strip()) or
            (record_in.certificate_url and record_in.certificate_url.strip()) or
            (record_in.post_url and record_in.post_url.strip())
        )
        if not has_evidence and not record_in.is_draft:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A completed record requires supporting evidence URL before it can be accepted as completed"
            )

    db_record = AttributeRecord(
        student_id=student.id,
        period_id=record_in.period_id,
        attribute_type=record_in.attribute_type,
        title=record_in.title,
        description=record_in.description,
        current_status=record_in.current_status or "In progress",
        is_draft=record_in.is_draft or False,
        start_date=record_in.start_date,
        planned_end_date=record_in.planned_end_date,
        original_planned_end_date=record_in.planned_end_date,
        actual_completion_date=record_in.actual_completion_date,
        evidence_url=record_in.evidence_url,
        progress_update=record_in.progress_update,
        post_url=record_in.post_url,
        publication_date=record_in.publication_date,
        post_notes=record_in.post_notes,
        organizer=record_in.organizer,
        registration_status=record_in.registration_status,
        competition_deadline=record_in.competition_deadline,
        competition_stage=record_in.competition_stage,
        result=record_in.result,
        next_steps=record_in.next_steps,
        is_no_competition_declaration=record_in.is_no_competition_declaration or False,
        activity_role=record_in.activity_role,
        contribution=record_in.contribution,
        provider=record_in.provider,
        certificate_url=record_in.certificate_url,
        contact_name=record_in.contact_name,
        contact_role=record_in.contact_role,
        organization=record_in.organization,
        conversation_date=record_in.conversation_date,
        key_learning=record_in.key_learning
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    # Log action
    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="CREATE_RECORD",
        entity_type=db_record.attribute_type,
        entity_id=db_record.id,
        reason=f"Student submitted new {db_record.attribute_type} record: {db_record.title}"
    )
    db.add(audit)
    db.commit()

    return db_record

@router.put("/records/{record_id}", response_model=AttributeRecordResponse)
def update_my_record(
    record_id: int,
    record_in: AttributeRecordUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    record = db.query(AttributeRecord).filter(
        AttributeRecord.id == record_id,
        AttributeRecord.student_id == student.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found or access denied")

    # If period is closed and record is not draft, flag correction rules (BR-UI-04)
    if record.period and record.period.status == "closed" and not record.is_draft:
        # Prevent silent modification of deadlines without approval
        if record_in.planned_end_date and record_in.planned_end_date != record.planned_end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Once a reporting period closes, deadline revisions require management approval"
            )

    # Validation
    eff_start = record_in.start_date or record.start_date
    eff_end = record_in.planned_end_date or record.planned_end_date
    if eff_start and eff_end and eff_end < eff_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Planned end date cannot precede start date"
        )

    # Update fields
    update_data = record_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(record, field, val)

    record.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(record)

    # Log audit
    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="UPDATE_RECORD",
        entity_type=record.attribute_type,
        entity_id=record.id,
        reason=f"Student updated record {record.title}"
    )
    db.add(audit)
    db.commit()

    return record

@router.delete("/records/{record_id}")
def delete_my_record(
    record_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    record = db.query(AttributeRecord).filter(
        AttributeRecord.id == record_id,
        AttributeRecord.student_id == student.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found or access denied")

    # Only draft records or records in open periods can be deleted directly
    if not record.is_draft and record.period and record.period.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete verified records from closed periods"
        )

    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully"}

@router.get("/history")
def get_my_history(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    periods = db.query(ReportingPeriod).filter(
        ReportingPeriod.period_type == "weekly"
    ).order_by(ReportingPeriod.id.asc()).all()

    records = db.query(AttributeRecord).filter(
        AttributeRecord.student_id == student.id,
        AttributeRecord.is_draft == False
    ).all()

    history = []
    for p in periods:
        eval_res = RulesEngine.evaluate_student_period(student, p, records, p.end_date)
        history.append({
            "period_id": p.id,
            "period_title": p.title,
            "classification": eval_res["classification"],
            "summary_counts": eval_res["summary_counts"],
            "attributes": {
                k: {"status": v["status"], "reason": v["reason"]}
                for k, v in eval_res["attributes"].items()
            }
        })
    return history
