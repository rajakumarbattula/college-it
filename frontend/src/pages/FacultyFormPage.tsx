import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import { listDepartments } from "../api/departments";
import { createFaculty, getFaculty, updateFaculty } from "../api/faculty";
import { LoadingState } from "../components/LoadingState";
import { FacultyForm } from "../features/faculty/FacultyForm";
import { useAuth } from "../features/auth/useAuth";
import type { Department } from "../types/department";
import type { FacultyInput } from "../types/faculty";

const emptyFaculty: FacultyInput = { employee_number: "", first_name: "", last_name: "", email: "", designation: "", department_id: "" };

export function FacultyFormPage() {
  const { facultyId } = useParams();
  const isEditing = facultyId !== undefined;
  const { token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [initialValues, setInitialValues] = useState<FacultyInput | null>(isEditing ? null : emptyFaculty);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormData() {
      if (token === null) return;
      setIsLoading(true);
      setError(null);
      try {
        const [departmentResponse, facultyMember] = await Promise.all([
          listDepartments(token),
          facultyId ? getFaculty(token, facultyId) : Promise.resolve(null),
        ]);
        setDepartments(departmentResponse.items);
        if (facultyMember) {
          setInitialValues({ employee_number: facultyMember.employee_number, first_name: facultyMember.first_name, last_name: facultyMember.last_name, email: facultyMember.email, designation: facultyMember.designation, department_id: facultyMember.department_id });
        }
      } catch (caughtError) {
        setError(toMessage(caughtError));
      } finally {
        setIsLoading(false);
      }
    }
    void loadFormData();
  }, [facultyId, token]);

  async function submitFaculty(values: FacultyInput) {
    if (token === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (facultyId) await updateFaculty(token, facultyId, values);
      else await createFaculty(token, values);
      navigate("/faculty");
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header"><div><p className="eyebrow">Faculty management</p><h1>{isEditing ? "Edit faculty member" : "Add faculty member"}</h1></div><Link className="secondary-link" to="/faculty">Back to faculty</Link></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {isLoading || initialValues === null ? <LoadingState label="Loading form..." /> : <FacultyForm initialValues={initialValues} departments={departments} isSubmitting={isSubmitting} onSubmit={submitFaculty} />}
    </main>
  );
}

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Unable to save the faculty member. Please try again.";
}
