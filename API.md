# API Reference

## GET /api/health

Checks application database connectivity.

Success:

```json
{"ok":true,"database":"connected"}
```

## POST /api/auth/login

```json
{"email":"admin@fz247.local","password":"FZ247@Admin123"}
```

Creates an HTTP-only session cookie.

## POST /api/auth/logout

Clears the session cookie.

## POST /api/clients

Authenticated.

```json
{"name":"ABC Clinic","company":"ABC","email":"owner@example.com","phone":"+92..."}
```

## DELETE /api/clients/:id

Authenticated. Deletes client and its projects/deployments via PostgreSQL cascade.

## POST /api/projects

Authenticated.

```json
{
  "client_id":"uuid",
  "name":"ABC Website",
  "slug":"abc-website",
  "framework":"Next.js",
  "hosting":"Vercel"
}
```

## POST /api/deployments

Authenticated.

```json
{"project_id":"uuid"}
```

Requires `VERCEL_TOKEN` for an actual provider API call. A missing token creates a failed deployment record rather than a false success.
