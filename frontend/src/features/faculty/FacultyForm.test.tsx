import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FacultyForm } from "./FacultyForm";

const department = { id: "department-1", code: "CS", name: "Computer Science", category: "VOCATIONAL" as const, description: null, active: true };

describe("FacultyForm", () => {
  it("shows client-side validation errors before submitting", () => {
    const onSubmit = vi.fn();
    render(
      <FacultyForm
        initialValues={{ employee_number: "", first_name: "", last_name: "", email: "", designation: "", department_id: "" }}
        departments={[department]}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save faculty member" }));

    expect(screen.getByText("Employee number is required.")).toBeInTheDocument();
    expect(screen.getByText("Designation is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits validated values", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <FacultyForm
        initialValues={{ employee_number: "FAC-001", first_name: "Ravi", last_name: "Shah", email: "ravi.shah@college.example", designation: "Lecturer", department_id: department.id }}
        departments={[department]}
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save faculty member" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ employee_number: "FAC-001" }));
  });
});
