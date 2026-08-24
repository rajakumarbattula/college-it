import type { StudentInput } from "../../types/student";

export type StudentFormErrors = Partial<Record<keyof StudentInput, string>>;

export function validateStudent(values: StudentInput): StudentFormErrors {
  const errors: StudentFormErrors = {};
  if (!values.student_number.trim()) errors.student_number = "Student ID is required.";
  if (!values.first_name.trim()) errors.first_name = "First name is required.";
  if (!values.last_name.trim()) errors.last_name = "Last name is required.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.department_id) errors.department_id = "Select a department.";
  return errors;
}
