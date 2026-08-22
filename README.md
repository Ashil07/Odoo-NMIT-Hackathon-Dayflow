# Dayflow — HRMS

Human Resource Management System. Every workday, perfectly aligned.

Hackathon build: Odoo x NMIT.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- PostgreSQL (local only — hackathon rule, no hosted DB)
- Prisma 7 + `@prisma/adapter-pg`
- shadcn/ui (radix + nova preset, lucide icons)
- Auth plan: credentials + JWT (`bcryptjs`, `jose`), validation via `zod`

## Setup

```bash
# 1. deps
npm install

# 2. local postgres role + db (one time)
psql -U postgres -c "CREATE ROLE dayflow LOGIN PASSWORD 'dayflow';" \
  -c "CREATE DATABASE dayflow OWNER dayflow;"

# 3. env
cp .env.example .env
# set JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. schema push (when models exist)
npx prisma migrate dev

# 5. run
npm run dev
```

Open http://localhost:3000.

## Layout

```
prisma/schema.prisma    # models (empty for now)
src/app/                # routes
src/components/ui/      # shadcn components
src/lib/db.ts           # prisma singleton
src/lib/utils.ts        # cn helper
```

## Module roadmap

- Auth: sign up / sign in, roles (Employee / HR-Admin)
- Dashboard: employee + admin views
- Profile: view/edit employee details
- Attendance: check-in/out, daily + weekly views
- Leave: apply, approve/reject
- Payroll: employee read-only, admin edit

## Checks

```bash
npm run lint   # eslint
npm run build  # typecheck + build
```
