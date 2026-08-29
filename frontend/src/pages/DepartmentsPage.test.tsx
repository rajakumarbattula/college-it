import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthContext } from "../features/auth/authState";
import { DepartmentsPage } from "./DepartmentsPage";

describe("DepartmentsPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("groups active courses by category", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "cs", code: "CS", name: "Computer Science", category: "VOCATIONAL", description: null, active: true }], page: 1, page_size: 100, total: 1 })))
        .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "mpc", code: "MPC", name: "M.P.C", category: "REGULAR", description: null, active: true }], page: 1, page_size: 100, total: 1 }))),
    );
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ token: "token", isAuthenticated: true, isAuthenticating: false, loginWithCredentials: vi.fn(), logout: vi.fn() }}>
          <DepartmentsPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Vocational Courses" })).toBeInTheDocument();
    expect(screen.getByText("CS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Regular Courses" })).toBeInTheDocument();
    expect(screen.getByText("MPC")).toBeInTheDocument();
  });
});
