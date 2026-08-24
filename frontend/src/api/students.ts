import { apiRequest } from "./client";
import type { Student, StudentInput, StudentListResponse } from "../types/student";

export type StudentSearch = {
  page: number;
  pageSize: number;
  search?: string;
  searchBy: "name" | "student_number";
};

export function listStudents(token: string, search: StudentSearch): Promise<StudentListResponse> {
  const query = new URLSearchParams({
    page: String(search.page),
    page_size: String(search.pageSize),
  });
  if (search.search?.trim()) {
    query.set(search.searchBy, search.search.trim());
  }
  return apiRequest<StudentListResponse>(`/students?${query.toString()}`, { token });
}

export function getStudent(token: string, studentId: string): Promise<Student> {
  return apiRequest<Student>(`/students/${studentId}`, { token });
}

export function createStudent(token: string, input: StudentInput): Promise<Student> {
  return apiRequest<Student>("/students", { method: "POST", token, body: input });
}

export function updateStudent(token: string, studentId: string, input: StudentInput): Promise<Student> {
  return apiRequest<Student>(`/students/${studentId}`, { method: "PUT", token, body: input });
}

export function deleteStudent(token: string, studentId: string): Promise<void> {
  return apiRequest<void>(`/students/${studentId}`, { method: "DELETE", token });
}
