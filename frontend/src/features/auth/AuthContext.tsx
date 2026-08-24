import { useCallback, useMemo, useState, type ReactNode } from "react";

import { login, type LoginCredentials } from "../../api/auth";
import { AuthContext } from "./authState";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loginWithCredentials = useCallback(async (credentials: LoginCredentials) => {
    setIsAuthenticating(true);
    try {
      const response = await login(credentials);
      setToken(response.access_token);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => setToken(null), []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: token !== null,
      isAuthenticating,
      loginWithCredentials,
      logout,
    }),
    [isAuthenticating, loginWithCredentials, logout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
