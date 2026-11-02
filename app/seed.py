import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, Student, ReportingPeriod, AttributeRecord, ReviewFollowUp, AuditLog
from app.auth import hash_password
from app.routers.periods_router import generate_month_periods

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        mgmt_user = db.query(User).filter(User.email == "placement@hsb.edu").first()
        if mgmt_user:
            print("Database already contains seed data.")
            return

        print("Seeding HSB Student Development Program database...")

        # 1. Create Management Account
        admin = User(
            email="placement@hsb.edu",
            hashed_password=hash_password("Admin@HSB2026"),
            role="management",
            full_name="Placement Committee Office",
            is_active=True
        )
        db.add(admin)
        db.flush()

        # 2. Generate Reporting Periods for October 2026 (matching PRD reference periods)
        oct_periods_data = generate_month_periods(2026, 10)
        oct_periods = []
        for p_data in oct_periods_data:
            # Oct 1-4 (Week 1): closed
            # Oct 5-11 (Week 2): closed
            # Oct 12-18 (Week 3): open (contains current local date Oct 15, 2026)
            # Oct 19-25 (Week 4): provisional / upcoming
            # Oct 26-31 (Week 5): provisional / upcoming
            wn = p_data["week_number"]
            if wn in [1, 2]:
                stat = "closed"
            elif wn == 3:
                stat = "open"
            else:
                stat = "provisional"

            p = ReportingPeriod(
                period_type=p_data["period_type"],
                year=p_data["year"],
                month=p_data["month"],
                week_number=p_data["week_number"],
                start_date=p_data["start_date"],
                end_date=p_data["end_date"],
                status=stat,
                title=p_data["title"]
            )
            db.add(p)
            oct_periods.append(p)
        db.flush()

        week3_period = oct_periods[2]  # Oct 12-18, 2026

        # 3. Create 38 MBA Batch 2026-28 Students
        mentors = [
            "Prof. R. Sharma (Faculty Chair)",
            "Dr. V. Menon (Industry Mentor)",
            "Prof. A. Kapoor (Placement Mentor)"
        ]

        students = []
        for i in range(1, 39):
            code = f"HSB26-{i:03d}"
            name = f"Candidate {i:02d} (Batch 26-28)"
            email = f"student{i:02d}@hsb.edu"
            mentor = mentors[(i - 1) % len(mentors)]

            u = User(
                email=email,
                hashed_password=hash_password("Student@HSB2026"),
                role="student",
                full_name=name,
                is_active=True
            )
            db.add(u)
            db.flush()

            st = Student(
                user_id=u.id,
                student_id=code,
                name=name,
                email=email,
                cohort="MBA Batch 2026–28",
                mentor_name=mentor,
                is_active=True
            )
            db.add(st)
            db.flush()
            students.append(st)

        # 4. Seed Verified Acceptance Criteria Edge-Cases for Testing
        # Student 1 (HSB26-001): Fully Compliant (All 6 attributes Green)
        st1 = students[0]
        # LinkedIn: 2 published posts
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="linkedin",
            title="Analysis of Fintech Lending Models in India",
            post_url="https://linkedin.com/posts/hsb26001-fintech-analysis",
            publication_date=datetime.date(2026, 10, 5), current_status="Completed"
        ))
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="linkedin",
            title="Key Takeaways from HSB Supply Chain Masterclass",
            post_url="https://linkedin.com/posts/hsb26001-supplychain-takeaways",
            publication_date=datetime.date(2026, 10, 13), current_status="Completed"
        ))
        # Projects: 1 active project on schedule
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="projects",
            title="Hospital Operations Optimization Model",
            description="Linear programming formulation for bed allocation and ER triage queueing.",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 30),
            original_planned_end_date=datetime.date(2026, 10, 30),
            current_status="In progress",
            progress_update="Completed preliminary data gathering; formulating solver constraints in Python.",
            evidence_url="https://github.com/hsb-students/hospital-ops-optimization"
        ))
        # Competitions: Participation update complete
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="competitions",
            title="Tata Business Leadership Case Challenge 2026",
            organizer="Tata Sons",
            registration_status="Registered",
            competition_deadline=datetime.date(2026, 10, 24),
            competition_stage="Submitted",
            result="Awaiting Shortlist",
            next_steps="Prepare executive slide deck for Round 2 presentation."
        ))
        # Activities: Campus leadership on schedule
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="activities",
            title="Placement Preparation Club Coordinator",
            activity_role="Student Lead",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 11, 15),
            original_planned_end_date=datetime.date(2026, 11, 15),
            current_status="In progress",
            contribution="Organized 4 peer mock interviews and resume verification for junior batch.",
            evidence_url="https://drive.google.com/file/d/mock-interview-roster-proof"
        ))
        # Certifications: Monthly completed target satisfied
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="certifications",
            title="Financial Valuation & DCF Modeling",
            provider="Corporate Finance Institute (CFI)",
            start_date=datetime.date(2026, 10, 2),
            planned_end_date=datetime.date(2026, 10, 14),
            actual_completion_date=datetime.date(2026, 10, 12),
            current_status="Completed",
            certificate_url="https://credentials.cfi.org/verify/hsb26001-valuation"
        ))
        # Networking: 2 conversations recorded in Week 3
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="networking",
            title="Networking with VP Investment Banking",
            contact_name="Vikram Seth", contact_role="VP Investment Banking",
            organization="Barclays Capital", conversation_date=datetime.date(2026, 10, 13),
            key_learning="Learned about leveraged buyout structuring and debt covenants in Indian infra."
        ))
        db.add(AttributeRecord(
            student_id=st1.id, period_id=week3_period.id, attribute_type="networking",
            title="Networking with Product Manager",
            contact_name="Pooja Rao", contact_role="Senior Product Manager",
            organization="Swiggy", conversation_date=datetime.date(2026, 10, 14),
            key_learning="Discussed retention metrics and cohort analysis in quick-commerce apps."
        ))

        # Student 2 (HSB26-002): Partially Compliant (LinkedIn Yellow, Project Yellow missing end date)
        st2 = students[1]
        db.add(AttributeRecord(
            student_id=st2.id, period_id=week3_period.id, attribute_type="linkedin",
            title="Notes on Porter's Five Forces in Electric Mobility",
            post_url="https://linkedin.com/posts/hsb26002-ev-strategy",
            publication_date=datetime.date(2026, 10, 10), current_status="Completed"
        ))
        db.add(AttributeRecord(
            student_id=st2.id, period_id=week3_period.id, attribute_type="projects",
            title="Brand Equity Survey for FMCG Cosmetics",
            description="Consumer perceptual mapping and awareness survey.",
            start_date=datetime.date(2026, 10, 5),
            planned_end_date=None,  # Yellow: missing planned end date
            current_status="In progress",
            progress_update="Conducted 50 sample responses on campus."
        ))
        db.add(AttributeRecord(
            student_id=st2.id, period_id=week3_period.id, attribute_type="competitions",
            title="No suitable competition available this week",
            is_no_competition_declaration=True,
            current_status="Completed"
        ))
        db.add(AttributeRecord(
            student_id=st2.id, period_id=week3_period.id, attribute_type="activities",
            title="Alumni Relations Committee Member",
            activity_role="Core Committee Member",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 28),
            current_status="In progress",
            contribution="Curating directory for annual alumni reunion.",
            evidence_url="https://drive.google.com/file/d/alumni-directory-sample"
        ))
        db.add(AttributeRecord(
            student_id=st2.id, period_id=week3_period.id, attribute_type="networking",
            title="Conversation with FMCG Brand Lead",
            contact_name="Ananya Sen", contact_role="Brand Manager",
            organization="Hindustan Unilever", conversation_date=datetime.date(2026, 10, 13),
            key_learning="Understood trade promotion budgeting and distributor channel incentives."
        ))
        db.add(AttributeRecord(
            student_id=st2.id, period_id=week3_period.id, attribute_type="networking",
            title="Conversation with Marketing Strategist",
            contact_name="Karthik N", contact_role="Marketing Director",
            organization="ITC Limited", conversation_date=datetime.date(2026, 10, 14),
            key_learning="Insights into direct-to-consumer rural expansion models."
        ))

        # Student 3 (HSB26-003): Non-Compliant / Overdue (Red on project, 0 networking, 0 LinkedIn)
        st3 = students[2]
        db.add(AttributeRecord(
            student_id=st3.id, period_id=week3_period.id, attribute_type="projects",
            title="Predictive Churn Model for Telecom Subscribers",
            description="Random forest classifier for churn prediction.",
            start_date=datetime.date(2026, 10, 1),
            planned_end_date=datetime.date(2026, 10, 14),  # Overdue relative to Oct 15
            original_planned_end_date=datetime.date(2026, 10, 14),
            current_status="In progress",
            progress_update="Feature engineering underway; delays encountered in data cleansing."
        ))
        db.add(AttributeRecord(
            student_id=st3.id, period_id=week3_period.id, attribute_type="activities",
            title="Social Responsibility Cell Volunteer",
            activity_role="Volunteer",
            start_date=datetime.date(2026, 9, 25),  # > 2 weeks ago and not initiated
            planned_end_date=datetime.date(2026, 11, 1),
            current_status="Not started",
            progress_update=""
        ))
        # Add Follow-up for Student 3
        db.add(ReviewFollowUp(
            student_id=st3.id,
            attribute_type="projects",
            reviewer_id=admin.id,
            reviewer_name=admin.full_name,
            comment="Project is past planned end date of Oct 14 without completion. Needs timeline review.",
            action_required="Submit updated timeline with realistic planned end date or proof of completion.",
            assigned_to="Prof. A. Kapoor (Placement Mentor)",
            next_review_date=datetime.date(2026, 10, 18),
            resolution_status="Pending"
        ))

        # Student 4 (HSB26-004): Scheduled future start (Not overdue, Green scheduled)
        st4 = students[3]
        db.add(AttributeRecord(
            student_id=st4.id, period_id=week3_period.id, attribute_type="projects",
            title="Supply Chain Carbon Footprint Audit",
            description="Assessing Scope 3 emissions in cold storage logistics.",
            start_date=datetime.date(2026, 10, 26),  # Future start date!
            planned_end_date=datetime.date(2026, 11, 20),
            original_planned_end_date=datetime.date(2026, 11, 20),
            current_status="Not started",
            progress_update="Project scheduled following mid-term exam completion."
        ))
        db.add(AttributeRecord(
            student_id=st4.id, period_id=week3_period.id, attribute_type="networking",
            title="Conversation with Senior Consultant",
            contact_name="Rahul Gupta", contact_role="Principal Consultant",
            organization="Bain & Company", conversation_date=datetime.date(2026, 10, 12),
            key_learning="Key frameworks for ESG due diligence in private equity transactions."
        ))

        db.commit()
        print("Database seed completed successfully! 38 students and Placement Committee accounts created.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
