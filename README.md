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

See [docs/architecture.md](docs/architecture.md) for the initial architecture.
