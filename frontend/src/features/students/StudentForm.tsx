import { type FormEvent, type ReactNode, useState } from "react";

import type { Department } from "../../types/department";
import type { StudentInput, StudentStatus } from "../../types/student";
import { validateStudent, type StudentFormErrors } from "./studentValidation";

type StudentFormProps = {
  initialValues: StudentInput;
  departments: Department[];
  isSubmitting: boolean;
  onSubmit: (values: StudentInput) => Promise<void>;
};

const statusOptions: StudentStatus[] = ["active", "inactive", "graduated"];

export function StudentForm({ initialValues, departments, isSubmitting, onSubmit }: StudentFormProps) {
  const [values, setValues] = useState<StudentInput>(initialValues);
  const [errors, setErrors] = useState<StudentFormErrors>({});

  function updateValue<Key extends keyof StudentInput>(key: Key, value: StudentInput[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateStudent(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      await onSubmit(values);
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Student ID" error={errors.student_number}>
        <input value={values.student_number} onChange={(event) => updateValue("student_number", event.target.value)} />
      </FormField>
      <div className="form-grid">
        <FormField label="First name" error={errors.first_name}>
          <input value={values.first_name} onChange={(event) => updateValue("first_name", event.target.value)} />
        </FormField>
        <FormField label="Last name" error={errors.last_name}>
          <input value={values.last_name} onChange={(event) => updateValue("last_name", event.target.value)} />
        </FormField>
      </div>
      <FormField label="College email" error={errors.email}>
        <input type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} />
      </FormField>
      <div className="form-grid">
        <FormField label="Department" error={errors.department_id}>
          <select value={values.department_id} onChange={(event) => updateValue("department_id", event.target.value)}>
            <option value="">Select a department</option>
            {departments.filter((department) => department.active).map((department) => <option key={department.id} value={department.id}>{department.code} — {department.name}</option>)}
          </select>
        </FormField>
        <FormField label="Status" error={errors.status}>
          <select value={values.status} onChange={(event) => updateValue("status", event.target.value as StudentStatus)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </FormField>
      </div>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save student"}</button>
    </form>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const fieldId = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : null}
    </label>
  );
}
