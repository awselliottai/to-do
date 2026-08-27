import { NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteTask, updateTask } from '@/lib/db/tasks';

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(280).optional(),
  description: z.string().trim().max(2_000).nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
  completed: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide at least one task field to update.');

type RouteContext = { params: Promise<{ taskId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const body = await request.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid task update.' }, { status: 400 });
  }

  const { taskId } = await params;
  const task = await updateTask(taskId, parsed.data);

  if (!task) {
    return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  }

  console.info('[tasks] updated task', { taskId, fields: Object.keys(parsed.data) });
  return NextResponse.json(task);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { taskId } = await params;
  const deleted = await deleteTask(taskId);

  if (!deleted) {
    return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  }

  console.info('[tasks] deleted task', { taskId });
  return new NextResponse(null, { status: 204 });
}
