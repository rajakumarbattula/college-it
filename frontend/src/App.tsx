import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { FacultyFormPage } from "./pages/FacultyFormPage";
import { FacultyListPage } from "./pages/FacultyListPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentFormPage } from "./pages/StudentFormPage";
import { StudentsListPage } from "./pages/StudentsListPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ContentManagementRoute } from "./routes/ContentManagementRoute";
import { DashboardContentAdminPage } from "./pages/DashboardContentAdminPage";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/students" element={<StudentsListPage />} />
                <Route path="/students/new" element={<StudentFormPage />} />
                <Route path="/students/:studentId/edit" element={<StudentFormPage />} />
                <Route path="/faculty" element={<FacultyListPage />} />
                <Route path="/faculty/new" element={<FacultyFormPage />} />
                <Route path="/faculty/:facultyId/edit" element={<FacultyFormPage />} />
                <Route element={<ContentManagementRoute />}>
                  <Route path="/admin/content" element={<DashboardContentAdminPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
