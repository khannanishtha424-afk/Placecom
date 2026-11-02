import pytest
from fastapi.testclient import TestClient
from main import app
from app.seed import seed_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_database()

def test_login_management_success():
    res = client.post("/api/v1/auth/login", json={
        "email": "placement@hsb.edu",
        "password": "Admin@HSB2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "management"
    assert data["full_name"] == "Placement Committee Office"

def test_login_student_success():
    res = client.post("/api/v1/auth/login", json={
        "email": "student01@hsb.edu",
        "password": "Student@HSB2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "student"
    assert data["student_id"] == "HSB26-001"

def test_login_invalid_password():
    res = client.post("/api/v1/auth/login", json={
        "email": "student01@hsb.edu",
        "password": "WrongPassword123"
    })
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]

def test_rbac_student_forbidden_from_management_overview():
    # Login as student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student01@hsb.edu",
        "password": "Student@HSB2026"
    })
    token = login_res.json()["access_token"]

    # Attempt to access management overview
    res = client.get("/api/v1/management/overview", headers={
        "Authorization": f"Bearer {token}"
    })
    assert res.status_code == 403
    assert "Management authorization required" in res.json()["detail"]

def test_rbac_management_can_access_overview():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "placement@hsb.edu",
        "password": "Admin@HSB2026"
    })
    token = login_res.json()["access_token"]

    res = client.get("/api/v1/management/overview", headers={
        "Authorization": f"Bearer {token}"
    })
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert data["metrics"]["total_cohort"] == 38
    assert "attribute_distribution" in data
