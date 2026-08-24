import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { DeleteFacultyDialog } from "./DeleteFacultyDialog";
import { FacultyTable } from "./FacultyTable";

const facultyMember = { id: "faculty-1", employee_number: "FAC-001", first_name: "Ravi", last_name: "Shah", email: "ravi.shah@college.example", designation: "Lecturer", department_id: "department-1" };

describe("FacultyTable", () => {
  it("renders a faculty member and delegates deletion", () => {
    const onDelete = vi.fn();
    render(<MemoryRouter><FacultyTable facultyMembers={[facultyMember]} deletingFacultyId={null} onDelete={onDelete} /></MemoryRouter>);

    expect(screen.getByText("FAC-001")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(facultyMember);
  });

  it("requires an explicit delete confirmation", () => {
    const onConfirm = vi.fn();
    render(<DeleteFacultyDialog facultyMember={facultyMember} isDeleting={false} onCancel={vi.fn()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete faculty member" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
