from sqlalchemy import inspect

from app.db.base import Base
from app.models import Department, Faculty, Student, User


def test_department_relationships_link_students_and_faculty() -> None:
    department = Department(code="CSE", name="Computer Science")
    student = Student(
        student_number="STU-001",
        first_name="Asha",
        last_name="Patel",
        email="asha.patel@college.example",
    )
    faculty_member = Faculty(
        employee_number="FAC-001",
        first_name="Ravi",
        last_name="Shah",
        email="ravi.shah@college.example",
        designation="Lecturer",
    )

    department.students.append(student)
    department.faculty_members.append(faculty_member)

    assert student.department is department
    assert faculty_member.department is department
    assert department.students == [student]
    assert department.faculty_members == [faculty_member]


def test_models_define_expected_tables_constraints_and_indexes() -> None:
    assert set(Base.metadata.tables) == {
        "users",
        "departments",
        "students",
        "faculty",
        "events",
        "student_achievements",
        "notifications",
        "gallery_photos",
    }
    assert {column.name for column in User.__table__.primary_key.columns} == {"id"}
    student_foreign_key = next(iter(Student.__table__.foreign_keys))
    faculty_foreign_key = next(iter(Faculty.__table__.foreign_keys))
    assert student_foreign_key.parent.name == "department_id"
    assert faculty_foreign_key.parent.name == "department_id"
    assert student_foreign_key.ondelete == "RESTRICT"
    assert faculty_foreign_key.ondelete == "RESTRICT"
    assert "ix_students_department_id_status" in {index.name for index in Student.__table__.indexes}
    assert "ix_faculty_department_id" in {index.name for index in Faculty.__table__.indexes}


def test_models_include_audit_timestamps() -> None:
    for model in (User, Department, Student, Faculty):
        columns = {column.name for column in inspect(model).columns}
        assert {"created_at", "updated_at"}.issubset(columns)
