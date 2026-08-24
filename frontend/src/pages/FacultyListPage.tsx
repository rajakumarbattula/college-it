import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import { deleteFaculty, listFaculty, type FacultySearch } from "../api/faculty";
import { LoadingState } from "../components/LoadingState";
import { DeleteFacultyDialog } from "../features/faculty/DeleteFacultyDialog";
import { FacultyTable } from "../features/faculty/FacultyTable";
import { useAuth } from "../features/auth/useAuth";
import type { Faculty } from "../types/faculty";

const pageSize = 10;

export function FacultyListPage() {
  const { token } = useAuth();
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<FacultySearch["searchBy"]>("name");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  const loadFaculty = useCallback(async () => {
    if (token === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await listFaculty(token, { page, pageSize, search: activeSearch, searchBy });
      setFacultyMembers(response.items);
      setTotal(response.total);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [activeSearch, page, searchBy, token]);

  useEffect(() => { void loadFaculty(); }, [loadFaculty]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm);
  }

  async function confirmDelete() {
    if (token === null || facultyToDelete === null) return;
    setDeletingFacultyId(facultyToDelete.id);
    setError(null);
    try {
      await deleteFaculty(token, facultyToDelete.id);
      setFacultyToDelete(null);
      if (facultyMembers.length === 1 && page > 1) setPage((current) => current - 1);
      else await loadFaculty();
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setDeletingFacultyId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="page">
      <div className="page-header">
        <div><p className="eyebrow">Management</p><h1>Faculty</h1><p className="muted">Maintain faculty records and departmental assignments.</p></div>
        <Link className="primary-link" to="/faculty/new">Add faculty member</Link>
      </div>
      <form className="search-form" onSubmit={submitSearch}>
        <label><span className="visually-hidden">Search faculty</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={searchBy === "name" ? "Search by name" : "Search by employee number"} /></label>
        <label><span className="visually-hidden">Search field</span><select value={searchBy} onChange={(event) => setSearchBy(event.target.value as FacultySearch["searchBy"])}><option value="name">Name</option><option value="employee_number">Employee number</option></select></label>
        <button type="submit">Search</button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {isLoading ? <LoadingState label="Loading faculty..." /> : <FacultyTable facultyMembers={facultyMembers} deletingFacultyId={deletingFacultyId} onDelete={setFacultyToDelete} />}
      <nav className="pagination" aria-label="Faculty pagination">
        <button type="button" className="secondary-button" onClick={() => setPage((current) => current - 1)} disabled={page === 1 || isLoading}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="secondary-button" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages || isLoading}>Next</button>
      </nav>
      <DeleteFacultyDialog facultyMember={facultyToDelete} isDeleting={deletingFacultyId !== null} onCancel={() => setFacultyToDelete(null)} onConfirm={() => void confirmDelete()} />
    </main>
  );
}

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Unable to load faculty. Please try again.";
}
