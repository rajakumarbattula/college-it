import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import { deleteStudent, listStudents, type StudentSearch } from "../api/students";
import { LoadingState } from "../components/LoadingState";
import { DeleteStudentDialog } from "../features/students/DeleteStudentDialog";
import { StudentTable } from "../features/students/StudentTable";
import { useAuth } from "../features/auth/useAuth";
import type { Student } from "../types/student";

const pageSize = 10;

export function StudentsListPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<StudentSearch["searchBy"]>("name");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (token === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await listStudents(token, {
        page,
        pageSize,
        search: activeSearch,
        searchBy,
      });
      setStudents(response.items);
      setTotal(response.total);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [activeSearch, page, searchBy, token]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm);
  }

  async function confirmDelete() {
    if (token === null || studentToDelete === null) return;
    setDeletingStudentId(studentToDelete.id);
    setError(null);
    try {
      await deleteStudent(token, studentToDelete.id);
      setStudentToDelete(null);
      if (students.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadStudents();
      }
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setDeletingStudentId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>Students</h1>
          <p className="muted">Create, find, update, and remove student records.</p>
        </div>
        <Link className="primary-link" to="/students/new">Add student</Link>
      </div>
      <form className="search-form" onSubmit={submitSearch}>
        <label>
          <span className="visually-hidden">Search students</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchBy === "name" ? "Search by name" : "Search by student ID"}
          />
        </label>
        <label>
          <span className="visually-hidden">Search field</span>
          <select value={searchBy} onChange={(event) => setSearchBy(event.target.value as StudentSearch["searchBy"])}>
            <option value="name">Name</option>
            <option value="student_number">Student ID</option>
          </select>
        </label>
        <button type="submit">Search</button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {isLoading ? <LoadingState label="Loading students..." /> : <StudentTable students={students} deletingStudentId={deletingStudentId} onDelete={setStudentToDelete} />}
      <nav className="pagination" aria-label="Student pagination">
        <button type="button" className="secondary-button" onClick={() => setPage((current) => current - 1)} disabled={page === 1 || isLoading}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="secondary-button" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages || isLoading}>Next</button>
      </nav>
      <DeleteStudentDialog student={studentToDelete} isDeleting={deletingStudentId !== null} onCancel={() => setStudentToDelete(null)} onConfirm={() => void confirmDelete()} />
    </main>
  );
}

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Unable to load students. Please try again.";
}
