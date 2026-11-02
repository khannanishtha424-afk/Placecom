import datetime
import io
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from app.models import Student, ReportingPeriod, AttributeRecord, ReviewFollowUp, DeadlineRevision, AuditLog
from app.rules_engine import RulesEngine, parse_date

class ReportingService:
    @staticmethod
    def get_batch_summary(db: Session, period: ReportingPeriod, mentor_filter: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates all batch-wide metrics for the selected reporting period.
        """
        query = db.query(Student).filter(Student.is_active == True)
        if mentor_filter:
            query = query.filter(Student.mentor_name == mentor_filter)
        students = query.all()

        evaluated_students = []
        fully_compliant = []
        partially_compliant = []
        no_targets_met = []
        awaiting_assessment = []

        attr_distribution = {
            "linkedin": {"green": 0, "yellow": 0, "red": 0},
            "projects": {"green": 0, "yellow": 0, "red": 0},
            "competitions": {"green": 0, "yellow": 0, "red": 0},
            "activities": {"green": 0, "yellow": 0, "red": 0},
            "certifications": {"green": 0, "yellow": 0, "red": 0},
            "networking": {"green": 0, "yellow": 0, "red": 0}
        }

        overdue_register = []
        initiation_register = []

        as_of_date = period.end_date if period else datetime.date.today()

        for st in students:
            # Query all student's active records
            records = db.query(AttributeRecord).filter(
                AttributeRecord.student_id == st.id,
                AttributeRecord.is_draft == False
            ).all()

            eval_res = RulesEngine.evaluate_student_period(st, period, records, as_of_date)
            evaluated_students.append(eval_res)

            # Categorize student
            cls_name = eval_res["classification"]
            if cls_name == "Fully compliant":
                fully_compliant.append(eval_res)
            elif cls_name == "Partially compliant":
                partially_compliant.append(eval_res)
            elif cls_name == "No targets met":
                no_targets_met.append(eval_res)
            else:
                awaiting_assessment.append(eval_res)

            # Update attribute distribution (only for assessed students)
            if eval_res["is_assessed"]:
                for attr_k, attr_v in eval_res["attributes"].items():
                    stat = attr_v["status"]
                    if stat in attr_distribution[attr_k]:
                        attr_distribution[attr_k][stat] += 1

            # Check for overdue items and initiation issues
            for attr_k in ["projects", "activities", "certifications"]:
                attr_data = eval_res["attributes"][attr_k]
                for item in attr_data.get("evaluations", []):
                    if item.get("days_overdue", 0) > 0 and item["status"] == "red":
                        overdue_register.append({
                            "student_id": st.id,
                            "student_code": st.student_id,
                            "student_name": st.name,
                            "attribute": attr_data["name"],
                            "record_id": item["record_id"],
                            "record_title": item["title"],
                            "days_overdue": item["days_overdue"],
                            "reason": item["reason"]
                        })
                    if not item.get("is_initiated", True) and item["status"] == "red":
                        initiation_register.append({
                            "student_id": st.id,
                            "student_code": st.student_id,
                            "student_name": st.name,
                            "attribute": attr_data["name"],
                            "record_id": item["record_id"],
                            "record_title": item["title"],
                            "reason": item["reason"]
                        })

        assessed_count = len(fully_compliant) + len(partially_compliant) + len(no_targets_met)
        total_students = len(students)
        compliance_pct = round((len(fully_compliant) / assessed_count * 100), 1) if assessed_count > 0 else 0.0

        return {
            "period": {
                "id": period.id if period else None,
                "title": period.title if period else "Current Period",
                "year": period.year if period else datetime.date.today().year,
                "month": period.month if period else datetime.date.today().month,
                "week_number": period.week_number if period else None,
                "start_date": period.start_date.isoformat() if period else None,
                "end_date": period.end_date.isoformat() if period else None,
                "status": period.status if period else "open"
            },
            "metrics": {
                "total_cohort": total_students,
                "assessed_count": assessed_count,
                "fully_compliant_count": len(fully_compliant),
                "partially_compliant_count": len(partially_compliant),
                "no_targets_met_count": len(no_targets_met),
                "awaiting_assessment_count": len(awaiting_assessment),
                "compliance_percentage": compliance_pct,
                "reconciliation_check": (assessed_count == len(fully_compliant) + len(partially_compliant) + len(no_targets_met))
            },
            "attribute_distribution": attr_distribution,
            "students": evaluated_students,
            "fully_compliant_students": fully_compliant,
            "partially_compliant_students": partially_compliant,
            "no_targets_met_students": no_targets_met,
            "awaiting_assessment_students": awaiting_assessment,
            "overdue_register": overdue_register,
            "initiation_register": initiation_register
        }

    @staticmethod
    def generate_excel_report(batch_summary: Dict[str, Any], follow_ups: List[Any]) -> bytes:
        """
        Creates a multi-tab Excel workbook containing:
        - Batch Summary
        - Student Compliance Overview
        - Overdue Register
        - Follow-ups
        """
        wb = openpyxl.Workbook()
        
        # Styles
        header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")  # Navy
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
        sub_font = Font(name="Calibri", size=11, bold=True)
        thin_border = Border(
            left=Side(style='thin', color="D1D5DB"),
            right=Side(style='thin', color="D1D5DB"),
            top=Side(style='thin', color="D1D5DB"),
            bottom=Side(style='thin', color="D1D5DB")
        )
        green_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
        yellow_fill = PatternFill(start_color="FEF9C3", end_color="FEF9C3", fill_type="solid")
        red_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")

        # --- Tab 1: Batch Summary ---
        ws1 = wb.active
        ws1.title = "Batch Summary"
        ws1["A1"] = "HSB Student Development Program (SDP) — Batch Executive Summary"
        ws1["A1"].font = title_font
        ws1["A2"] = f"Reporting Period: {batch_summary['period']['title']}"
        ws1["A2"].font = sub_font

        ws1["A4"] = "Cohort Metric"
        ws1["B4"] = "Value"
        ws1["A4"].fill = header_fill
        ws1["A4"].font = header_font
        ws1["B4"].fill = header_fill
        ws1["B4"].font = header_font

        metrics = batch_summary["metrics"]
        metric_rows = [
            ("Total Students in Cohort", metrics["total_cohort"]),
            ("Students Assessed", metrics["assessed_count"]),
            ("Fully Compliant", metrics["fully_compliant_count"]),
            ("Partially Compliant", metrics["partially_compliant_count"]),
            ("No Targets Met", metrics["no_targets_met_count"]),
            ("Awaiting Assessment", metrics["awaiting_assessment_count"]),
            ("Overall Compliance Rate", f"{metrics['compliance_percentage']}%")
        ]
        r = 5
        for k, v in metric_rows:
            ws1.cell(row=r, column=1, value=k).border = thin_border
            ws1.cell(row=r, column=2, value=v).border = thin_border
            r += 1

        # Attribute Breakdown
        r += 2
        ws1.cell(row=r, column=1, value="Attribute").font = header_font
        ws1.cell(row=r, column=1).fill = header_fill
        ws1.cell(row=r, column=2, value="Green").font = header_font
        ws1.cell(row=r, column=2).fill = header_fill
        ws1.cell(row=r, column=3, value="Yellow").font = header_font
        ws1.cell(row=r, column=3).fill = header_fill
        ws1.cell(row=r, column=4, value="Red").font = header_font
        ws1.cell(row=r, column=4).fill = header_fill

        r += 1
        for attr, counts in batch_summary["attribute_distribution"].items():
            ws1.cell(row=r, column=1, value=attr.capitalize()).border = thin_border
            c_g = ws1.cell(row=r, column=2, value=counts["green"])
            c_g.fill = green_fill
            c_g.border = thin_border
            c_y = ws1.cell(row=r, column=3, value=counts["yellow"])
            c_y.fill = yellow_fill
            c_y.border = thin_border
            c_r = ws1.cell(row=r, column=4, value=counts["red"])
            c_r.fill = red_fill
            c_r.border = thin_border
            r += 1

        # --- Tab 2: Student Compliance ---
        ws2 = wb.create_sheet(title="Student Roster Compliance")
        headers = ["Student ID", "Student Name", "Mentor", "Classification", "LinkedIn", "Projects", "Competitions", "Activities", "Certifications", "Networking", "Compliance Reason"]
        for col_num, h in enumerate(headers, 1):
            cell = ws2.cell(row=1, column=col_num, value=h)
            cell.fill = header_fill
            cell.font = header_font

        row_num = 2
        for st in batch_summary["students"]:
            ws2.cell(row=row_num, column=1, value=st["student_code"]).border = thin_border
            ws2.cell(row=row_num, column=2, value=st["student_name"]).border = thin_border
            ws2.cell(row=row_num, column=3, value=st["mentor_name"] or "").border = thin_border
            
            cls_cell = ws2.cell(row=row_num, column=4, value=st["classification"])
            cls_cell.border = thin_border
            if st["classification"] == "Fully compliant":
                cls_cell.fill = green_fill
            elif st["classification"] == "Partially compliant":
                cls_cell.fill = yellow_fill
            elif st["classification"] == "No targets met":
                cls_cell.fill = red_fill

            # 6 attributes
            attrs_order = ["linkedin", "projects", "competitions", "activities", "certifications", "networking"]
            for i, ak in enumerate(attrs_order):
                stat = st["attributes"][ak]["status"].upper()
                c = ws2.cell(row=row_num, column=5 + i, value=stat)
                c.border = thin_border
                if stat == "GREEN":
                    c.fill = green_fill
                elif stat == "YELLOW":
                    c.fill = yellow_fill
                elif stat == "RED":
                    c.fill = red_fill

            ws2.cell(row=row_num, column=11, value=st["compliance_reason"]).border = thin_border
            row_num += 1

        # --- Tab 3: Overdue Register ---
        ws3 = wb.create_sheet(title="Overdue Register")
        od_headers = ["Student Code", "Student Name", "Attribute", "Record Title", "Days Overdue", "Reason & Required Action"]
        for col_num, h in enumerate(od_headers, 1):
            cell = ws3.cell(row=1, column=col_num, value=h)
            cell.fill = header_fill
            cell.font = header_font

        od_row = 2
        for item in batch_summary["overdue_register"]:
            ws3.cell(row=od_row, column=1, value=item["student_code"]).border = thin_border
            ws3.cell(row=od_row, column=2, value=item["student_name"]).border = thin_border
            ws3.cell(row=od_row, column=3, value=item["attribute"]).border = thin_border
            ws3.cell(row=od_row, column=4, value=item["record_title"]).border = thin_border
            c_od = ws3.cell(row=od_row, column=5, value=item["days_overdue"])
            c_od.border = thin_border
            c_od.fill = red_fill
            ws3.cell(row=od_row, column=6, value=item["reason"]).border = thin_border
            od_row += 1

        # Auto-fit columns
        for sheet in [ws1, ws2, ws3]:
            for col in sheet.columns:
                max_len = max(len(str(cell.value or '')) for cell in col)
                col_letter = openpyxl.utils.get_column_letter(col[0].column)
                sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

        output = io.BytesIO()
        wb.save(output)
        return output.getvalue()
