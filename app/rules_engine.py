import datetime
from typing import List, Dict, Any, Optional
from app.config import settings

def parse_date(d) -> Optional[datetime.date]:
    if not d:
        return None
    if isinstance(d, datetime.date):
        return d
    if isinstance(d, datetime.datetime):
        return d.date()
    try:
        return datetime.date.fromisoformat(str(d))
    except Exception:
        return None

class RulesEngine:
    """
    Implements all Business Rules (BR-01 through BR-16) and UI Rules for the SDP system.
    Shared by both Student Portal and Management Dashboard.
    """

    @staticmethod
    def evaluate_linkedin(records: List[Any], period: Any, as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        BR-01: LinkedIn presence
        Monthly measurement: Minimum 2 published posts per calendar month.
        0 = Red, 1 = Yellow, 2+ = Green.
        Provisional before month end.
        """
        eval_date = as_of_date or (period.end_date if period else datetime.date.today())
        month = period.month if period else eval_date.month
        year = period.year if period else eval_date.year

        # Filter valid published posts for the calendar month
        qualifying_posts = []
        for r in records:
            if r.attribute_type != "linkedin" or r.is_draft:
                continue
            pub_date = parse_date(r.publication_date) or parse_date(r.created_at)
            if pub_date and pub_date.year == year and pub_date.month == month:
                if r.post_url and r.post_url.strip():
                    qualifying_posts.append(r)

        post_count = len(qualifying_posts)
        is_provisional = (period.status != "closed") if period else True

        if post_count >= settings.MIN_LINKEDIN_MONTHLY_TARGET:
            status = "green"
            reason = f"Target achieved: {post_count} published posts in {datetime.date(year, month, 1).strftime('%B %Y')}"
            target_achievement = "Met"
        elif post_count == 1:
            status = "yellow"
            reason = f"Partial: 1 published post (target is {settings.MIN_LINKEDIN_MONTHLY_TARGET} per month)"
            target_achievement = "In progress"
        else:
            status = "red"
            reason = f"0 published posts recorded for {datetime.date(year, month, 1).strftime('%B %Y')}"
            target_achievement = "Not met"

        return {
            "attribute": "linkedin",
            "name": "LinkedIn Posts",
            "status": status,
            "target_achievement": target_achievement,
            "current_count": post_count,
            "target_count": settings.MIN_LINKEDIN_MONTHLY_TARGET,
            "progress_display": f"{post_count} / {settings.MIN_LINKEDIN_MONTHLY_TARGET} posts",
            "frequency": "Monthly",
            "is_provisional": is_provisional,
            "reason": reason,
            "records": qualifying_posts
        }

    @staticmethod
    def evaluate_timeline_item(record: Any, as_of_date: datetime.date) -> Dict[str, Any]:
        """
        Common date and initiation rules (BR-06 - BR-15) for Projects, Activities, Certifications.
        - Green: Initiated within timeline or completed on schedule with evidence.
        - Yellow: Initiated without planned end date.
        - Red: Incomplete after planned end date; OR not initiated for 2 consecutive weekly reviews.
        """
        # Check manual override first
        if getattr(record, "manual_timeline_status", None):
            return {
                "record_id": record.id,
                "title": record.title,
                "status": record.manual_timeline_status.lower(),
                "reason": f"Manual override by {record.manual_override_by}: {record.manual_override_reason}",
                "days_overdue": 0,
                "is_initiated": True,
                "is_completed": record.current_status == "Completed"
            }

        start_date = parse_date(record.start_date)
        planned_end_date = parse_date(record.planned_end_date)
        actual_comp_date = parse_date(record.actual_completion_date)
        curr_status = record.current_status or "In progress"

        # Check completed status
        if curr_status == "Completed":
            # Evidence validation (BR-11 / FR-06)
            evidence = getattr(record, "evidence_url", None) or getattr(record, "certificate_url", None)
            if not evidence or not str(evidence).strip():
                return {
                    "record_id": record.id,
                    "title": record.title,
                    "status": "yellow",
                    "reason": "Marked completed but requires verifiable completion evidence",
                    "days_overdue": 0,
                    "is_initiated": True,
                    "is_completed": False
                }
            
            comp_date = actual_comp_date or as_of_date
            if planned_end_date and comp_date > planned_end_date:
                days_late = (comp_date - planned_end_date).days
                return {
                    "record_id": record.id,
                    "title": record.title,
                    "status": "green",  # completed item retains verified complete status, note lateness in reason
                    "reason": f"Completed ({days_late} days after original planned date)",
                    "days_overdue": 0,
                    "is_initiated": True,
                    "is_completed": True
                }
            return {
                "record_id": record.id,
                "title": record.title,
                "status": "green",
                "reason": "Completed on or before planned end date with evidence",
                "days_overdue": 0,
                "is_initiated": True,
                "is_completed": True
            }

        # Incomplete item
        # Initiation check: work began or progress update recorded or status is In progress/Blocked
        is_initiated = (curr_status in ["In progress", "Blocked"]) or bool(record.progress_update and record.progress_update.strip())

        if is_initiated:
            if not planned_end_date:
                # BR-08 / BR-31: Initiated, but no end date is recorded -> Yellow
                return {
                    "record_id": record.id,
                    "title": record.title,
                    "status": "yellow",
                    "reason": "Initiated, but planned end date is missing (timeline incomplete)",
                    "days_overdue": 0,
                    "is_initiated": True,
                    "is_completed": False
                }

            if as_of_date > planned_end_date:
                # BR-10 / BR-35: Incomplete after planned end date -> Red
                days_overdue = (as_of_date - planned_end_date).days
                return {
                    "record_id": record.id,
                    "title": record.title,
                    "status": "red",
                    "reason": f"Overdue by {days_overdue} days (planned end was {planned_end_date.strftime('%d %b %Y')})",
                    "days_overdue": days_overdue,
                    "is_initiated": True,
                    "is_completed": False
                }

            # Within timeline
            return {
                "record_id": record.id,
                "title": record.title,
                "status": "green",
                "reason": f"On schedule (planned end: {planned_end_date.strftime('%d %b %Y')})",
                "days_overdue": 0,
                "is_initiated": True,
                "is_completed": False
            }
        else:
            # Not initiated
            if start_date and start_date > as_of_date:
                # BR-40: Scheduled future start date is not overdue
                return {
                    "record_id": record.id,
                    "title": record.title,
                    "status": "green",
                    "reason": f"Scheduled to start on {start_date.strftime('%d %b %Y')}",
                    "days_overdue": 0,
                    "is_initiated": False,
                    "is_completed": False
                }
            
            # Start date has arrived or passed and still not initiated
            if start_date:
                weeks_elapsed = (as_of_date - start_date).days // 7
                if weeks_elapsed >= settings.TWO_WEEK_INITIATION_CONSECUTIVE_LIMIT:
                    # BR-09 / BR-33: Not initiated for 2 consecutive weekly reviews -> Red
                    return {
                        "record_id": record.id,
                        "title": record.title,
                        "status": "red",
                        "reason": f"Not initiated for {weeks_elapsed} consecutive weekly reviews after start date",
                        "days_overdue": (as_of_date - start_date).days,
                        "is_initiated": False,
                        "is_completed": False
                    }
                else:
                    return {
                        "record_id": record.id,
                        "title": record.title,
                        "status": "yellow",
                        "reason": "Scheduled start date has passed; work initiation update pending",
                        "days_overdue": (as_of_date - start_date).days,
                        "is_initiated": False,
                        "is_completed": False
                    }
            
            return {
                "record_id": record.id,
                "title": record.title,
                "status": "yellow",
                "reason": "Not initiated; timeline dates pending",
                "days_overdue": 0,
                "is_initiated": False,
                "is_completed": False
            }

    @classmethod
    def evaluate_projects(cls, records: List[Any], period: Any, as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        BR-02: Projects evaluation
        """
        eval_date = as_of_date or (period.end_date if period else datetime.date.today())
        project_records = [r for r in records if r.attribute_type == "projects" and not r.is_draft]

        if not project_records:
            return {
                "attribute": "projects",
                "name": "Projects",
                "status": "yellow",
                "target_achievement": "In progress",
                "current_count": 0,
                "target_count": 1,
                "progress_display": "0 active projects",
                "frequency": "Weekly",
                "reason": "No project registered for current review period",
                "overdue_count": 0,
                "records": []
            }

        evaluations = [cls.evaluate_timeline_item(r, eval_date) for r in project_records]
        
        # Aggregate status: If ANY project is Red -> Red. Else if ANY Yellow -> Yellow. Else Green.
        has_red = any(e["status"] == "red" for e in evaluations)
        has_yellow = any(e["status"] == "yellow" for e in evaluations)
        overdue_count = sum(1 for e in evaluations if e["days_overdue"] > 0 and e["status"] == "red")

        if has_red:
            overall_status = "red"
            red_item = next(e for e in evaluations if e["status"] == "red")
            reason = f"{red_item['title']}: {red_item['reason']}"
            target_achievement = "Not met"
        elif has_yellow:
            overall_status = "yellow"
            yellow_item = next(e for e in evaluations if e["status"] == "yellow")
            reason = f"{yellow_item['title']}: {yellow_item['reason']}"
            target_achievement = "In progress"
        else:
            overall_status = "green"
            reason = "All projects are on schedule or completed on time"
            target_achievement = "Met"

        completed_count = sum(1 for e in evaluations if e["is_completed"])

        return {
            "attribute": "projects",
            "name": "Projects",
            "status": overall_status,
            "target_achievement": target_achievement,
            "current_count": len(project_records),
            "target_count": 1,
            "progress_display": f"{len(project_records)} project(s) · {completed_count} completed",
            "frequency": "Weekly",
            "reason": reason,
            "overdue_count": overdue_count,
            "evaluations": evaluations,
            "records": project_records
        }

    @staticmethod
    def evaluate_competitions(records: List[Any], period: Any, as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        BR-03: Competitions
        Weekly measurement: Participation tracking and timely updates.
        A student is not penalized if no suitable competition is available, provided an update is recorded.
        """
        eval_date = as_of_date or (period.end_date if period else datetime.date.today())
        comp_records = [r for r in records if r.attribute_type == "competitions" and not r.is_draft]

        # Check if student submitted competition record in current period
        if not comp_records:
            return {
                "attribute": "competitions",
                "name": "Competitions",
                "status": "red",
                "target_achievement": "Not met",
                "current_count": 0,
                "target_count": 1,
                "progress_display": "Missing update",
                "frequency": "Weekly",
                "reason": "Required weekly competition participation update is missing",
                "missed_deadlines": 0,
                "records": []
            }

        # Check records
        has_yellow = False
        has_missed_deadline = False
        reasons = []

        for r in comp_records:
            if getattr(r, "is_no_competition_declaration", False):
                continue
            if not r.title or not (r.organizer or r.competition_stage):
                has_yellow = True
                reasons.append(f"{r.title or 'Record'}: Required details missing")
            if not r.next_steps and not r.result and r.competition_stage not in ["Completed", "Won", "Eliminated"]:
                has_yellow = True
                reasons.append(f"{r.title}: Next steps update pending")
            comp_dl = parse_date(getattr(r, "competition_deadline", None))
            if comp_dl and comp_dl < eval_date and r.competition_stage in ["Registered", "In progress"]:
                has_missed_deadline = True

        if has_yellow:
            status = "yellow"
            reason = "; ".join(reasons) if reasons else "Record exists but required details/next steps are incomplete"
            target_achievement = "In progress"
        else:
            status = "green"
            active_or_dec = comp_records[0]
            if getattr(active_or_dec, "is_no_competition_declaration", False):
                reason = "Weekly update complete: No suitable competition available this week"
            else:
                reason = f"Participation update complete: {active_or_dec.title} ({active_or_dec.competition_stage or 'Active'})"
            target_achievement = "Met"

        return {
            "attribute": "competitions",
            "name": "Competitions",
            "status": status,
            "target_achievement": target_achievement,
            "current_count": len(comp_records),
            "target_count": 1,
            "progress_display": f"{len(comp_records)} update(s) logged",
            "frequency": "Weekly",
            "reason": reason,
            "missed_deadlines": 1 if has_missed_deadline else 0,
            "records": comp_records
        }

    @classmethod
    def evaluate_activities(cls, records: List[Any], period: Any, as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        BR-04: Activities
        Weekly measurement: Club/committee work, volunteering, leadership.
        Follows project timeline rules.
        """
        eval_date = as_of_date or (period.end_date if period else datetime.date.today())
        act_records = [r for r in records if r.attribute_type == "activities" and not r.is_draft]

        if not act_records:
            return {
                "attribute": "activities",
                "name": "Activities",
                "status": "yellow",
                "target_achievement": "In progress",
                "current_count": 0,
                "target_count": 1,
                "progress_display": "0 active activities",
                "frequency": "Weekly",
                "reason": "No ongoing campus activity or leadership responsibility logged",
                "overdue_count": 0,
                "records": []
            }

        evaluations = [cls.evaluate_timeline_item(r, eval_date) for r in act_records]
        has_red = any(e["status"] == "red" for e in evaluations)
        has_yellow = any(e["status"] == "yellow" for e in evaluations)
        overdue_count = sum(1 for e in evaluations if e["days_overdue"] > 0 and e["status"] == "red")

        if has_red:
            overall_status = "red"
            red_item = next(e for e in evaluations if e["status"] == "red")
            reason = f"{red_item['title']}: {red_item['reason']}"
            target_achievement = "Not met"
        elif has_yellow:
            overall_status = "yellow"
            yellow_item = next(e for e in evaluations if e["status"] == "yellow")
            reason = f"{yellow_item['title']}: {yellow_item['reason']}"
            target_achievement = "In progress"
        else:
            overall_status = "green"
            reason = "Activities are on schedule or completed on time"
            target_achievement = "Met"

        return {
            "attribute": "activities",
            "name": "Activities",
            "status": overall_status,
            "target_achievement": target_achievement,
            "current_count": len(act_records),
            "target_count": 1,
            "progress_display": f"{len(act_records)} activity record(s)",
            "frequency": "Weekly",
            "reason": reason,
            "overdue_count": overdue_count,
            "evaluations": evaluations,
            "records": act_records
        }

    @classmethod
    def evaluate_certifications(cls, records: List[Any], period: Any, as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        BR-05: Certifications
        Timeline follows project/activity rules.
        Target achievement: Monthly target of at least 1 completed certification.
        """
        eval_date = as_of_date or (period.end_date if period else datetime.date.today())
        month = period.month if period else eval_date.month
        year = period.year if period else eval_date.year

        cert_records = [r for r in records if r.attribute_type == "certifications" and not r.is_draft]

        if not cert_records:
            return {
                "attribute": "certifications",
                "name": "Certifications",
                "status": "yellow",
                "target_achievement": "Not met",
                "current_count": 0,
                "target_count": 1,
                "progress_display": "0 certifications",
                "frequency": "Monthly with weekly timeline",
                "reason": "No active certification enrolled or completed",
                "overdue_count": 0,
                "records": []
            }

        evaluations = [cls.evaluate_timeline_item(r, eval_date) for r in cert_records]
        has_red = any(e["status"] == "red" for e in evaluations)
        has_yellow = any(e["status"] == "yellow" for e in evaluations)
        overdue_count = sum(1 for e in evaluations if e["days_overdue"] > 0 and e["status"] == "red")

        # Timeline status
        if has_red:
            timeline_status = "red"
            red_item = next(e for e in evaluations if e["status"] == "red")
            reason = f"{red_item['title']}: {red_item['reason']}"
        elif has_yellow:
            timeline_status = "yellow"
            yellow_item = next(e for e in evaluations if e["status"] == "yellow")
            reason = f"{yellow_item['title']}: {yellow_item['reason']}"
        else:
            timeline_status = "green"
            reason = "Certification timeline is valid and on schedule"

        # Separate Target achievement dimension (BR-164 / PRD 119)
        completed_in_month = []
        for r in cert_records:
            comp_d = parse_date(r.actual_completion_date) or parse_date(r.updated_at)
            cert_url = getattr(r, "certificate_url", None) or getattr(r, "evidence_url", None)
            if r.current_status == "Completed" and cert_url and comp_d and comp_d.year == year and comp_d.month == month:
                completed_in_month.append(r)

        if len(completed_in_month) >= 1:
            target_achievement = "Met"
            reason += f" · Monthly completion target met ({completed_in_month[0].title})"
        else:
            target_achievement = "In progress" if any(e["is_initiated"] for e in evaluations) else "Not met"
            reason += " · Monthly completion target pending"

        return {
            "attribute": "certifications",
            "name": "Certifications",
            "status": timeline_status,
            "target_achievement": target_achievement,
            "current_count": len(completed_in_month),
            "target_count": 1,
            "progress_display": f"{len(completed_in_month)} / 1 completed this month",
            "frequency": "Monthly",
            "reason": reason,
            "overdue_count": overdue_count,
            "evaluations": evaluations,
            "records": cert_records
        }

    @staticmethod
    def evaluate_networking(records: List[Any], period: Any, as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        BR-16: Networking
        Weekly measurement: Minimum 2 meaningful professional conversations per week.
        0 = Red, 1 = Yellow, 2+ = Green.
        """
        net_records = []
        for r in records:
            if r.attribute_type != "networking" or r.is_draft:
                continue
            # If period is provided, filter records within period or associated with period_id
            if period and getattr(r, "period_id", None) == period.id:
                net_records.append(r)
            elif period and r.conversation_date:
                conv_d = parse_date(r.conversation_date)
                if conv_d and period.start_date <= conv_d <= period.end_date:
                    net_records.append(r)
            elif not period:
                net_records.append(r)

        count = len(net_records)
        target = settings.MIN_NETWORKING_WEEKLY_TARGET

        if count >= target:
            status = "green"
            reason = f"Target achieved: {count} professional conversations recorded this week"
            target_achievement = "Met"
        elif count == 1:
            status = "yellow"
            reason = f"Partial: 1 conversation recorded (target is {target} per week)"
            target_achievement = "In progress"
        else:
            status = "red"
            reason = f"0 professional conversations recorded for this week (target is {target})"
            target_achievement = "Not met"

        return {
            "attribute": "networking",
            "name": "Networking",
            "status": status,
            "target_achievement": target_achievement,
            "current_count": count,
            "target_count": target,
            "progress_display": f"{count} / {target} conversations",
            "frequency": "Weekly",
            "reason": reason,
            "records": net_records
        }

    @classmethod
    def evaluate_student_period(cls, student: Any, period: Any, records: List[Any], as_of_date: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        Evaluates all 6 attributes for a student in a reporting period,
        and computes the overall classification:
        - Fully compliant
        - Partially compliant
        - No targets met
        - Awaiting assessment
        """
        eval_date = as_of_date or (period.end_date if period else datetime.date.today())

        linkedin_eval = cls.evaluate_linkedin(records, period, eval_date)
        projects_eval = cls.evaluate_projects(records, period, eval_date)
        competitions_eval = cls.evaluate_competitions(records, period, eval_date)
        activities_eval = cls.evaluate_activities(records, period, eval_date)
        certifications_eval = cls.evaluate_certifications(records, period, eval_date)
        networking_eval = cls.evaluate_networking(records, period, eval_date)

        attributes = {
            "linkedin": linkedin_eval,
            "projects": projects_eval,
            "competitions": competitions_eval,
            "activities": activities_eval,
            "certifications": certifications_eval,
            "networking": networking_eval
        }

        # Check Awaiting Assessment condition (PRD 137 / BR-UI-06):
        # Insufficient data exists to determine compliance reliably.
        non_draft_records = [r for r in records if not r.is_draft]
        if len(non_draft_records) == 0:
            classification = "Awaiting assessment"
            compliance_reason = "No developmental records or activity updates submitted for this period"
            is_assessed = False
        else:
            is_assessed = True
            green_count = sum(1 for a in attributes.values() if a["status"] == "green")
            yellow_count = sum(1 for a in attributes.values() if a["status"] == "yellow")
            red_count = sum(1 for a in attributes.values() if a["status"] == "red")

            # Fully compliant: All applicable targets and reporting rules are met (Green)
            if green_count == 6:
                classification = "Fully compliant"
                compliance_reason = "All applicable developmental targets and timeline requirements are met"
            # No targets met: None of the applicable targets has been met
            elif green_count == 0:
                classification = "No targets met"
                compliance_reason = "None of the applicable developmental targets have been achieved"
            # Partially compliant: At least one met, but at least one not met or incomplete
            else:
                classification = "Partially compliant"
                unmet = [a["name"] for a in attributes.values() if a["status"] in ["red", "yellow"]]
                compliance_reason = f"Unmet or partial requirements in: {', '.join(unmet)}"

        # Identify follow-up items
        follow_up_items = []
        for attr_key, attr_val in attributes.items():
            if attr_val["status"] in ["red", "yellow"]:
                follow_up_items.append({
                    "attribute": attr_val["name"],
                    "status": attr_val["status"],
                    "reason": attr_val["reason"]
                })

        return {
            "student_id": student.id,
            "student_code": student.student_id,
            "student_name": student.name,
            "cohort": student.cohort,
            "mentor_name": student.mentor_name,
            "period_id": period.id if period else None,
            "period_title": period.title if period else "Current Period",
            "classification": classification,
            "is_assessed": is_assessed,
            "compliance_reason": compliance_reason,
            "attributes": attributes,
            "follow_up_items": follow_up_items,
            "summary_counts": {
                "green": sum(1 for a in attributes.values() if a["status"] == "green"),
                "yellow": sum(1 for a in attributes.values() if a["status"] == "yellow"),
                "red": sum(1 for a in attributes.values() if a["status"] == "red")
            }
        }
