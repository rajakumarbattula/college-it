import { useEffect, useState } from "react";

import { listDepartments } from "../api/departments";
import { ApiError } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/useAuth";
import type { CourseCategory, Department } from "../types/department";

const categories: Array<{ category: CourseCategory; heading: string }> = [
  { category: "VOCATIONAL", heading: "Vocational Courses" },
  { category: "REGULAR", heading: "Regular Courses" },
];

export function DepartmentsPage() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void Promise.all(categories.map(({ category }) => listDepartments(token, category)))
      .then((responses) => setDepartments(responses.flatMap((response) => response.items).filter((department) => department.active)))
      .catch((caughtError: unknown) => setError(caughtError instanceof ApiError ? caughtError.message : "Unable to load courses."))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) return <LoadingState label="Loading courses..." />;
  if (error) return <p className="form-error" role="alert">{error}</p>;

  return (
    <main className="page">
      <p className="eyebrow">Academic structure</p>
      <h1>Courses</h1>
      {categories.map(({ category, heading }) => {
        const courses = departments.filter((department) => department.category === category);
        return (
          <section className="placeholder-card" key={category}>
            <h2>{heading}</h2>
            {courses.length === 0 ? <p className="muted">No active courses are available.</p> : (
              <ul className="course-list">
                {courses.map((course) => <li key={course.id}><strong>{course.code}</strong> — {course.name}</li>)}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
