import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthContext } from "../features/auth/authState";
import { DashboardContentAdminPage } from "./DashboardContentAdminPage";

function renderPage() {
  return render(<MemoryRouter><AuthContext.Provider value={{ token: "token", role: "ADMIN", isAuthenticated: true, isAuthenticating: false, loginWithCredentials: vi.fn(), logout: vi.fn() }}><DashboardContentAdminPage /></AuthContext.Provider></MemoryRouter>);
}

function emptyLists(url: string, options?: RequestInit) {
  if (options?.method === "POST" && url.includes("/events")) {
    return Promise.resolve(new Response(JSON.stringify({ id: "event-1", title: "Science Exhibition", description: "Student projects.", event_date: "2026-10-01T10:00:00Z", location: "Science Block", event_type: "ACADEMIC", image_url: null, featured: true, created_at: "2026-09-01T00:00:00Z" }), { status: 201, headers: { "Content-Type": "application/json" } }));
  }
  return Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } }));
}

describe("DashboardContentAdminPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("creates an event through the protected dashboard endpoint", async () => {
    const fetchMock = vi.fn(emptyLists);
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await screen.findByRole("heading", { name: "Student Achievements" });
    fireEvent.click(screen.getByRole("tab", { name: "Events" }));
    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Science Exhibition" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Student projects." } });
    fireEvent.change(screen.getByLabelText("Event date and time"), { target: { value: "2026-10-01T15:30" } });
    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "Science Block" } });
    fireEvent.click(screen.getByLabelText("Feature on dashboard"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/dashboard/events"),
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer token" }) }),
    ));
  });

  it("shows an API error when content cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(JSON.stringify({ detail: "Not authorized" }), { status: 403, headers: { "Content-Type": "application/json" } }))));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Not authorized");
  });
});
