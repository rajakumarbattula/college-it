import { apiRequest } from "./client";
import type { DepartmentListResponse } from "../types/department";

export function listDepartments(token: string): Promise<DepartmentListResponse> {
  return apiRequest<DepartmentListResponse>("/departments?page=1&page_size=100", { token });
}
