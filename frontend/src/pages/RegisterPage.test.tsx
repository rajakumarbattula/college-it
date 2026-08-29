import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RegisterPage } from "./RegisterPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

function completeForm() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Asha Reddy" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha.reddy@college.example" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "SecurePassword123!" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "SecurePassword123!" } });
}

describe("RegisterPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the registration form and login link", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Create an online account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByText("Online account registration does not by itself confirm admission or enrollment.")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });

  it("validates required values, password strength, and confirmation", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 12 characters.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Asha Reddy" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha.reddy@college.example" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "SecurePassword123!" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "DifferentPassword123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows success after registering", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ full_name: "Asha Reddy", email: "asha.reddy@college.example" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPage();
    completeForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Registration successful. Please sign in.");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          full_name: "Asha Reddy",
          email: "asha.reddy@college.example",
          password: "SecurePassword123!",
        }),
      }),
    );
  });

  it("shows registration API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "A user with the same email already exists" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    renderPage();
    completeForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("A user with the same email already exists");
  });
});
