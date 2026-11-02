import datetime
import pytest
from app.rules_engine import RulesEngine
from types import SimpleNamespace

def create_mock_record(attr_type, **kwargs):
    d = {
        "id": 1,
        "attribute_type": attr_type,
        "title": "Test Title",
        "is_draft": False,
        "current_status": "In progress",
        "start_date": None,
        "planned_end_date": None,
        "original_planned_end_date": None,
        "actual_completion_date": None,
        "evidence_url": None,
        "certificate_url": None,
        "progress_update": None,
        "post_url": None,
        "publication_date": None,
        "is_no_competition_declaration": False,
        "organizer": None,
        "competition_deadline": None,
        "competition_stage": None,
        "next_steps": None,
        "result": None,
        "conversation_date": None,
        "created_at": datetime.datetime(2026, 10, 15),
        "updated_at": datetime.datetime(2026, 10, 15),
        "manual_timeline_status": None
    }
    d.update(kwargs)
    return SimpleNamespace(**d)

def create_mock_period(year=2026, month=10, week_number=3, start_date=datetime.date(2026, 10, 12), end_date=datetime.date(2026, 10, 18), status="open"):
    return SimpleNamespace(
        id=1,
        period_type="weekly",
        year=year,
        month=month,
        week_number=week_number,
        start_date=start_date,
        end_date=end_date,
        status=status,
        title=f"Week {week_number} · {start_date.strftime('%d')}-{end_date.strftime('%d %b %Y')}"
    )

class TestRulesEngine:

    def test_br01_linkedin_evaluation(self):
        period = create_mock_period()
        # 0 posts -> Red
        res0 = RulesEngine.evaluate_linkedin([], period)
        assert res0["status"] == "red"
        assert res0["current_count"] == 0
        assert res0["target_achievement"] == "Not met"

        # 1 post -> Yellow
        p1 = create_mock_record("linkedin", post_url="https://linkedin.com/posts/1", publication_date=datetime.date(2026, 10, 5))
        res1 = RulesEngine.evaluate_linkedin([p1], period)
        assert res1["status"] == "yellow"
        assert res1["current_count"] == 1
        assert res1["target_achievement"] == "In progress"

        # 2+ posts -> Green
        p2 = create_mock_record("linkedin", post_url="https://linkedin.com/posts/2", publication_date=datetime.date(2026, 10, 14))
        res2 = RulesEngine.evaluate_linkedin([p1, p2], period)
        assert res2["status"] == "green"
        assert res2["current_count"] == 2
        assert res2["target_achievement"] == "Met"

    def test_br02_projects_timeline(self):
        eval_date = datetime.date(2026, 10, 15)

        # Initiated without planned end date -> Yellow
        proj_no_end = create_mock_record(
            "projects",
            current_status="In progress",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=None,
            progress_update="Work started"
        )
        res = RulesEngine.evaluate_timeline_item(proj_no_end, eval_date)
        assert res["status"] == "yellow"
        assert "planned end date is missing" in res["reason"]

        # Overdue: planned end date has passed without completion -> Red
        proj_overdue = create_mock_record(
            "projects",
            current_status="In progress",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 10),
            progress_update="Facing hurdles"
        )
        res_od = RulesEngine.evaluate_timeline_item(proj_overdue, eval_date)
        assert res_od["status"] == "red"
        assert res_od["days_overdue"] == 5
        assert "Overdue by 5 days" in res_od["reason"]

        # On schedule -> Green
        proj_on_time = create_mock_record(
            "projects",
            current_status="In progress",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 25),
            progress_update="Drafting model"
        )
        res_ot = RulesEngine.evaluate_timeline_item(proj_on_time, eval_date)
        assert res_ot["status"] == "green"
        assert "On schedule" in res_ot["reason"]

        # Completed on schedule with evidence -> Green
        proj_comp = create_mock_record(
            "projects",
            current_status="Completed",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 14),
            actual_completion_date=datetime.date(2026, 10, 12),
            evidence_url="https://github.com/test/repo"
        )
        res_comp = RulesEngine.evaluate_timeline_item(proj_comp, eval_date)
        assert res_comp["status"] == "green"
        assert res_comp["is_completed"] == True

        # Completed without evidence -> Yellow
        proj_comp_no_ev = create_mock_record(
            "projects",
            current_status="Completed",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 14),
            actual_completion_date=datetime.date(2026, 10, 12),
            evidence_url=""
        )
        res_no_ev = RulesEngine.evaluate_timeline_item(proj_comp_no_ev, eval_date)
        assert res_no_ev["status"] == "yellow"
        assert "requires verifiable completion evidence" in res_no_ev["reason"]

    def test_br09_two_week_initiation_rule(self):
        eval_date = datetime.date(2026, 10, 15)

        # Future scheduled start date -> Green (not overdue)
        proj_future = create_mock_record(
            "projects",
            current_status="Not started",
            start_date=datetime.date(2026, 10, 25),
            planned_end_date=datetime.date(2026, 11, 15)
        )
        res_future = RulesEngine.evaluate_timeline_item(proj_future, eval_date)
        assert res_future["status"] == "green"
        assert "Scheduled to start" in res_future["reason"]

        # Start date reached 3 days ago (less than 2 weeks) -> Yellow
        proj_started_recently = create_mock_record(
            "projects",
            current_status="Not started",
            start_date=datetime.date(2026, 10, 12),
            planned_end_date=datetime.date(2026, 11, 15)
        )
        res_recent = RulesEngine.evaluate_timeline_item(proj_started_recently, eval_date)
        assert res_recent["status"] == "yellow"

        # Start date > 2 weeks ago and not initiated -> Red
        proj_not_init_2w = create_mock_record(
            "projects",
            current_status="Not started",
            start_date=datetime.date(2026, 9, 25),
            planned_end_date=datetime.date(2026, 11, 15)
        )
        res_2w = RulesEngine.evaluate_timeline_item(proj_not_init_2w, eval_date)
        assert res_2w["status"] == "red"
        assert "Not initiated for 2 consecutive weekly reviews" in res_2w["reason"]

    def test_br03_competitions(self):
        period = create_mock_period()
        # Missing update -> Red
        res_missing = RulesEngine.evaluate_competitions([], period)
        assert res_missing["status"] == "red"
        assert "Required weekly competition participation update is missing" in res_missing["reason"]

        # No suitable competition declaration -> Green
        dec_rec = create_mock_record("competitions", title="No comp", is_no_competition_declaration=True)
        res_dec = RulesEngine.evaluate_competitions([dec_rec], period)
        assert res_dec["status"] == "green"
        assert "No suitable competition available this week" in res_dec["reason"]

        # Complete participation update -> Green
        full_rec = create_mock_record(
            "competitions",
            title="Tata Case Challenge",
            organizer="Tata",
            competition_stage="Submitted",
            next_steps="Presentation round preparation"
        )
        res_full = RulesEngine.evaluate_competitions([full_rec], period)
        assert res_full["status"] == "green"

    def test_br16_networking(self):
        period = create_mock_period()
        # 0 conversations -> Red
        res0 = RulesEngine.evaluate_networking([], period)
        assert res0["status"] == "red"
        assert res0["current_count"] == 0

        # 1 conversation -> Yellow
        c1 = create_mock_record("networking", conversation_date=datetime.date(2026, 10, 13))
        res1 = RulesEngine.evaluate_networking([c1], period)
        assert res1["status"] == "yellow"
        assert res1["current_count"] == 1

        # 2 conversations -> Green
        c2 = create_mock_record("networking", conversation_date=datetime.date(2026, 10, 14))
        res2 = RulesEngine.evaluate_networking([c1, c2], period)
        assert res2["status"] == "green"
        assert res2["current_count"] == 2

    def test_overall_student_classification(self):
        student = SimpleNamespace(id=1, student_id="HSB26-001", name="Candidate 01", cohort="MBA Batch 2026–28", mentor_name="Prof. Sharma")
        period = create_mock_period()

        # No records -> Awaiting assessment
        eval_awaiting = RulesEngine.evaluate_student_period(student, period, [])
        assert eval_awaiting["classification"] == "Awaiting assessment"
        assert eval_awaiting["is_assessed"] == False

        # All 6 Green records -> Fully compliant
        recs_all_green = [
            create_mock_record("linkedin", post_url="url1", publication_date=datetime.date(2026, 10, 5)),
            create_mock_record("linkedin", post_url="url2", publication_date=datetime.date(2026, 10, 13)),
            create_mock_record("projects", current_status="In progress", start_date=datetime.date(2026, 10, 1), planned_end_date=datetime.date(2026, 10, 30), progress_update="Ok"),
            create_mock_record("competitions", title="Comp", is_no_competition_declaration=True),
            create_mock_record("activities", current_status="In progress", start_date=datetime.date(2026, 10, 1), planned_end_date=datetime.date(2026, 10, 30), progress_update="Ok"),
            create_mock_record("certifications", current_status="Completed", start_date=datetime.date(2026, 10, 1), planned_end_date=datetime.date(2026, 10, 14), actual_completion_date=datetime.date(2026, 10, 12), certificate_url="http://cert"),
            create_mock_record("networking", conversation_date=datetime.date(2026, 10, 13)),
            create_mock_record("networking", conversation_date=datetime.date(2026, 10, 14))
        ]
        eval_full = RulesEngine.evaluate_student_period(student, period, recs_all_green, datetime.date(2026, 10, 15))
        assert eval_full["classification"] == "Fully compliant"
        assert eval_full["is_assessed"] == True
