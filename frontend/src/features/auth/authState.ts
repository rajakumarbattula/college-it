import { createContext } from "react";

import type { LoginCredentials } from "../../api/auth";

export type UserRole = "ADMIN" | "FACULTY" | "STAFF" | "STUDENT";

export type AuthContextValue = {
  token: string | null;
  role?: UserRole | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
