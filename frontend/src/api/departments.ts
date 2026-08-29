import { apiRequest } from "./client";
import type { CourseCategory, DepartmentListResponse } from "../types/department";

export function listDepartments(token: string, category?: CourseCategory): Promise<DepartmentListResponse> {
  const categoryQuery = category ? `&category=${category}` : "";
  return apiRequest<DepartmentListResponse>(`/departments?page=1&page_size=100${categoryQuery}`, { token });
}
