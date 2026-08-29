# College IT Management System

A learning-focused College IT Management System with a React frontend, FastAPI backend, and PostgreSQL database.

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

## Bootstrap the first administrator

After applying database migrations, create the initial administrator through the
password-prompting CLI. Public registration is intentionally unavailable.

```powershell
docker compose exec backend uv run python -m app.cli.create_admin --email admin@college.example
```

## Public student registration

Visitors can create a least-privileged student account at `/register`. Public
registration never accepts a role or other administrative fields. Only an
administrator can assign `ADMIN`, `STAFF`, or `FACULTY` roles.

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
