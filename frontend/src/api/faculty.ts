import { apiRequest } from "./client";
import type { Faculty, FacultyInput, FacultyListResponse } from "../types/faculty";

export type FacultySearch = {
  page: number;
  pageSize: number;
  search?: string;
  searchBy: "name" | "employee_number";
};

export function listFaculty(token: string, search: FacultySearch): Promise<FacultyListResponse> {
  const query = new URLSearchParams({ page: String(search.page), page_size: String(search.pageSize) });
  if (search.search?.trim()) query.set(search.searchBy, search.search.trim());
  return apiRequest<FacultyListResponse>(`/faculty?${query.toString()}`, { token });
}

export function getFaculty(token: string, facultyId: string): Promise<Faculty> {
  return apiRequest<Faculty>(`/faculty/${facultyId}`, { token });
}

export function createFaculty(token: string, input: FacultyInput): Promise<Faculty> {
  return apiRequest<Faculty>("/faculty", { method: "POST", token, body: input });
}

export function updateFaculty(token: string, facultyId: string, input: FacultyInput): Promise<Faculty> {
  return apiRequest<Faculty>(`/faculty/${facultyId}`, { method: "PUT", token, body: input });
}

export function deleteFaculty(token: string, facultyId: string): Promise<void> {
  return apiRequest<void>(`/faculty/${facultyId}`, { method: "DELETE", token });
}
