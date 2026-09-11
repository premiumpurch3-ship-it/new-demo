# FZ247 Deploy Hub — Setup & Vercel Deployment

## 1. Requirements

- Node.js 20.11+
- A PostgreSQL database (Supabase, Neon, Vercel Postgres or any hosted PostgreSQL)
- A Vercel account for hosting this dashboard
- A Vercel token only if you want the "Deploy to Vercel" button to create real provider deployments

## 2. Local setup

```bash
npm install
```

Create `.env.local`:

```env
DATABASE_URL="your-postgresql-connection-string"
AUTH_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
VERCEL_TOKEN=""
VERCEL_TEAM_ID=""
```

Initialize database:

```bash
npm run db:init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Seed login:

- Email: `admin@fz247.local`
- Password: `FZ247@Admin123`

**Change the password strategy before giving this to a real customer.** The seed is for first-time setup.

## 3. Vercel deployment

1. Push this folder to GitHub/GitLab/Bitbucket.
2. Import the repository into Vercel.
3. Add these Environment Variables in Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL or custom domain)
   - `VERCEL_TOKEN` (only for real Vercel deployments)
   - `VERCEL_TEAM_ID` (optional)
4. Deploy.
5. Visit `/api/health`. It should return database `connected`.
6. Login and test creating a client and project.

## 4. PostgreSQL

The schema is in `database/schema.sql`.

If you prefer the provider's SQL editor, paste that file and run it. Or use:

```bash
npm run db:init
```

The application only needs one PostgreSQL database for its own control-plane data.

## 5. Real Vercel deployments

The current adapter uses the Vercel REST API from the server. The token is never exposed to the browser.

For a real client deployment, the client project's source/build configuration needs to be connected to the appropriate Vercel project/repository. This release intentionally does not pretend that a generic project slug is enough to deploy arbitrary source code.

For a production rollout, add a provider connection table and a Vercel project/repository mapping per project.

## 6. Security checklist before selling

- Replace the seeded admin credentials.
- Generate a strong `AUTH_SECRET`.
- Never put provider tokens in `NEXT_PUBLIC_*` variables.
- Use least-privilege provider tokens.
- Add rate limiting at the edge for `/api/auth/login`.
- Add email verification / password reset before public signup.
- Add CSRF/origin checks if you expand cookie-authenticated mutation endpoints.
- Add audit logs for administrative mutations.
- Add backups and database point-in-time recovery.
- Configure a custom domain and HTTPS.

## 7. Current scope

Included and working:

- Authentication
- Protected dashboard
- Client create/delete
- Client-to-project relationship
- Project creation
- Project detail page
- Deployment history
- Database health check
- Vercel API deployment attempt
- Responsive UI

Intentionally not included yet:

- Stripe billing
- Email/password reset
- GitHub OAuth
- Automated repository provisioning
- Cloudflare deployment adapter
- Supabase/Neon account provisioning
- R2 bucket provisioning
- AI provider billing/usage
- White-label client portal

These should be added as separate modules rather than weakening the core release.
