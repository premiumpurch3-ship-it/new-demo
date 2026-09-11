create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  email varchar(255) not null unique,
  password_hash text not null,
  role varchar(40) not null default 'ADMIN' check (role in ('MASTER_ADMIN','ADMIN','STAFF','CLIENT')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  company varchar(200),
  email varchar(255) not null,
  phone varchar(50),
  status varchar(30) not null default 'ACTIVE' check (status in ('ACTIVE','TRIAL','SUSPENDED')),
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name varchar(180) not null,
  slug varchar(80) not null,
  framework varchar(80) not null default 'Next.js',
  hosting varchar(80) not null default 'Vercel',
  status varchar(30) not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','ARCHIVED')),
  production_url text,
  repo_url text,
  repo_branch varchar(120) default 'main',
  created_at timestamptz not null default now(),
  unique(client_id, slug)
);

create table if not exists deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  status varchar(30) not null check (status in ('QUEUED','SUCCESS','FAILED')),
  provider varchar(80) not null,
  provider_deployment_id varchar(255),
  message text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_clients_email on clients(lower(email));

create index if not exists idx_projects_client on projects(client_id);
create index if not exists idx_deployments_project on deployments(project_id);
create index if not exists idx_deployments_created on deployments(created_at desc);
