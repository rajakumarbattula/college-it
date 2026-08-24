import { apiRequest } from "./client";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AccessToken = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export function login(credentials: LoginCredentials): Promise<AccessToken> {
  return apiRequest<AccessToken>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}
