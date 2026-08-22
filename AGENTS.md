# College IT Management System - Agent Guide

## Project purpose

Build a learning-focused College IT Management System with a maintainable architecture that can evolve into a production application. The initial MVP includes authentication, a dashboard, and CRUD management for students, faculty, and departments.

Do not add scope casually. Confirm requirements before implementing features outside the MVP.

## Technology stack

- Frontend: React, TypeScript, Vite
- Backend: Python 3.12+, FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL
- Authentication: JWT
- Backend testing: pytest
- Frontend testing: Vitest
- Database migrations: Alembic
- Containers: Docker and Docker Compose
- Version control: Git
- Future deployment target: Kubernetes and OpenShift

## Repository structure

```text
college-it/
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/              # Typed HTTP client and endpoint modules
│   │   ├── components/       # Shared UI components
│   │   ├── features/         # Feature modules: auth, students, faculty, departments
│   │   ├── pages/            # Route-level pages
│   │   ├── routes/           # Routing and route guards
│   │   ├── types/            # Shared TypeScript types
│   │   └── test/             # Test helpers and setup
│   └── Dockerfile
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Versioned API routes and dependencies
│   │   ├── core/             # Settings, security, logging
│   │   ├── db/               # Database session and base definitions
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── repositories/     # Database access code
│   │   ├── schemas/          # Pydantic request and response schemas
│   │   ├── services/         # Business/application logic
│   │   └── main.py           # Application entry point
│   ├── alembic/              # Migration scripts
│   ├── tests/
│   └── Dockerfile
├── infra/                    # Docker and future Kubernetes/OpenShift assets
├── docs/                     # Architecture and operational documentation
├── docker-compose.yml
├── .env.example
└── AGENTS.md
```

Keep responsibilities separated. API routes must not contain business logic or direct database queries; place those in services and repositories respectively.

## Coding conventions

- Prefer small, cohesive modules and explicit names over clever abstractions.
- Add types for public interfaces and avoid `Any` unless unavoidable.
- Use configuration through environment variables; never hard-code environment-specific values or secrets.
- Use UTC for persisted timestamps.
- Include `created_at` and `updated_at` fields on persistent business entities.
- Keep comments focused on non-obvious decisions, constraints, or trade-offs.
- Update documentation when architectural behavior, setup, or public APIs change.

## Backend conventions

- Keep endpoints under `/api/v1`.
- Use FastAPI dependency injection for database sessions, authentication, and authorization.
- Define Pydantic schemas separately for creation, updates, and responses; never return ORM entities directly.
- Use `POST` to create resources, `GET` to read, `PATCH` for partial updates, and `DELETE` to remove resources.
- Use service classes/functions for business rules and repositories for persistence operations.
- Validate input with Pydantic and return consistent HTTP error responses.
- Hash passwords with Argon2 or bcrypt. Never store or log plaintext passwords.
- Generate and apply Alembic migrations for every schema change; do not modify database schemas manually.
- Use UUID primary keys unless a later documented decision changes this.

## Frontend conventions

- Use React function components and TypeScript throughout.
- Organize feature-specific code under `src/features/<feature-name>/`.
- Keep reusable, feature-neutral components under `src/components/`.
- Use React Router for routes and route guards for authenticated pages.
- Keep HTTP calls in typed API modules, not directly inside UI components.
- Prefer a server-state solution such as TanStack Query for API data, loading states, caching, and invalidation.
- Validate forms on the client and display accessible, field-level error messages.
- Keep pages focused on composition; extract substantial behavior into feature hooks/components.
- Do not store long-lived JWTs in local storage unless that security trade-off is explicitly documented.

## Database conventions

- PostgreSQL is the system of record.
- Initial entities: `users`, `departments`, `students`, and `faculty`.
- A student belongs to one department; a faculty member belongs to one department.
- Enforce uniqueness for user email, department code/name, student number/email, and faculty employee number/email.
- Use foreign keys and indexes for relationship and commonly-filtered fields.
- Do not delete a department while students or faculty reference it without an explicit reassignment/deletion policy.
- Use Alembic migrations as the sole schema-change mechanism.

## Testing requirements

- Add or update tests for every behavior change.
- Backend tests use pytest and should cover service logic, authentication/authorization, API validation, expected errors, and CRUD flows.
- Use an isolated test database for repository and API integration tests; do not run tests against a development or production database.
- Test migrations from an empty database in CI when migrations are introduced.
- Frontend tests use Vitest and should cover components, form validation, route guards, loading/error states, and feature-level CRUD behavior.
- Keep tests deterministic: avoid real external services, current-time dependencies, and shared mutable test state.

## Security requirements

- Treat student and faculty data as sensitive.
- Require authentication for all application endpoints except health checks and login.
- Enforce authorization centrally with role-aware dependencies; start with an `admin` role and expand deliberately.
- Keep JWT signing keys, database URLs, and credentials in secrets or environment variables only.
- Use short-lived access tokens. For refresh tokens, prefer Secure, HttpOnly, SameSite cookies.
- Configure CORS to permit only known frontend origins per environment.
- Validate all input and avoid exposing stack traces, SQL details, tokens, or personal data in errors/logs.
- Use parameterized SQLAlchemy queries; never build SQL from user input.
- Do not commit `.env` files, credentials, private keys, production data, or generated access tokens.

## Docker requirements

- Provide separate Dockerfiles for `frontend` and `backend`.
- Docker Compose should run frontend, backend, and PostgreSQL for local development.
- Use named volumes for PostgreSQL data in local Docker environments.
- Containers must read configuration from environment variables.
- Use multi-stage builds for production images where practical.
- Do not embed secrets in Dockerfiles, images, compose files, or client-side bundles.
- Keep application containers stateless so they can run as replicated Kubernetes/OpenShift workloads.

## Git conventions

- Keep commits focused and logically scoped.
- Prefer Conventional Commit-style messages, for example: `feat(students): add create endpoint`.
- Do not commit build outputs, virtual environments, dependency caches, `.env` files, or database volumes.
- Do not overwrite, revert, or discard unrelated working-tree changes.
- Run relevant formatting, linting, type checks, and tests before considering work complete.

## Rules for making changes

- Inspect relevant existing code and this file before editing.
- Make the smallest change that fulfills the requested requirement.
- Do not create application code, dependencies, or infrastructure files until explicitly requested.
- Preserve the layered backend architecture and feature-based frontend architecture.
- Add migrations and tests with database or behavior changes.
- Update `.env.example`, documentation, and Docker configuration when configuration requirements change.
- Flag ambiguous domain decisions rather than silently inventing irreversible behavior.
- Avoid destructive Git and filesystem commands unless explicitly authorized.

## Commands

These commands become available after the project scaffolding and dependency manifests are added.

### Run the application

```powershell
# Full local stack
docker compose up --build

# Backend local development
cd backend
uv run uvicorn app.main:app --reload

# Frontend local development
cd frontend
npm run dev
```

### Run tests

```powershell
# Backend
cd backend
uv run pytest

# Frontend
cd frontend
npm run test

# Frontend one-time test run for CI
npm run test -- --run
```

### Database migrations

```powershell
cd backend
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "describe change"
```
