import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";

const managementItems = ["Students", "Faculty", "Departments"];

export function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <a className="brand" href="/dashboard">
          College IT
        </a>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Dashboard
          </NavLink>
          <p className="nav-section-label">Management</p>
          {managementItems.map((item) => (
            <span className="nav-link disabled" key={item} aria-disabled="true">
              {item}
              <small>Coming soon</small>
            </span>
          ))}
        </nav>
        <button className="logout-button" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </aside>
      <section className="app-content">
        <Outlet />
      </section>
    </div>
  );
}
