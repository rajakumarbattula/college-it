export type StudentStatus = "active" | "inactive" | "graduated";

export type Student = {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: StudentStatus;
  department_id: string;
};

export type StudentInput = Omit<Student, "id">;

export type StudentListResponse = {
  items: Student[];
  page: number;
  page_size: number;
  total: number;
};
