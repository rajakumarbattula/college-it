import { apiRequest } from "./client";
import type { Dashboard } from "../types/dashboard";

export function getDashboard(token: string): Promise<Dashboard> {
  return apiRequest<Dashboard>("/dashboard", { token });
}
