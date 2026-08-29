import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";

export function AppLayout() {
  const navigate = useNavigate();
  const { logout, role } = useAuth();
  const canManageDashboard = role === "ADMIN" || role === "FACULTY" || role === "STAFF";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="/dashboard" aria-label="Science Wing Junior College dashboard">
          <span className="brand-name">Science Wing Junior College</span>
          <span className="brand-location">Karimnagar</span>
          <span className="brand-affiliation">Affiliated to Board of Intermediate Education, Hyderabad</span>
        </a>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Dashboard
          </NavLink>
          <p className="nav-section-label">Management</p>
          <NavLink to="/students" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Students
          </NavLink>
          <NavLink to="/faculty" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Faculty
          </NavLink>
          <NavLink to="/departments" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Courses
          </NavLink>
          {canManageDashboard ? <><p className="nav-section-label">Administration</p><NavLink to="/admin/content" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Dashboard content</NavLink></> : null}
        </nav>
        <button className="logout-button" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </aside>
      <section className="app-content">
        <Outlet />
        <footer className="app-footer">Science Wing Junior College, Karimnagar</footer>
      </section>
    </div>
  );
}
