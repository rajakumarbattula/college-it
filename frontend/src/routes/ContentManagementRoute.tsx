import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";

const privilegedRoles = new Set(["ADMIN", "FACULTY", "STAFF"]);

export function ContentManagementRoute() {
  const { role } = useAuth();
  return privilegedRoles.has(role ?? "") ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
