import calendar
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ReportingPeriod
from app.schemas import ReportingPeriodResponse

router = APIRouter(prefix="/periods", tags=["Reporting Periods"])

def generate_month_periods(year: int, month: int) -> List[dict]:
    """
    Generates Monday-Sunday periods for a month, with first and last weeks
    truncated to month start and end.
    Example: October 2026
    Week 1: Oct 1 - Oct 4 (Thu - Sun)
    Week 2: Oct 5 - Oct 11 (Mon - Sun)
    Week 3: Oct 12 - Oct 18 (Mon - Sun)
    Week 4: Oct 19 - Oct 25 (Mon - Sun)
    Week 5: Oct 26 - Oct 31 (Mon - Sat)
    """
    first_day = datetime.date(year, month, 1)
    last_day_num = calendar.monthrange(year, month)[1]
    last_day = datetime.date(year, month, last_day_num)

    periods = []
    week_num = 1
    curr_start = first_day

    while curr_start <= last_day:
        # Calculate days until next Sunday (weekday 6)
        weekday = curr_start.weekday()  # Monday is 0, Sunday is 6
        days_to_sunday = 6 - weekday
        curr_end = curr_start + datetime.timedelta(days=days_to_sunday)
        if curr_end > last_day:
            curr_end = last_day

        month_name = curr_start.strftime("%b")
        title = f"Week {week_num} · {curr_start.day}–{curr_end.day} {month_name} {year}"
        periods.append({
            "period_type": "weekly",
            "year": year,
            "month": month,
            "week_number": week_num,
            "start_date": curr_start,
            "end_date": curr_end,
            "title": title
        })

        week_num += 1
        curr_start = curr_end + datetime.timedelta(days=1)

    return periods

@router.get("", response_model=List[ReportingPeriodResponse])
def get_periods(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ReportingPeriod).filter(ReportingPeriod.period_type == "weekly")
    if year:
        query = query.filter(ReportingPeriod.year == year)
    if month:
        query = query.filter(ReportingPeriod.month == month)
    periods = query.order_by(ReportingPeriod.year.asc(), ReportingPeriod.month.asc(), ReportingPeriod.week_number.asc()).all()
    
    # If no periods exist for requested year/month, generate them
    if not periods and year and month:
        gen_list = generate_month_periods(year, month)
        today = datetime.date.today()
        created = []
        for p_data in gen_list:
            if p_data["end_date"] < today:
                status = "closed"
            elif p_data["start_date"] <= today <= p_data["end_date"]:
                status = "open"
            else:
                status = "provisional"
            
            p = ReportingPeriod(
                period_type=p_data["period_type"],
                year=p_data["year"],
                month=p_data["month"],
                week_number=p_data["week_number"],
                start_date=p_data["start_date"],
                end_date=p_data["end_date"],
                status=status,
                title=p_data["title"]
            )
            db.add(p)
            created.append(p)
        db.commit()
        for p in created:
            db.refresh(p)
        return created

    return periods

@router.get("/current", response_model=ReportingPeriodResponse)
def get_current_period(db: Session = Depends(get_db)):
    today = datetime.date.today()
    # Find matching period for today
    period = db.query(ReportingPeriod).filter(
        ReportingPeriod.period_type == "weekly",
        ReportingPeriod.start_date <= today,
        ReportingPeriod.end_date >= today
    ).first()

    if not period:
        # Auto generate for current month and fetch
        get_periods(year=today.year, month=today.month, db=db)
        period = db.query(ReportingPeriod).filter(
            ReportingPeriod.period_type == "weekly",
            ReportingPeriod.start_date <= today,
            ReportingPeriod.end_date >= today
        ).first()

    if not period:
        # Fallback to latest available period
        period = db.query(ReportingPeriod).order_by(ReportingPeriod.id.desc()).first()

    if not period:
        raise HTTPException(status_code=404, detail="No reporting periods found")
    return period
