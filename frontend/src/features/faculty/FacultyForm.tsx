import { type FormEvent, type ReactNode, useState } from "react";

import type { Department } from "../../types/department";
import type { FacultyInput } from "../../types/faculty";
import { validateFaculty, type FacultyFormErrors } from "./facultyValidation";

type FacultyFormProps = {
  initialValues: FacultyInput;
  departments: Department[];
  isSubmitting: boolean;
  onSubmit: (values: FacultyInput) => Promise<void>;
};

export function FacultyForm({ initialValues, departments, isSubmitting, onSubmit }: FacultyFormProps) {
  const [values, setValues] = useState<FacultyInput>(initialValues);
  const [errors, setErrors] = useState<FacultyFormErrors>({});

  function updateValue<Key extends keyof FacultyInput>(key: Key, value: FacultyInput[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFaculty(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) await onSubmit(values);
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Employee number" error={errors.employee_number}>
        <input value={values.employee_number} onChange={(event) => updateValue("employee_number", event.target.value)} />
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
        <FormField label="Designation" error={errors.designation}>
          <input value={values.designation} onChange={(event) => updateValue("designation", event.target.value)} />
        </FormField>
        <FormField label="Department" error={errors.department_id}>
          <select value={values.department_id} onChange={(event) => updateValue("department_id", event.target.value)}>
            <option value="">Select a department</option>
            {departments.filter((department) => department.active).map((department) => <option key={department.id} value={department.id}>{department.code} — {department.name}</option>)}
          </select>
        </FormField>
      </div>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save faculty member"}</button>
    </form>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : null}
    </label>
  );
}
