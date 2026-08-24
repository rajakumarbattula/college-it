import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StudentForm } from "./StudentForm";

const department = { id: "department-1", code: "CSE", name: "Computer Science", description: null };
const emptyStudent = {
  student_number: "",
  first_name: "",
  last_name: "",
  email: "",
  status: "active" as const,
  department_id: "",
};

describe("StudentForm", () => {
  it("shows client-side validation errors before submitting", () => {
    const onSubmit = vi.fn();
    render(<StudentForm initialValues={emptyStudent} departments={[department]} isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Save student" }));

    expect(screen.getByText("Student ID is required.")).toBeInTheDocument();
    expect(screen.getByText("Select a department.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits validated values", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <StudentForm
        initialValues={{
          student_number: "STU-001",
          first_name: "Asha",
          last_name: "Patel",
          email: "asha.patel@college.example",
          status: "active",
          department_id: department.id,
        }}
        departments={[department]}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save student" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ student_number: "STU-001" }));
  });
});
