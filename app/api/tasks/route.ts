import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createTask, listTasks } from '@/lib/db/tasks';

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(280),
  description: z.string().trim().max(2_000).optional(),
  dueDate: z.string().date().nullable().optional(),
});

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a task title.' }, { status: 400 });
  }

  const task = await createTask({
    ...parsed.data,
    description: parsed.data.description || null,
    dueDate: parsed.data.dueDate ?? null,
  });

  console.info('[tasks] created task', { taskId: task.id, hasDueDate: Boolean(task.dueDate) });
  return NextResponse.json(task, { status: 201 });
}
