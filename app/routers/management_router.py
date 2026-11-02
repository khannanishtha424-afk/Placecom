import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User, Student, ReportingPeriod, AttributeRecord,
    DeadlineRevision, ReviewFollowUp, AuditLog
)
from app.schemas import (
    DeadlineRevisionCreate, DeadlineRevisionResponse,
    ManualOverrideRequest, FollowUpCreate, FollowUpUpdate, FollowUpResponse,
    AuditLogResponse, StudentResponse
)
from app.auth import get_current_user, require_management
from app.rules_engine import RulesEngine, parse_date
from app.reporting import ReportingService

router = APIRouter(prefix="/management", tags=["Management Dashboard"])

@router.get("/overview")
def get_batch_overview(
    period_id: Optional[int] = Query(None),
    mentor: Optional[str] = Query(None),
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    """
    BR-UI-05: Batch summary overview metrics for the selected reporting period.
    """
    if period_id:
        period = db.query(ReportingPeriod).filter(ReportingPeriod.id == period_id).first()
    else:
        today = datetime.date.today()
        period = db.query(ReportingPeriod).filter(
            ReportingPeriod.period_type == "weekly",
            ReportingPeriod.start_date <= today,
            ReportingPeriod.end_date >= today
        ).first()
        if not period:
            period = db.query(ReportingPeriod).order_by(ReportingPeriod.id.desc()).first()

    if not period:
        raise HTTPException(status_code=404, detail="No reporting period available")

    summary = ReportingService.get_batch_summary(db, period, mentor_filter=mentor)
    return summary

@router.get("/students")
def get_management_students(
    period_id: Optional[int] = Query(None),
    classification: Optional[str] = Query(None),  # 'Fully compliant', 'Partially compliant', 'No targets met', 'Awaiting assessment'
    attribute: Optional[str] = Query(None),       # 'linkedin', 'projects', etc.
    attribute_status: Optional[str] = Query(None),# 'green', 'yellow', 'red'
    mentor: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),         # 'overdue', 'missing', 'name', 'code'
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    """
    BR-UI-07 & BR-UI-12: Filterable and searchable student roster with compliance evaluations.
    """
    if period_id:
        period = db.query(ReportingPeriod).filter(ReportingPeriod.id == period_id).first()
    else:
        today = datetime.date.today()
        period = db.query(ReportingPeriod).filter(
            ReportingPeriod.period_type == "weekly",
            ReportingPeriod.start_date <= today,
            ReportingPeriod.end_date >= today
        ).first()
        if not period:
            period = db.query(ReportingPeriod).order_by(ReportingPeriod.id.desc()).first()

    query = db.query(Student).filter(Student.is_active == True)
    if mentor:
        query = query.filter(Student.mentor_name == mentor)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter((Student.name.ilike(search_fmt)) | (Student.student_id.ilike(search_fmt)))

    students = query.all()
    as_of = period.end_date if period else datetime.date.today()

    evaluated_list = []
    for st in students:
        records = db.query(AttributeRecord).filter(
            AttributeRecord.student_id == st.id,
            AttributeRecord.is_draft == False
        ).all()
        eval_res = RulesEngine.evaluate_student_period(st, period, records, as_of)

        # Filters
        if classification and eval_res["classification"] != classification:
            continue

        if attribute and attribute_status:
            attr_eval = eval_res["attributes"].get(attribute)
            if not attr_eval or attr_eval["status"] != attribute_status.lower():
                continue

        evaluated_list.append(eval_res)

    # Sorting
    if sort_by == "overdue":
        def get_max_overdue(item):
            max_od = 0
            for ak in ["projects", "activities", "certifications"]:
                for ev in item["attributes"][ak].get("evaluations", []):
                    if ev.get("days_overdue", 0) > max_od:
                        max_od = ev["days_overdue"]
            return max_od
        evaluated_list.sort(key=get_max_overdue, reverse=True)
    elif sort_by == "name":
        evaluated_list.sort(key=lambda x: x["student_name"])
    elif sort_by == "code":
        evaluated_list.sort(key=lambda x: x["student_code"])

    return {
        "count": len(evaluated_list),
        "period_title": period.title if period else "Current Period",
        "students": evaluated_list
    }

@router.get("/students/{student_id}")
def get_student_drilldown(
    student_id: int,
    period_id: Optional[int] = Query(None),
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    """
    BR-UI-08: Detailed student progress profile with timelines, evidence links,
    deadline revisions, follow-ups, and chronological history.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if period_id:
        period = db.query(ReportingPeriod).filter(ReportingPeriod.id == period_id).first()
    else:
        today = datetime.date.today()
        period = db.query(ReportingPeriod).filter(
            ReportingPeriod.period_type == "weekly",
            ReportingPeriod.start_date <= today,
            ReportingPeriod.end_date >= today
        ).first()
        if not period:
            period = db.query(ReportingPeriod).order_by(ReportingPeriod.id.desc()).first()

    all_records = db.query(AttributeRecord).filter(
        AttributeRecord.student_id == student.id
    ).order_by(AttributeRecord.updated_at.desc()).all()

    as_of = period.end_date if period else datetime.date.today()
    eval_res = RulesEngine.evaluate_student_period(
        student, period, [r for r in all_records if not r.is_draft], as_of
    )

    # Timeline visualization items (BR-UI-09)
    timeline_items = []
    for r in all_records:
        if r.attribute_type in ["projects", "activities", "certifications"] and not r.is_draft:
            item_eval = RulesEngine.evaluate_timeline_item(r, as_of)
            timeline_items.append({
                "record_id": r.id,
                "attribute_type": r.attribute_type,
                "title": r.title,
                "start_date": r.start_date.isoformat() if r.start_date else None,
                "planned_end_date": r.planned_end_date.isoformat() if r.planned_end_date else None,
                "original_planned_end_date": r.original_planned_end_date.isoformat() if r.original_planned_end_date else None,
                "actual_completion_date": r.actual_completion_date.isoformat() if r.actual_completion_date else None,
                "status": item_eval["status"],
                "reason": item_eval["reason"],
                "days_overdue": item_eval.get("days_overdue", 0),
                "evidence_url": r.evidence_url or r.certificate_url,
                "progress_update": r.progress_update,
                "deadline_revisions_count": len(r.deadline_revisions)
            })

    # Follow-ups
    follow_ups = db.query(ReviewFollowUp).filter(
        ReviewFollowUp.student_id == student.id
    ).order_by(ReviewFollowUp.created_at.desc()).all()

    # Revisions
    record_ids = [r.id for r in all_records]
    revisions = db.query(DeadlineRevision).filter(
        DeadlineRevision.record_id.in_(record_ids)
    ).order_by(DeadlineRevision.approved_at.desc()).all() if record_ids else []

    return {
        "student": {
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "cohort": student.cohort,
            "mentor_name": student.mentor_name
        },
        "period": {
            "id": period.id if period else None,
            "title": period.title if period else "Current Period"
        },
        "evaluation": eval_res,
        "timeline_items": timeline_items,
        "records": all_records,
        "follow_ups": follow_ups,
        "revisions": revisions
    }

@router.get("/attribute-analysis")
def get_attribute_analysis(
    attribute: str = Query(..., description="linkedin, projects, competitions, activities, certifications, networking"),
    period_id: Optional[int] = Query(None),
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    """
    BR-UI-10: Attribute-wise batch analysis for cohort performance.
    """
    if period_id:
        period = db.query(ReportingPeriod).filter(ReportingPeriod.id == period_id).first()
    else:
        today = datetime.date.today()
        period = db.query(ReportingPeriod).filter(
            ReportingPeriod.period_type == "weekly",
            ReportingPeriod.start_date <= today,
            ReportingPeriod.end_date >= today
        ).first()
        if not period:
            period = db.query(ReportingPeriod).order_by(ReportingPeriod.id.desc()).first()

    students = db.query(Student).filter(Student.is_active == True).all()
    as_of = period.end_date if period else datetime.date.today()

    compliant = []
    partially_compliant = []
    non_compliant = []

    for st in students:
        records = db.query(AttributeRecord).filter(
            AttributeRecord.student_id == st.id,
            AttributeRecord.is_draft == False
        ).all()
        eval_res = RulesEngine.evaluate_student_period(st, period, records, as_of)
        attr_eval = eval_res["attributes"].get(attribute)

        student_info = {
            "student_id": st.id,
            "student_code": st.student_id,
            "student_name": st.name,
            "status": attr_eval["status"] if attr_eval else "red",
            "reason": attr_eval["reason"] if attr_eval else "No data",
            "progress_display": attr_eval.get("progress_display", "") if attr_eval else "",
            "records": [r for r in records if r.attribute_type == attribute]
        }

        if attr_eval and attr_eval["status"] == "green":
            compliant.append(student_info)
        elif attr_eval and attr_eval["status"] == "yellow":
            partially_compliant.append(student_info)
        else:
            non_compliant.append(student_info)

    return {
        "attribute": attribute,
        "period_title": period.title if period else "Current Period",
        "counts": {
            "compliant_green": len(compliant),
            "partial_yellow": len(partially_compliant),
            "non_compliant_red": len(non_compliant),
            "total": len(students)
        },
        "compliant_students": compliant,
        "partial_students": partially_compliant,
        "non_compliant_students": non_compliant
    }

@router.post("/deadline-revisions", response_model=DeadlineRevisionResponse)
def approve_deadline_revision(
    rev_in: DeadlineRevisionCreate,
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    """
    BR-12 / BR-13 / BR-UI-11: Approves an authorized deadline revision.
    Preserves original deadline and previous deadline in history.
    """
    record = db.query(AttributeRecord).filter(AttributeRecord.id == rev_in.record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attribute record not found")

    old_deadline = record.planned_end_date

    # Validate that new deadline is not before start date
    if record.start_date and rev_in.new_deadline < record.start_date:
        raise HTTPException(status_code=400, detail="New deadline cannot precede start date")

    # Record revision
    revision = DeadlineRevision(
        record_id=record.id,
        old_deadline=old_deadline,
        new_deadline=rev_in.new_deadline,
        reason=rev_in.reason,
        approver_id=current_user.id,
        approver_name=current_user.full_name,
        approved_at=datetime.datetime.utcnow()
    )
    db.add(revision)

    # Update record
    record.planned_end_date = rev_in.new_deadline
    record.updated_at = datetime.datetime.utcnow()

    # Audit log
    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="DEADLINE_REVISION",
        entity_type=record.attribute_type,
        entity_id=record.id,
        before_val=str(old_deadline),
        after_val=str(rev_in.new_deadline),
        reason=f"Approved deadline extension: {rev_in.reason}"
    )
    db.add(audit)
    db.commit()
    db.refresh(revision)

    return revision

@router.post("/manual-override")
def manual_status_override(
    override_in: ManualOverrideRequest,
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    """
    BR-UI-11: Authorized manual status override with mandatory reason and audit log.
    """
    if override_in.timeline_status.lower() not in ["green", "yellow", "red"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be green, yellow, or red.")

    record = db.query(AttributeRecord).filter(AttributeRecord.id == override_in.record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    before_val = record.manual_timeline_status or "None (auto-calculated)"
    record.manual_timeline_status = override_in.timeline_status.lower()
    record.manual_override_reason = override_in.reason
    record.manual_override_by = current_user.full_name
    record.manual_override_at = datetime.datetime.utcnow()

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="STATUS_OVERRIDE",
        entity_type=record.attribute_type,
        entity_id=record.id,
        before_val=before_val,
        after_val=record.manual_timeline_status,
        reason=override_in.reason
    )
    db.add(audit)
    db.commit()

    return {"message": "Status override recorded successfully", "new_status": record.manual_timeline_status}

@router.get("/follow-ups", response_model=List[FollowUpResponse])
def get_follow_ups(
    student_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    query = db.query(ReviewFollowUp)
    if student_id:
        query = query.filter(ReviewFollowUp.student_id == student_id)
    if status:
        query = query.filter(ReviewFollowUp.resolution_status == status)
    return query.order_by(ReviewFollowUp.created_at.desc()).all()

@router.post("/follow-ups", response_model=FollowUpResponse)
def create_follow_up(
    fu_in: FollowUpCreate,
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    fu = ReviewFollowUp(
        student_id=fu_in.student_id,
        record_id=fu_in.record_id,
        attribute_type=fu_in.attribute_type,
        reviewer_id=current_user.id,
        reviewer_name=current_user.full_name,
        comment=fu_in.comment,
        action_required=fu_in.action_required,
        assigned_to=fu_in.assigned_to or current_user.full_name,
        next_review_date=fu_in.next_review_date,
        resolution_status="Pending"
    )
    db.add(fu)
    db.commit()
    db.refresh(fu)

    audit = AuditLog(
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="CREATE_FOLLOW_UP",
        entity_type="follow_up",
        entity_id=fu.id,
        reason=f"Assigned follow-up for student {fu.student_id}: {fu.action_required}"
    )
    db.add(audit)
    db.commit()

    return fu

@router.put("/follow-ups/{follow_up_id}", response_model=FollowUpResponse)
def update_follow_up(
    follow_up_id: int,
    fu_in: FollowUpUpdate,
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    fu = db.query(ReviewFollowUp).filter(ReviewFollowUp.id == follow_up_id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    update_data = fu_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(fu, field, val)
    fu.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(fu)
    return fu

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
