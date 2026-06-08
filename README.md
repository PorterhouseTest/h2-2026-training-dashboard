# H2 2026 Training Dashboard

Private Next.js dashboard for the H2 2026 marathon build toward the race on Saturday, October 17, 2026.

The app imports the canonical 18-week Excel plan from `data/marathon_training_plans_editable.xlsx`, stores planned workouts in Postgres through Prisma, supports Google login, tracks manual BJJ/strength/weight/notes entries, exposes a protected Garmin sync route, and shows plan progress plus low-friction training views.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Postgres
- NextAuth Google login
- Recharts
- Vercel Cron

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run import-plan
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
DATABASE_URL=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
GARMIN_EMAIL=
GARMIN_PASSWORD=
GARMIN_SYNC_SECRET=
```

`AUTH_SECRET` and `GARMIN_SYNC_SECRET` should be long random values. Never commit `.env`, Garmin credentials, Google credentials, access tokens, or cookies.

## Google Login

Create OAuth credentials in Google Cloud Console:

1. Add an OAuth client for a web application.
2. Add `http://localhost:3000/api/auth/callback/google` for local development.
3. Add `https://YOUR_DOMAIN/api/auth/callback/google` for Vercel.
4. Put the client ID and secret in `.env`.

Only authenticated users can access dashboard pages. The login route is `/login`.

## Postgres

Use Neon Postgres or another Postgres provider from Vercel Marketplace.

Set `DATABASE_URL`, then run:

```bash
npm run prisma:migrate
npm run prisma:studio
```

## Training Plan Import

The Excel file is already expected at:

```bash
data/marathon_training_plans_editable.xlsx
```

Import it with:

```bash
npm run import-plan
```

The importer reads the `Level 1` sheet, finds the `Week, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday` header, maps the 18 weeks to dates ending with marathon race day on October 17, 2026, and creates 126 `PlannedWorkout` records.

It also infers:

- `workoutType`
- planned miles
- planned duration minutes
- intensity labels like `CV`, `LTP`, `VHI`, `MAS`, `SSP`, `5KP`, `10KP`, `HMP`
- race day

Seed runs the same importer:

```bash
npm run db:seed
```

## Garmin Sync

Protected endpoint:

```bash
GET /api/sync/garmin
POST /api/sync/garmin
```

Authentication options:

- `Authorization: Bearer $GARMIN_SYNC_SECRET`
- `x-garmin-sync-secret: $GARMIN_SYNC_SECRET`
- `?secret=$GARMIN_SYNC_SECRET`

The dashboard and settings page include a server-side manual sync button, so the Garmin secret is not exposed in the browser.

The current Garmin module includes the endpoint, SyncLog records, upsert structure, raw JSON storage fields, and a clear TODO for connecting a live Garmin Connect client. If Vercel runtime limits make Garmin auth unreliable, move `fetchRecentGarminData()` from `lib/garmin.ts` into a separate worker while keeping the same database writes.

## Vercel Cron

`vercel.json` schedules a daily sync:

```json
{
  "crons": [
    {
      "path": "/api/sync/garmin",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Set `GARMIN_SYNC_SECRET` or `CRON_SECRET` in Vercel. The route accepts a bearer token matching either value.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run prisma:migrate
npm run prisma:studio
npm run import-plan
npm run db:seed
```

## Pages

- `/dashboard`: race countdown, current week, mileage, completion, sync status, weight, notes, prediction, recovery, upcoming workouts
- `/plan`: full 18-week plan with filters, actual Garmin match, and status
- `/calendar`: rolling calendar with planned workouts, actual runs, BJJ, strength, weight, and notes
- `/runs`: Garmin activity table and charts
- `/bjj`: BJJ session form and table
- `/strength`: strength session form and table
- `/weight`: weekly weight entry and trend
- `/notes`: date-specific notes
- `/recovery`: Garmin health metrics with training context
- `/settings`: sync status, import status, pace glossary

## Race Prediction

The predictor starts transparent and conservative. It uses recent Garmin runs, plan completion, and a Riegel-style distance adjustment. If there is not enough data, it shows a low-confidence explanation instead of pretending precision.

## Known Garmin Limitations

Garmin Connect is not a public stable API. Credentials must remain server-side, token persistence must be handled carefully, and runtime behavior can vary by host. The sync code is intentionally modular so the live client can be moved out of Vercel later without changing the UI or database model.
