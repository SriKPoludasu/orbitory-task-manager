# Cloud Task Manager

Cloud Task Manager is a productivity dashboard I built for planning projects, moving tasks through a workflow, and keeping project work organized in one place.

I did not want this to feel like a basic task app, so I focused on the parts that make it feel useful: a dashboard, draggable Kanban board, comments, activity, settings, notifications, profile details, charts, and a custom visual system.

The demo workspace is **Orbitory**. The main board is **Signal Sprint**.

## Demo Account

```text
kay@example.com
password123
```

The demo account uses my profile photo, and the rest of the demo users are kept generic.

## Features I Built

- Email/password sign-in with NextAuth
- Dashboard with task totals, progress, overdue work, and upcoming deadlines
- Workspace and project setup
- Project cards with progress tracking
- Kanban board with drag and drop
- Task list view
- Task create, edit, delete, archive, and status updates
- Priorities, due dates, labels, descriptions, assignees, and comments
- Notifications panel
- Settings panel
- Custom mood system: Volt Bloom, Frosted Ink, and Solar Ember
- Activity feed
- Productivity and priority charts
- Responsive UI for desktop and mobile

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Framer Motion
- Prisma
- PostgreSQL
- NextAuth
- dnd-kit
- Recharts
- Pusher hooks for future realtime updates

## Local Setup

Install packages:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The demo login works even when the database is not running. I added that so the project can still be opened locally without extra setup.

## Database Setup

For the Prisma/PostgreSQL setup:

```bash
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
```

Useful database command:

```bash
npm run studio
```

## Environment Variables

For local development, these are the values I use in `.env`:

```bash
DATABASE_URL="your_postgres_connection_string"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

PUSHER_APP_ID=""
PUSHER_SECRET=""
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

For the deployed version, the same keys are set in Vercel project environment variables. Pusher is optional for now, so the app still works without those keys.

## How It Is Organized

```text
app/          routes, layouts, API routes, loading states
components/   dashboard, board, task, chart, layout, and UI pieces
hooks/        realtime client hook
lib/          auth, Prisma, server actions, data loading, demo fallback
prisma/       schema and seed script
public/       local profile image
types/        NextAuth session typing
```

## Architecture

The dashboard and project pages are server components, so the main data is loaded before the page renders. Forms and task updates go through server actions.

I kept two ways to run the app:

- Prisma + PostgreSQL when the database is running
- Demo fallback data when I just want to open the app locally

The Kanban board uses dnd-kit for drag behavior. Charts are handled with Recharts. NextAuth handles credentials sign-in. I also added basic Pusher hooks so realtime updates can be expanded later.

## Deployment

This project is already deployed on Vercel:

```text
https://orbitory-task-manager.vercel.app
```

To update the live version:

1. Push changes to the GitHub repository.
2. Make sure the Vercel project environment variables are still set correctly.
3. Let Vercel redeploy the latest version from GitHub.

If this project gets moved to a real hosted PostgreSQL database later, `DATABASE_URL` should be updated in Vercel, the Prisma schema should be run there, and `NEXTAUTH_URL` should stay matched to the live domain.

Build command:

```bash
npm run build
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
