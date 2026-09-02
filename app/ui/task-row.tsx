'use client';

import { FormEvent, useState } from 'react';

export type ClientTask = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type TaskRowProps = {
  task: ClientTask;
  variant?: 'overdue';
  onUpdate: (id: string, update: Partial<Pick<ClientTask, 'title' | 'dueDate' | 'completed'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  );
}

export function TaskRow({ task, variant, onUpdate, onDelete }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleCompleted() {
    setSaving(true);
    setError(null);
    try {
      await onUpdate(task.id, { completed: !task.completed });
    } catch {
      setError('Could not update this task.');
    } finally {
      setSaving(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onUpdate(task.id, { title: title.trim(), dueDate: dueDate || null });
      setEditing(false);
    } catch {
      setError('Could not save this task.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask() {
    setSaving(true);
    setError(null);
    try {
      await onDelete(task.id);
    } catch {
      setError('Could not delete this task.');
      setSaving(false);
    }
  }

  return <article className={`task-row ${task.completed ? 'completed' : ''} ${variant ? `task-row-${variant}` : ''}`}>
    <button className="task-toggle" type="button" aria-label={`${task.completed ? 'Mark incomplete' : 'Complete'}: ${task.title}`} aria-pressed={task.completed} onClick={toggleCompleted} disabled={saving}>{task.completed ? '✓' : ''}</button>
    <div className="task-body">
      <h3>{task.title}</h3>
      {task.dueDate && <p>{variant === 'overdue' ? `Set for ${formatDate(task.dueDate)} · Added ${formatDate(task.createdAt.slice(0, 10))}` : task.dueDate}</p>}
      {error && <small className="task-error">{error}</small>}
    </div>
    <button className="text-button" type="button" onClick={() => setEditing((current) => !current)} disabled={saving}>{editing ? 'Close' : 'Edit'}</button>
    {editing && <form className="task-editor" onSubmit={save}>
      <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} disabled={saving} /></label>
      <label>When<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={saving} /></label>
      <div><button className="save-button" type="submit" disabled={saving || !title.trim()}>{saving ? 'Saving…' : 'Save'}</button><button className="delete-button" type="button" onClick={deleteTask} disabled={saving}>Delete</button></div>
    </form>}
  </article>;
}
