export type Department = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type DepartmentListResponse = {
  items: Department[];
  page: number;
  page_size: number;
  total: number;
};
