# Pet Clinic CRM & Customer Portal

Monorepo containing:
- Backend: Node.js/Express with Supabase/Postgres
- Frontend: React (Vite) with CRM (staff) and Customer portal
- Database: SQL schema and views for Supabase/Postgres

## Setup

1) Database
- Create a Supabase project
- Run `db/schema.sql` in the SQL editor

2) Backend
- Copy `backend/.env.example` to `backend/.env` and fill values
- From `backend/`, install dependencies and run
```bash
npm install
npm run dev
```

3) Frontend
- Copy `frontend/.env.example` to `frontend/.env`
- From `frontend/`, install and run
```bash
npm install
npm run dev
```

Configure `VITE_API_BASE` to your backend URL.

## Security
- Do not commit real keys. Use environment variables
- Backend uses Supabase service role key on server-side only


