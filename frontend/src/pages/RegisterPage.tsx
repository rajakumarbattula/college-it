import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/auth";
import { ApiError } from "../api/client";

type RegistrationErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

const minimumPasswordLength = 12;

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!isRegistered) {
      return undefined;
    }
    const redirectTimer = window.setTimeout(() => navigate("/login", { replace: true }), 1_500);
    return () => window.clearTimeout(redirectTimer);
  }, [isRegistered, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateRegistration({ fullName, email, password, confirmPassword });
    setErrors(validationErrors);
    setError(null);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ full_name: fullName.trim(), email: email.trim(), password });
      setIsRegistered(true);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Unable to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <p className="eyebrow">College IT Management System</p>
        <h1>Create student account</h1>
        <p className="muted">Register with your name, email address, and a secure password.</p>
        {isRegistered ? <p className="form-success" role="status">Registration successful. Redirecting to login...</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <label htmlFor="full-name">Full name</label>
        <input
          id="full-name"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          aria-describedby={errors.fullName ? "full-name-error" : undefined}
        />
        {errors.fullName ? <p className="field-error" id="full-name-error">{errors.fullName}</p> : null}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? <p className="field-error" id="email-error">{errors.email}</p> : null}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password ? <p className="field-error" id="password-error">{errors.password}</p> : null}
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
        />
        {errors.confirmPassword ? <p className="field-error" id="confirm-password-error">{errors.confirmPassword}</p> : null}
        <button type="submit" disabled={isSubmitting || isRegistered}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </main>
  );
}

function validateRegistration(values: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (values.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = "Enter your full name.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.password.length < minimumPasswordLength) {
    errors.password = `Password must be at least ${minimumPasswordLength} characters.`;
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}
