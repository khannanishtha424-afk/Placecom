from typing import Optional, List, Dict, Any
from pydantic import BaseModel, HttpUrl, EmailStr, Field
import datetime

# --- Auth & User Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    student_id: Optional[str] = None
    student_pk: Optional[int] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"
    student_id: Optional[str] = None
    cohort: Optional[str] = "MBA Batch 2026–28"
    mentor_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    student_pk: Optional[int] = None
    student_id: Optional[str] = None

# --- Student Schemas ---
class StudentResponse(BaseModel):
    id: int
    student_id: str
    name: str
    email: str
    cohort: str
    mentor_name: Optional[str] = None
    is_active: bool

# --- Period Schemas ---
class ReportingPeriodResponse(BaseModel):
    id: int
    period_type: str
    year: int
    month: int
    week_number: Optional[int] = None
    start_date: datetime.date
    end_date: datetime.date
    status: str
    title: str

# --- Attribute Record Schemas ---
class AttributeRecordCreate(BaseModel):
    period_id: Optional[int] = None
    attribute_type: str  # linkedin, projects, competitions, activities, certifications, networking
    title: str
    description: Optional[str] = None
    current_status: Optional[str] = "In progress"
    is_draft: Optional[bool] = False

    # Dates
    start_date: Optional[datetime.date] = None
    planned_end_date: Optional[datetime.date] = None
    actual_completion_date: Optional[datetime.date] = None

    # Evidence & notes
    evidence_url: Optional[str] = None
    progress_update: Optional[str] = None

    # Specifics
    post_url: Optional[str] = None
    publication_date: Optional[datetime.date] = None
    post_notes: Optional[str] = None

    organizer: Optional[str] = None
    registration_status: Optional[str] = None
    competition_deadline: Optional[datetime.date] = None
    competition_stage: Optional[str] = None
    result: Optional[str] = None
    next_steps: Optional[str] = None
    is_no_competition_declaration: Optional[bool] = False

    activity_role: Optional[str] = None
    contribution: Optional[str] = None

    provider: Optional[str] = None
    certificate_url: Optional[str] = None

    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    organization: Optional[str] = None
    conversation_date: Optional[datetime.date] = None
    key_learning: Optional[str] = None

class AttributeRecordUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    current_status: Optional[str] = None
    is_draft: Optional[bool] = None

    start_date: Optional[datetime.date] = None
    planned_end_date: Optional[datetime.date] = None
    actual_completion_date: Optional[datetime.date] = None

    evidence_url: Optional[str] = None
    progress_update: Optional[str] = None

    post_url: Optional[str] = None
    publication_date: Optional[datetime.date] = None
    post_notes: Optional[str] = None

    organizer: Optional[str] = None
    registration_status: Optional[str] = None
    competition_deadline: Optional[datetime.date] = None
    competition_stage: Optional[str] = None
    result: Optional[str] = None
    next_steps: Optional[str] = None
    is_no_competition_declaration: Optional[bool] = None

    activity_role: Optional[str] = None
    contribution: Optional[str] = None

    provider: Optional[str] = None
    certificate_url: Optional[str] = None

    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    organization: Optional[str] = None
    conversation_date: Optional[datetime.date] = None
    key_learning: Optional[str] = None

class AttributeRecordResponse(BaseModel):
    id: int
    student_id: int
    period_id: Optional[int]
    attribute_type: str
    title: str
    description: Optional[str] = None
    current_status: str
    is_draft: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    start_date: Optional[datetime.date] = None
    planned_end_date: Optional[datetime.date] = None
    original_planned_end_date: Optional[datetime.date] = None
    actual_completion_date: Optional[datetime.date] = None

    evidence_url: Optional[str] = None
    progress_update: Optional[str] = None

    post_url: Optional[str] = None
    publication_date: Optional[datetime.date] = None
    post_notes: Optional[str] = None

    organizer: Optional[str] = None
    registration_status: Optional[str] = None
    competition_deadline: Optional[datetime.date] = None
    competition_stage: Optional[str] = None
    result: Optional[str] = None
    next_steps: Optional[str] = None
    is_no_competition_declaration: Optional[bool] = False

    activity_role: Optional[str] = None
    contribution: Optional[str] = None

    provider: Optional[str] = None
    certificate_url: Optional[str] = None

    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    organization: Optional[str] = None
    conversation_date: Optional[datetime.date] = None
    key_learning: Optional[str] = None

    manual_timeline_status: Optional[str] = None
    manual_override_reason: Optional[str] = None
    manual_override_by: Optional[str] = None
    manual_override_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Deadline Revision Schemas ---
class DeadlineRevisionCreate(BaseModel):
    record_id: int
    new_deadline: datetime.date
    reason: str

class DeadlineRevisionResponse(BaseModel):
    id: int
    record_id: int
    old_deadline: Optional[datetime.date]
    new_deadline: datetime.date
    reason: str
    approver_name: str
    approved_at: datetime.datetime

# --- Manual Override Schema ---
class ManualOverrideRequest(BaseModel):
    record_id: int
    timeline_status: str  # green, yellow, red
    reason: str

# --- Follow-Up Schemas ---
class FollowUpCreate(BaseModel):
    student_id: int
    record_id: Optional[int] = None
    attribute_type: Optional[str] = None
    comment: str
    action_required: str
    assigned_to: Optional[str] = None
    next_review_date: Optional[datetime.date] = None

class FollowUpUpdate(BaseModel):
    comment: Optional[str] = None
    action_required: Optional[str] = None
    assigned_to: Optional[str] = None
    next_review_date: Optional[datetime.date] = None
    resolution_status: Optional[str] = None  # Pending, In Progress, Resolved

class FollowUpResponse(BaseModel):
    id: int
    student_id: int
    record_id: Optional[int]
    attribute_type: Optional[str]
    reviewer_name: str
    comment: str
    action_required: str
    assigned_to: Optional[str]
    next_review_date: Optional[datetime.date]
    resolution_status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[int]
    before_val: Optional[str]
    after_val: Optional[str]
    reason: Optional[str]
    timestamp: datetime.datetime

    class Config:
        from_attributes = True
