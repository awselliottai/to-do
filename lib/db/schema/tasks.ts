import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * The persistent representation of a to-do item. User ownership and richer
 * scheduling fields can be added when authentication and the task UI arrive.
 */
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
