import { apiRequest } from "./client";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegistrationInput = {
  full_name: string;
  email: string;
  password: string;
};

export type RegistrationResult = {
  full_name: string;
  email: string;
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

export function register(input: RegistrationInput): Promise<RegistrationResult> {
  return apiRequest<RegistrationResult>("/auth/register", {
    method: "POST",
    body: input,
  });
}
