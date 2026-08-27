import { desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { tasks, type NewTask, type Task } from '@/lib/db/schema/tasks';

export type CreateTaskInput = Pick<NewTask, 'title' | 'description' | 'dueDate'>;
export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'completed'>>;

export async function listTasks(): Promise<Task[]> {
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const [task] = await db.insert(tasks).values(input).returning();
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | undefined> {
  const [task] = await db
    .update(tasks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();

  return task;
}

export async function deleteTask(id: string): Promise<boolean> {
  const deleted = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  return deleted.length > 0;
}
