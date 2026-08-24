export type Faculty = {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department_id: string;
};

export type FacultyInput = Omit<Faculty, "id">;

export type FacultyListResponse = {
  items: Faculty[];
  page: number;
  page_size: number;
  total: number;
};
