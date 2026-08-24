import { Link } from "react-router-dom";

import type { Faculty } from "../../types/faculty";

type FacultyTableProps = {
  facultyMembers: Faculty[];
  deletingFacultyId: string | null;
  onDelete: (facultyMember: Faculty) => void;
};

export function FacultyTable({ facultyMembers, deletingFacultyId, onDelete }: FacultyTableProps) {
  if (facultyMembers.length === 0) return <p className="empty-state">No faculty members found.</p>;

  return (
    <div className="table-wrapper">
      <table>
        <thead><tr><th scope="col">Employee no.</th><th scope="col">Name</th><th scope="col">Designation</th><th scope="col">Email</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
        <tbody>
          {facultyMembers.map((facultyMember) => (
            <tr key={facultyMember.id}>
              <td>{facultyMember.employee_number}</td>
              <td>{facultyMember.first_name} {facultyMember.last_name}</td>
              <td>{facultyMember.designation}</td>
              <td>{facultyMember.email}</td>
              <td className="table-actions">
                <Link to={`/faculty/${facultyMember.id}/edit`}>Edit</Link>
                <button className="text-button danger" type="button" onClick={() => onDelete(facultyMember)} disabled={deletingFacultyId === facultyMember.id}>
                  {deletingFacultyId === facultyMember.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
