# Architecture

## Current phase

Phase 1 establishes the project skeleton. It intentionally contains no authentication or student, faculty, or department business functionality.

## Application boundaries

```text
React + Vite frontend -> FastAPI API -> PostgreSQL
```

The backend follows route, service, repository, model, and schema boundaries. Future REST endpoints are versioned under `/api/v1`.

## Initial deployment shape

Docker Compose runs three local services:

- `frontend`: Vite development server
- `backend`: FastAPI development server
- `database`: PostgreSQL 16

The frontend and backend are stateless containers. PostgreSQL data is held in a named Docker volume, which is suitable for local development only. Production PostgreSQL should be managed externally when deploying to Kubernetes or OpenShift.
