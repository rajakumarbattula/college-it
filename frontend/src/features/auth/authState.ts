import { createContext } from "react";

import type { LoginCredentials } from "../../api/auth";

export type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
