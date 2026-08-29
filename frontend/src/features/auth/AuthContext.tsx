import { useCallback, useMemo, useState, type ReactNode } from "react";

import { login, type LoginCredentials } from "../../api/auth";
import { AuthContext, type UserRole } from "./authState";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loginWithCredentials = useCallback(async (credentials: LoginCredentials) => {
    setIsAuthenticating(true);
    try {
      const response = await login(credentials);
      setToken(response.access_token);
      setRole(getRole(response.access_token));
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => { setToken(null); setRole(null); }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: token !== null,
      isAuthenticating,
      loginWithCredentials,
      logout,
    }),
    [isAuthenticating, loginWithCredentials, logout, role, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function getRole(token: string): UserRole | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { role?: string };
    return ["ADMIN", "FACULTY", "STAFF", "STUDENT"].includes(decoded.role ?? "") ? decoded.role as UserRole : null;
  } catch {
    return null;
  }
}
