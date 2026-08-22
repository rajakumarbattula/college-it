# College IT Management System

A learning-focused College IT Management System designed with a production-ready path. Phase 1 provides the React/FastAPI/PostgreSQL project foundation only; domain functionality is not implemented yet.

## Prerequisites

- Docker Desktop with Docker Compose, or
- Node.js 20+, Python 3.12+, and [uv](https://docs.astral.sh/uv/)

## Local configuration

Copy `.env.example` to `.env` and replace the placeholder secrets before running the stack.

## Run with Docker

```powershell
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8000/health`
- Backend API documentation: `http://localhost:8000/docs`

## Run tests

```powershell
cd backend
uv run pytest

cd ../frontend
npm run test -- --run
```

See [docs/architecture.md](docs/architecture.md) for the initial architecture.
