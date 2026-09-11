# FZ247 Deploy Hub

A production-oriented Next.js web application for managing clients, projects and deployment attempts from one dashboard.

## Stack

- Next.js App Router + TypeScript
- PostgreSQL (Supabase / Neon / Vercel Postgres compatible)
- Server-side API routes
- HTTP-only signed session cookie
- bcrypt password hashing
- Vercel deployment adapter
- Responsive dark/gold operations dashboard

## Important design decision

This release does **not** fake successful deployments. If the Vercel credential is absent or the provider rejects the request, the deployment is recorded as `FAILED` with a clear message.

## Core modules

- Dashboard
- Clients
- Projects
- Deployments / audit history
- PostgreSQL schema
- Authentication
- Health endpoint
- Vercel deployment integration
- Environment-variable based secret management

See `SETUP.md` for deployment.
