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

# 4. migrations + demo data
npx prisma migrate deploy
npx prisma db seed

# 5. run
npm run dev
```

Open http://localhost:3000.

Demo logins — Employee `aarav.rao@dayflow.co`, HR `tanvi.nair@dayflow.co`, password `dayflow2026`. New signups must verify via the link the API returns (no mailer in hackathon build).

## Backend

- Postgres via Prisma 7 (`User`, `Profile`, `Attendance`, `LeaveRequest`)
- JWT session cookie (jose, HS256), bcrypt hashes, tokenVersion invalidation on logout
- Role checks re-read the DB on every request (`EMPLOYEE` / `HR_ADMIN`); `src/proxy.ts` gates pages, routes guard themselves
- Leave entitlements enforced server-side: 24 paid, 7 sick, unpaid uncapped — checked at apply AND at approve
- API under `src/app/api/`: auth (signup/login/logout/me/verify), people (HR register + record edit), profile (self, limited fields), attendance (check-in/out, month log), leave (apply/queue/decide), payroll (read-me, HR wage control)

```bash
# full api journey check, dev server must be running
BASE=http://localhost:3000 ./scripts/smoke.sh
```

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
