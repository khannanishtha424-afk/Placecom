import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ReportingPeriod, ReviewFollowUp, User
from app.auth import require_management
from app.reporting import ReportingService

router = APIRouter(prefix="/export", tags=["Exports"])

@router.get("/excel")
def export_batch_excel(
    period_id: Optional[int] = Query(None),
    mentor: Optional[str] = Query(None),
    current_user: User = Depends(require_management),
    db: Session = Depends(get_db)
):
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

    batch_summary = ReportingService.get_batch_summary(db, period, mentor_filter=mentor)
    follow_ups = db.query(ReviewFollowUp).all()

    excel_bytes = ReportingService.generate_excel_report(batch_summary, follow_ups)

    safe_title = period.title.replace(' ', '_').replace('·', '-').replace('–', '-').replace('—', '-')
    # Keep only ASCII alphanumeric and basic punctuation
    safe_title = "".join(c for c in safe_title if c.isalnum() or c in "_-.")
    filename = f"HSB_SDP_Report_{safe_title}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
