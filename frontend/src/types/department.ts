export type CourseCategory = "VOCATIONAL" | "REGULAR";

export type Department = {
  id: string;
  code: string;
  name: string;
  category: CourseCategory;
  description: string | null;
  active: boolean;
};

export type DepartmentListResponse = {
  items: Department[];
  page: number;
  page_size: number;
  total: number;
};
