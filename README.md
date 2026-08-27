# Taskly

Taskly is a focused, mobile-first task app built with Next.js, Neon Postgres, and Drizzle. Its core workflow is intentionally small: capture a task, decide whether it belongs in Today or Inbox, then complete it.

## Core workflow

- **Today** shows incomplete tasks due today.
- **Inbox** holds uncategorized, unscheduled tasks.
- **Completed** retains completed tasks until they are deleted.
- Each task can be edited, scheduled, completed, or deleted from the task list.

The UI calls the task API directly, so task changes persist across refreshes.

## Local development

Create `.env.local` with `DATABASE_URL` and `DATABASE_URL_UNPOOLED` values for a Neon Postgres database, then run:

```bash
pnpm install
pnpm run migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create a task with `title`, optional `description`, and optional `dueDate` (`YYYY-MM-DD`)
- `PATCH /api/tasks/:taskId` — update `title`, `description`, `dueDate`, or `completed`
- `DELETE /api/tasks/:taskId` — delete a task

Authentication and user-scoped ownership are deliberately not implemented yet; this is currently a single shared task workspace. Add an authentication boundary before deploying it as a multi-user service.
