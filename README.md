# Science Wing Junior College IT Management System

A learning-focused system for Science Wing Junior College, Karimnagar,
affiliated to the Board of Intermediate Education, Hyderabad. It uses a React
frontend, FastAPI backend, and PostgreSQL database.

## Prerequisites

- Docker Desktop with Docker Compose, or
- Node.js 20+, Python 3.12+, and [uv](https://docs.astral.sh/uv/)

## Local configuration

Copy `.env.example` to `.env` and replace every placeholder password and JWT secret. Docker Compose deliberately refuses to start without the required database and JWT settings.

## Run with Docker

```powershell
docker compose up --build
```

The backend waits for PostgreSQL, applies Alembic migrations, and then starts the API. The frontend waits for the backend health check.

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8000/health`
- Backend API documentation: `http://localhost:8000/docs`

Stop the stack with:

```powershell
docker compose down
```

## Run tests

```powershell
cd backend
uv run pytest

cd ../frontend
npm run test -- --run
```

## Run end-to-end tests

Start the local stack and seed fictional dashboard data first. The suite uses
real browser workflows and requires a pre-created local administrator account.
Set these values only in your uncommitted `.env` file:

```text
E2E_BASE_URL=http://localhost:5173
E2E_ADMIN_EMAIL=your-local-admin-email
E2E_ADMIN_PASSWORD=your-local-admin-password
E2E_PUBLIC_PASSWORD=a-separate-local-test-password
```

Install Chromium once, then run either mode:

```powershell
cd frontend
npx playwright install chromium
npm run test:e2e
npm run test:e2e:headed
```

The suite uses generated fictional data and removes the dashboard records and
official student records it creates. Public accounts cannot yet be removed via
the UI or API, so each registration test account is intentionally retained and
uses a unique `example.invalid` address.

## Bootstrap the first administrator

After applying database migrations, create the initial administrator through the
password-prompting CLI.

```powershell
docker compose exec backend uv run python -m app.cli.create_admin --email admin@college.example
```

## Public online account registration

Visitors can create a least-privileged `STUDENT` account at `/register`. Public
registration never accepts a role or other administrative fields, and it does
not create or confirm an official student enrollment record. Only an
administrator can assign `ADMIN`, `STAFF`, or `FACULTY` roles.

## Development demo data

After migrations have created the course and dashboard tables, seed the
fictional development dataset with:

```powershell
cd backend
uv run python -m app.scripts.seed_demo_data
```

For a running Docker Compose stack:

```powershell
docker compose exec backend uv run python -m app.scripts.seed_demo_data
```

The command is idempotent for its fixed sample records, creates no credentials,
and refuses to run when `APP_ENV` is `production` or `prod`. Gallery images use
local generic SVG assets under `frontend/public/demo-assets/`.

See [docs/architecture.md](docs/architecture.md) for the initial architecture.

## Kubernetes / OpenShift manifests

Deployment templates are in `k8s/`. Before applying them, replace every image
reference in the deployment files and every `REPLACE_WITH` value in
`k8s/secrets.yaml` through your deployment secret manager. The frontend
production image proxies `/api/` requests to the internal backend service, so
the OpenShift Route exposes only the frontend.

```powershell
kubectl apply -f k8s/
# Or, on OpenShift:
oc apply -f k8s/
```

The included PostgreSQL StatefulSet is intended for development or learning
environments. Use a managed PostgreSQL service or an operator-managed database
with backups and high availability for production.
