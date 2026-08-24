import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { StudentTable } from "./StudentTable";

const student = {
  id: "student-1",
  student_number: "STU-001",
  first_name: "Asha",
  last_name: "Patel",
  email: "asha.patel@college.example",
  status: "active" as const,
  department_id: "department-1",
};

describe("StudentTable", () => {
  it("renders student data and opens deletion confirmation", () => {
    const onDelete = vi.fn();
    render(
      <MemoryRouter>
        <StudentTable students={[student]} deletingStudentId={null} onDelete={onDelete} />
      </MemoryRouter>,
    );

    expect(screen.getByText("STU-001")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(student);
  });

  it("requires confirmation before deletion", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<DeleteStudentDialog student={student} isDeleting={false} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete student" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
