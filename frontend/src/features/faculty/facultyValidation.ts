import type { FacultyInput } from "../../types/faculty";

export type FacultyFormErrors = Partial<Record<keyof FacultyInput, string>>;

export function validateFaculty(values: FacultyInput): FacultyFormErrors {
  const errors: FacultyFormErrors = {};
  if (!values.employee_number.trim()) errors.employee_number = "Employee number is required.";
  if (!values.first_name.trim()) errors.first_name = "First name is required.";
  if (!values.last_name.trim()) errors.last_name = "Last name is required.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.designation.trim()) errors.designation = "Designation is required.";
  if (!values.department_id) errors.department_id = "Select a department.";
  return errors;
}
