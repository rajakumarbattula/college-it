import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AuthContext } from "../features/auth/authState";
import { ContentManagementRoute } from "./ContentManagementRoute";

function renderRoute(role: "ADMIN" | "STUDENT") {
  render(<MemoryRouter initialEntries={["/admin/content"]}><AuthContext.Provider value={{ token: "token", role, isAuthenticated: true, isAuthenticating: false, loginWithCredentials: vi.fn(), logout: vi.fn() }}><Routes><Route path="/dashboard" element={<p>Dashboard</p>} /><Route element={<ContentManagementRoute />}><Route path="/admin/content" element={<p>Content management</p>} /></Route></Routes></AuthContext.Provider></MemoryRouter>);
}

describe("ContentManagementRoute", () => {
  it("allows a privileged role", () => {
    renderRoute("ADMIN");
    expect(screen.getByText("Content management")).toBeInTheDocument();
  });

  it("redirects a student role", () => {
    renderRoute("STUDENT");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
