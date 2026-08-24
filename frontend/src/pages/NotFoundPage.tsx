import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="error-page">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/dashboard">Go to dashboard</Link>
    </main>
  );
}
