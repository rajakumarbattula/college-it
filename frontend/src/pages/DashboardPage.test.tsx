import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthContext } from "../features/auth/authState";
import { DashboardPage } from "./DashboardPage";

const dashboardResponse = {
  statistics: { total_students: 120, total_faculty: 16, total_active_departments: 4, upcoming_events: 2 },
  featured_achievements: [{ id: "achievement-1", student_id: null, student_display_name: "Anaya Mehta", title: "Science Fair Award", description: "A fictional science fair achievement.", category: "academic", achievement_date: "2026-09-01", image_url: "/demo-assets/science-fair.svg", featured: true, created_at: "2026-08-01T00:00:00Z" }],
  upcoming_events: [
    { id: "event-later", title: "Cultural Day", description: "College celebration.", event_date: "2026-10-12T10:00:00Z", location: "Auditorium", event_type: "cultural", image_url: null, featured: true, created_at: "2026-08-01T00:00:00Z" },
    { id: "event-soon", title: "Science Exhibition", description: "Student projects.", event_date: "2026-09-12T10:00:00Z", location: "Science Block", event_type: "academic", image_url: null, featured: false, created_at: "2026-08-01T00:00:00Z" },
  ],
  notifications: [{ id: "notice-1", title: "Examination Timetable", message: "The timetable is available.", published_at: "2026-09-01T00:00:00Z", expires_at: null, priority: "HIGH", active: true, created_at: "2026-09-01T00:00:00Z" }],
  gallery: [{ id: "gallery-1", event_id: null, caption: "Cultural Day rehearsal", image_url: "/demo-assets/cultural-day.svg", display_order: 1, featured: true, created_at: "2026-09-01T00:00:00Z" }],
};

function renderPage() {
  return render(<MemoryRouter><AuthContext.Provider value={{ token: "token", isAuthenticated: true, isAuthenticating: false, loginWithCredentials: vi.fn(), logout: vi.fn() }}><DashboardPage /></AuthContext.Provider></MemoryRouter>);
}

describe("DashboardPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders dashboard data, courses, and the college identity", async () => {
    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(new Response(JSON.stringify(url.includes("/dashboard") ? dashboardResponse : { items: [{ id: "cs", code: "CS", name: "Computer Science", category: "VOCATIONAL", description: null, active: true }, { id: "mpc", code: "MPC", name: "M.P.C", category: "REGULAR", description: null, active: true }], page: 1, page_size: 100, total: 2 }), { status: 200, headers: { "Content-Type": "application/json" } }))));
    renderPage();

    expect(await screen.findByText("Science Fair Award")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Affiliated to Board of Intermediate Education, Hyderabad")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vocational Courses" })).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Science Exhibition").compareDocumentPosition(screen.getByText("Cultural Day")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("opens and closes a gallery image dialog", async () => {
    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(new Response(JSON.stringify(url.includes("/dashboard") ? dashboardResponse : { items: [], page: 1, page_size: 100, total: 0 }), { status: 200, headers: { "Content-Type": "application/json" } }))));
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "View larger image: Cultural Day rehearsal" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an API error state", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ detail: "Dashboard is unavailable" }), { status: 500, headers: { "Content-Type": "application/json" } }))));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Dashboard is unavailable");
  });

  it("shows empty states when no dashboard content is available", async () => {
    const emptyDashboard = { ...dashboardResponse, featured_achievements: [], upcoming_events: [], notifications: [], gallery: [] };
    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(new Response(JSON.stringify(url.includes("/dashboard") ? emptyDashboard : { items: [], page: 1, page_size: 100, total: 0 }), { status: 200, headers: { "Content-Type": "application/json" } }))));
    renderPage();

    expect(await screen.findByText("Featured student achievements will appear here.")).toBeInTheDocument();
    expect(screen.getByText("There are no upcoming events right now.")).toBeInTheDocument();
    expect(screen.getByText("Cultural event photographs will appear here.")).toBeInTheDocument();
  });
});
