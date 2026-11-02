import datetime
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'student', 'management', 'admin'
    full_name = Column(String(120), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. HSB26-001
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    cohort = Column(String(50), default="MBA Batch 2026–28")
    mentor_id = Column(String(50), nullable=True)
    mentor_name = Column(String(120), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    records = relationship("AttributeRecord", back_populates="student", cascade="all, delete-orphan")
    follow_ups = relationship("ReviewFollowUp", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("PeriodSubmission", back_populates="student", cascade="all, delete-orphan")


class ReportingPeriod(Base):
    __tablename__ = "reporting_periods"

    id = Column(Integer, primary_key=True, index=True)
    period_type = Column(String(20), default="weekly")  # 'weekly', 'monthly'
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)  # 1 to 12
    week_number = Column(Integer, nullable=True)  # 1 to 5 for weekly, None for monthly
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="open")  # 'open', 'closed', 'provisional'
    title = Column(String(100), nullable=False)  # e.g. "Week 3 (Oct 12–18, 2026)"

    # Relationships
    records = relationship("AttributeRecord", back_populates="period", cascade="all, delete-orphan")


class AttributeRecord(Base):
    __tablename__ = "attribute_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    period_id = Column(Integer, ForeignKey("reporting_periods.id"), nullable=True, index=True)
    attribute_type = Column(String(30), nullable=False, index=True)
    # Types: 'linkedin', 'projects', 'competitions', 'activities', 'certifications', 'networking'

    # Common fields
    title = Column(String(200), nullable=False)  # Name / Title / Contact / Topic
    description = Column(Text, nullable=True)     # Objective / Description / Details
    current_status = Column(String(50), nullable=False, default="In progress")
    # Statuses: 'Not started', 'In progress', 'Completed', 'Blocked', 'Registered', 'Submitted', 'Shortlisted', 'Won'
    is_draft = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Dates & Timelines
    start_date = Column(Date, nullable=True)
    planned_end_date = Column(Date, nullable=True)
    original_planned_end_date = Column(Date, nullable=True)
    actual_completion_date = Column(Date, nullable=True)

    # Specific fields
    evidence_url = Column(String(500), nullable=True)
    progress_update = Column(Text, nullable=True)

    # LinkedIn specific
    post_url = Column(String(500), nullable=True)
    publication_date = Column(Date, nullable=True)
    post_notes = Column(Text, nullable=True)

    # Competitions specific
    organizer = Column(String(150), nullable=True)
    registration_status = Column(String(50), nullable=True)
    competition_deadline = Column(Date, nullable=True)
    competition_stage = Column(String(50), nullable=True)
    result = Column(String(100), nullable=True)
    next_steps = Column(Text, nullable=True)
    is_no_competition_declaration = Column(Boolean, default=False)

    # Activities specific
    activity_role = Column(String(100), nullable=True)
    contribution = Column(Text, nullable=True)

    # Certifications specific
    provider = Column(String(150), nullable=True)
    certificate_url = Column(String(500), nullable=True)

    # Networking specific
    contact_name = Column(String(120), nullable=True)
    contact_role = Column(String(120), nullable=True)
    organization = Column(String(150), nullable=True)
    conversation_date = Column(Date, nullable=True)
    key_learning = Column(Text, nullable=True)

    # Manual override fields (authorized management only)
    manual_timeline_status = Column(String(20), nullable=True)  # 'green', 'yellow', 'red'
    manual_override_reason = Column(Text, nullable=True)
    manual_override_by = Column(String(100), nullable=True)
    manual_override_at = Column(DateTime, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="records")
    period = relationship("ReportingPeriod", back_populates="records")
    deadline_revisions = relationship("DeadlineRevision", back_populates="record", cascade="all, delete-orphan")


class DeadlineRevision(Base):
    __tablename__ = "deadline_revisions"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("attribute_records.id"), nullable=False, index=True)
    old_deadline = Column(Date, nullable=True)
    new_deadline = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    approver_id = Column(Integer, nullable=False)
    approver_name = Column(String(120), nullable=False)
    approved_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    record = relationship("AttributeRecord", back_populates="deadline_revisions")


class ReviewFollowUp(Base):
    __tablename__ = "review_follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    record_id = Column(Integer, ForeignKey("attribute_records.id"), nullable=True)
    attribute_type = Column(String(30), nullable=True)
    reviewer_id = Column(Integer, nullable=False)
    reviewer_name = Column(String(120), nullable=False)
    comment = Column(Text, nullable=False)
    action_required = Column(Text, nullable=False)
    assigned_to = Column(String(120), nullable=True)
    next_review_date = Column(Date, nullable=True)
    resolution_status = Column(String(30), default="Pending")  # 'Pending', 'In Progress', 'Resolved'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="follow_ups")


class PeriodSubmission(Base):
    __tablename__ = "period_submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    period_id = Column(Integer, ForeignKey("reporting_periods.id"), nullable=False, index=True)
    status = Column(String(30), default="submitted")  # 'draft', 'submitted', 'verified'
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="submissions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(120), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)  # 'DEADLINE_REVISION', 'STATUS_OVERRIDE', 'RECORD_UPDATE', etc.
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    before_val = Column(Text, nullable=True)
    after_val = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
