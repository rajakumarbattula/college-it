import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, "", "/");
  });

  it("redirects an unauthenticated visitor to the login page", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("signs in and shows the dashboard", async () => {
    window.history.pushState({}, "", "/login");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ access_token: "test-token", token_type: "bearer", expires_in: 1800 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@college.example" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "SecurePassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Science Wing Junior College/i })).toBeInTheDocument();
    });
  });

  it("shows an API login error", async () => {
    window.history.pushState({}, "", "/login");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Invalid email or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@college.example" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "incorrect" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });

  it("shows dashboard content administration to an administrator token", async () => {
    window.history.pushState({}, "", "/login");
    const token = `header.${btoa(JSON.stringify({ role: "admin" }))}.signature`;
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("/auth/login")) {
        return Promise.resolve(new Response(JSON.stringify({ access_token: token, token_type: "bearer", expires_in: 1800 }), { status: 200, headers: { "Content-Type": "application/json" } }));
      }
      if (url.includes("/dashboard")) {
        return Promise.resolve(new Response(JSON.stringify({ statistics: { total_students: 0, total_faculty: 0, total_active_departments: 0, upcoming_events: 0 }, featured_achievements: [], upcoming_events: [], notifications: [], gallery: [] }), { status: 200, headers: { "Content-Type": "application/json" } }));
      }
      return Promise.resolve(new Response(JSON.stringify({ items: [], page: 1, page_size: 100, total: 0 }), { status: 200, headers: { "Content-Type": "application/json" } }));
    }));

    render(<App />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@college.example" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "SecurePassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("link", { name: "Dashboard content" })).toHaveAttribute("href", "/admin/content");
  });
});
