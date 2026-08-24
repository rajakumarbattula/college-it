import { Link } from "react-router-dom";

import type { Student } from "../../types/student";

type StudentTableProps = {
  students: Student[];
  deletingStudentId: string | null;
  onDelete: (student: Student) => void;
};

export function StudentTable({ students, deletingStudentId, onDelete }: StudentTableProps) {
  if (students.length === 0) {
    return <p className="empty-state">No students found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Student ID</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.student_number}</td>
              <td>{student.first_name} {student.last_name}</td>
              <td>{student.email}</td>
              <td><span className={`status-badge ${student.status}`}>{student.status}</span></td>
              <td className="table-actions">
                <Link to={`/students/${student.id}/edit`}>Edit</Link>
                <button
                  className="text-button danger"
                  type="button"
                  onClick={() => onDelete(student)}
                  disabled={deletingStudentId === student.id}
                >
                  {deletingStudentId === student.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
