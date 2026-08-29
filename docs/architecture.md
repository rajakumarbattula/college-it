# Science Wing Junior College — Architecture

Science Wing Junior College, Karimnagar is affiliated to the Board of
Intermediate Education, Hyderabad. This learning project is structured so it
can evolve into a production application.

## Application boundaries

```text
React + TypeScript + Vite frontend
             |
       FastAPI /api/v1
             |
       PostgreSQL + Alembic
```

The backend separates versioned routes, dependency-based authentication and
authorization, services, repositories, SQLAlchemy models, and Pydantic
schemas. The frontend keeps route-level pages, typed API clients, shared
components, and feature modules separate.

## Current capabilities

- Public online account registration and JWT login/logout.
- `STUDENT` is the fixed, least-privileged public-registration role. A public
  account does not create or confirm an official student enrollment record.
- Administrator-managed privileged roles: `ADMIN`, `STAFF`, and `FACULTY`.
- Protected student, faculty, and course/department management.
- Course categories `VOCATIONAL` and `REGULAR`, with seeded CS, EE, M.P.C, and
  Bi.P.C course offerings.
- A dashboard aggregation API and responsive frontend covering statistics,
  achievements, events, notifications, gallery items, and course overview.
- Privileged dashboard-content management for achievements, events,
  notifications, and gallery photos.

## Persistence and migrations

PostgreSQL is the system of record. Alembic is the only supported schema-change
mechanism. Core entities are users, departments, students, faculty, student
achievements, events, notifications, and gallery photos. Foreign keys,
uniqueness constraints, indexes, and UTC timestamps support integrity and
common query paths.

## Local and deployment shape

Docker Compose runs Vite, FastAPI, and PostgreSQL locally. The backend applies
migrations before it starts. Docker images are stateless; PostgreSQL uses a
named local-development volume.

Kubernetes/OpenShift manifests deploy the frontend behind an OpenShift Route,
with the frontend proxying `/api/` to the internal backend service. The bundled
PostgreSQL StatefulSet is suitable for learning or development only. Production
deployments should use a managed or operator-managed PostgreSQL service with
backups and high availability.
