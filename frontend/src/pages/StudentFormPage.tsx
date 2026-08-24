import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import { listDepartments } from "../api/departments";
import { createStudent, getStudent, updateStudent } from "../api/students";
import { LoadingState } from "../components/LoadingState";
import { StudentForm } from "../features/students/StudentForm";
import { useAuth } from "../features/auth/useAuth";
import type { Department } from "../types/department";
import type { StudentInput } from "../types/student";

const emptyStudent: StudentInput = {
  student_number: "",
  first_name: "",
  last_name: "",
  email: "",
  status: "active",
  department_id: "",
};

export function StudentFormPage() {
  const { studentId } = useParams();
  const isEditing = studentId !== undefined;
  const { token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [initialValues, setInitialValues] = useState<StudentInput | null>(isEditing ? null : emptyStudent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormData() {
      if (token === null) return;
      setIsLoading(true);
      setError(null);
      try {
        const [departmentResponse, student] = await Promise.all([
          listDepartments(token),
          studentId ? getStudent(token, studentId) : Promise.resolve(null),
        ]);
        setDepartments(departmentResponse.items);
        if (student) {
          setInitialValues({
            student_number: student.student_number,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            status: student.status,
            department_id: student.department_id,
          });
        }
      } catch (caughtError) {
        setError(toMessage(caughtError));
      } finally {
        setIsLoading(false);
      }
    }
    void loadFormData();
  }, [studentId, token]);

  async function submitStudent(values: StudentInput) {
    if (token === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (studentId) {
        await updateStudent(token, studentId, values);
      } else {
        await createStudent(token, values);
      }
      navigate("/students");
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student management</p>
          <h1>{isEditing ? "Edit student" : "Add student"}</h1>
        </div>
        <Link className="secondary-link" to="/students">Back to students</Link>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {isLoading || initialValues === null ? <LoadingState label="Loading form..." /> : <StudentForm initialValues={initialValues} departments={departments} isSubmitting={isSubmitting} onSubmit={submitStudent} />}
    </main>
  );
}

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Unable to save the student. Please try again.";
}
