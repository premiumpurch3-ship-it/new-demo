# FZ247 Deploy Hub — Architecture

```text
Browser
  |
  v
Vercel / Next.js
  |
  +-- App Router UI
  |
  +-- Server API Routes
        |
        +-- Auth/session
        +-- Clients
        +-- Projects
        +-- Deployments
        +-- Health
        |
        +----> PostgreSQL
        |
        +----> Vercel REST API (optional)
```

## Control plane

FZ247 Deploy Hub is the control plane. PostgreSQL stores:

- administrators
- clients
- projects
- deployment attempts

The actual client application can be hosted by Vercel or another provider.

## Security boundary

Secrets live only on the server:

- DATABASE_URL
- AUTH_SECRET
- VERCEL_TOKEN
- VERCEL_TEAM_ID

The browser receives no provider secret.

## Deployment lifecycle

```text
Create project
   -> request deployment
   -> create QUEUED audit row
   -> call provider API
   -> SUCCESS or FAILED
   -> store provider deployment ID/message
```

No fake "LIVE" result is produced when provider credentials are missing.

## Multi-tenancy

The database model is ready for client/project separation. Before exposing the application to client users, add a `user_client_memberships` table and enforce membership in every client-scoped query. The current UI is an FZ247 admin console, not a public self-service client portal.

## Scaling

Next.js serverless routes are stateless. Session state is signed in an HTTP-only cookie. PostgreSQL is the source of truth. This makes the app suitable for Vercel serverless deployment without a long-running Node server.
