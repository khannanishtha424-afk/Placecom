import datetime
import pytest
from fastapi.testclient import TestClient
from main import app
from app.seed import seed_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_database()

def get_auth_token(email, password):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_periods_overview_and_evaluation():
    token = get_auth_token("student01@hsb.edu", "Student@HSB2026")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch periods overview for October 2026
    res = client.get("/api/v1/student/periods-overview?year=2026&month=10", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == 2026
    assert data["month"] == 10
    assert len(data["periods"]) == 5  # 5 calendar segments in Oct 2026

    # Week 3 evaluation for Student 1 (should be fully compliant)
    week3 = next(p for p in data["periods"] if p["week_number"] == 3)
    p_id = week3["period_id"]

    eval_res = client.get(f"/api/v1/student/periods/{p_id}/evaluation", headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["classification"] == "Fully compliant"
    assert eval_data["summary_counts"]["green"] == 6

def test_student_submission_validation():
    token = get_auth_token("student01@hsb.edu", "Student@HSB2026")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Reject planned end date before start date
    res_bad_dates = client.post("/api/v1/student/records", headers=headers, json={
        "attribute_type": "projects",
        "title": "Invalid Dates Project",
        "start_date": "2026-10-20",
        "planned_end_date": "2026-10-10",
        "current_status": "In progress"
    })
    assert res_bad_dates.status_code == 400
    assert "Planned end date cannot precede start date" in res_bad_dates.json()["detail"]

    # 2. Reject Completed project without evidence URL
    res_no_ev = client.post("/api/v1/student/records", headers=headers, json={
        "attribute_type": "projects",
        "title": "Unverified Completion Project",
        "start_date": "2026-10-01",
        "planned_end_date": "2026-10-14",
        "actual_completion_date": "2026-10-12",
        "current_status": "Completed",
        "evidence_url": ""
    })
    assert res_no_ev.status_code == 400
    assert "requires supporting evidence" in res_no_ev.json()["detail"]

    # 3. Accept Completed project with evidence URL
    res_valid = client.post("/api/v1/student/records", headers=headers, json={
        "attribute_type": "projects",
        "title": "Valid Completion Project",
        "start_date": "2026-10-01",
        "planned_end_date": "2026-10-14",
        "actual_completion_date": "2026-10-12",
        "current_status": "Completed",
        "evidence_url": "https://drive.google.com/test-verified-proof"
    })
    assert res_valid.status_code == 200
    assert res_valid.json()["current_status"] == "Completed"

def test_management_deadline_revision_preserves_history():
    st_token = get_auth_token("student02@hsb.edu", "Student@HSB2026")
    st_headers = {"Authorization": f"Bearer {st_token}"}

    # Student 2 creates an active project
    create_res = client.post("/api/v1/student/records", headers=st_headers, json={
        "attribute_type": "projects",
        "title": "Market Basket Analysis",
        "start_date": "2026-10-01",
        "planned_end_date": "2026-10-14",
        "current_status": "In progress",
        "progress_update": "Initial data cleaned."
    })
    rec_id = create_res.json()["id"]

    # Management logs in and approves a revised deadline
    mgmt_token = get_auth_token("placement@hsb.edu", "Admin@HSB2026")
    mgmt_headers = {"Authorization": f"Bearer {mgmt_token}"}

    rev_res = client.post("/api/v1/management/deadline-revisions", headers=mgmt_headers, json={
        "record_id": rec_id,
        "new_deadline": "2026-10-28",
        "reason": "Extension granted due to hospital partner dataset access delay."
    })
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert rev_data["old_deadline"] == "2026-10-14"
    assert rev_data["new_deadline"] == "2026-10-28"
    assert rev_data["approver_name"] == "Placement Committee Office"

    # Check student drilldown: original planned end date is preserved
    drill_res = client.get(f"/api/v1/management/students/{create_res.json()['student_id']}", headers=mgmt_headers)
    assert drill_res.status_code == 200
    drill_data = drill_res.json()
    assert len(drill_data["revisions"]) >= 1

def test_management_manual_status_override_and_audit():
    mgmt_token = get_auth_token("placement@hsb.edu", "Admin@HSB2026")
    mgmt_headers = {"Authorization": f"Bearer {mgmt_token}"}

    # Get records
    drill_res = client.get("/api/v1/management/students/1", headers=mgmt_headers)
    rec = drill_res.json()["records"][0]

    # Override status
    ov_res = client.post("/api/v1/management/manual-override", headers=mgmt_headers, json={
        "record_id": rec["id"],
        "timeline_status": "green",
        "reason": "Exemption formally approved by Placement Committee Chair."
    })
    assert ov_res.status_code == 200

    # Verify audit log recorded
    audit_res = client.get("/api/v1/management/audit-logs?limit=5", headers=mgmt_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any(l["action"] == "STATUS_OVERRIDE" for l in logs)

def test_excel_export_binary():
    mgmt_token = get_auth_token("placement@hsb.edu", "Admin@HSB2026")
    mgmt_headers = {"Authorization": f"Bearer {mgmt_token}"}

    res = client.get("/api/v1/export/excel", headers=mgmt_headers)
    assert res.status_code == 200
    assert "spreadsheetml.sheet" in res.headers["content-type"]
    assert len(res.content) > 1000  # valid binary Excel workbook
