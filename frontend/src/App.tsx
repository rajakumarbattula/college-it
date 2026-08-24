import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./features/auth/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { FacultyFormPage } from "./pages/FacultyFormPage";
import { FacultyListPage } from "./pages/FacultyListPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudentFormPage } from "./pages/StudentFormPage";
import { StudentsListPage } from "./pages/StudentsListPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/students" element={<StudentsListPage />} />
                <Route path="/students/new" element={<StudentFormPage />} />
                <Route path="/students/:studentId/edit" element={<StudentFormPage />} />
                <Route path="/faculty" element={<FacultyListPage />} />
                <Route path="/faculty/new" element={<FacultyFormPage />} />
                <Route path="/faculty/:facultyId/edit" element={<FacultyFormPage />} />
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
