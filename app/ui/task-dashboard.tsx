'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { TaskRow, type ClientTask } from '@/app/ui/task-row';

type View = 'today' | 'inbox' | 'completed';

const views: { id: View; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'completed', label: 'Completed' },
];

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function readableDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  );
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [view, setView] = useState<View>('today');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [today, setToday] = useState(localDate);

  useEffect(() => {
    const rolloverCheck = window.setInterval(() => {
      const currentDate = localDate();
      setToday((current) => current === currentDate ? current : currentDate);
    }, 60_000);

    return () => window.clearInterval(rolloverCheck);
  }, []);

  function resizeComposer() {
    const textarea = composerTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  useEffect(() => {
    resizeComposer();
  }, [draft]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/tasks', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load your tasks.');
        return response.json() as Promise<ClientTask[]>;
      })
      .then((loadedTasks) => {
        if (!cancelled) setTasks(loadedTasks);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load your tasks.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const todayTasks = useMemo(() => tasks.filter((task) => {
    if (view === 'completed') return task.completed;
    if (view === 'inbox') return !task.completed && !task.dueDate;
    return !task.completed && task.dueDate === today;
  }), [tasks, today, view]);

  const overdueTasks = useMemo(() => (
    view === 'today'
      ? tasks.filter((task) => !task.completed && task.dueDate !== null && task.dueDate < today)
      : []
  ), [tasks, today, view]);

  const completedToday = useMemo(() => tasks.filter((task) => task.completed && task.dueDate === today), [tasks, today]);

  const counts = useMemo(() => ({
    today: tasks.filter((task) => !task.completed && task.dueDate !== null && task.dueDate <= today).length,
    inbox: tasks.filter((task) => !task.completed && !task.dueDate).length,
    completed: tasks.filter((task) => task.completed).length,
  }), [tasks, today]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, dueDate: view === 'inbox' ? null : today }),
      });
      if (!response.ok) throw new Error('Unable to add that task.');
      const task: ClientTask = await response.json();
      setTasks((current) => [task, ...current]);
      setDraft('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add that task.');
    } finally {
      setSubmitting(false);
    }
  }

  async function patchTask(id: string, update: Partial<Pick<ClientTask, 'title' | 'dueDate' | 'completed'>>) {
    setError(null);
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    if (!response.ok) throw new Error('Unable to save that task.');
    const task: ClientTask = await response.json();
    setTasks((current) => current.map((item) => item.id === task.id ? task : item));
  }

  async function removeTask(id: string) {
    setError(null);
    const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to delete that task.');
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const currentView = views.find((item) => item.id === view)!;
  const inputHint = view === 'inbox' ? 'Add to Inbox' : 'Add a task for today';

  return (
    <main className="task-app">
      <header className="app-header">
        <Link className="brand" href="/" aria-label="Tasks home"><span aria-hidden="true">✓</span>Tasks</Link>
        <nav aria-label="Task views">
          {views.map((item) => <button className={view === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => setView(item.id)}>{item.label}<small>{counts[item.id]}</small></button>)}
        </nav>
      </header>

      <section className="task-content">
        <div className="page-intro">
          <p>{view === 'today' ? readableDate(today) : 'Your tasks'}</p>
          <h1>{currentView.label}</h1>
          <span>{view === 'today' ? 'Start with what matters today.' : view === 'inbox' ? 'Capture it now. Sort it later.' : 'A record of your progress.'}</span>
        </div>

        <form className="task-composer" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">New task title</label>
          <textarea
            ref={composerTextareaRef}
            id="new-task"
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onInput={resizeComposer}
            placeholder={inputHint}
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !draft.trim()}>{submitting ? 'Adding…' : 'Add task'}</button>
        </form>

        {error && <p className="status-message" role="alert">{error}</p>}
        {view === 'today' && overdueTasks.length > 0 && <section className="overdue-tasks" aria-live="polite">
          <div className="list-heading"><h2>Overdue</h2><span>{overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'}</span></div>
          <p className="section-note">These tasks were set for an earlier day. Finish them here or update their date.</p>
          <div className="task-list">
            {overdueTasks.map((task) => <TaskRow key={task.id} task={task} variant="overdue" onUpdate={patchTask} onDelete={removeTask} />)}
          </div>
        </section>}

        <section aria-live="polite" aria-busy={loading}>
          <div className="list-heading"><h2>{currentView.label}</h2><span>{loading ? 'Loading…' : `${todayTasks.length} ${todayTasks.length === 1 ? 'task' : 'tasks'}`}</span></div>
          <div className="task-list">
            {loading ? <p className="empty-state">Loading your tasks…</p> : todayTasks.length ? todayTasks.map((task) => <TaskRow key={task.id} task={task} onUpdate={patchTask} onDelete={removeTask} />) : <div className="empty-state"><strong>{view === 'completed' ? 'Nothing completed yet.' : 'Nothing here yet.'}</strong><p>{view === 'inbox' ? 'Add something you do not want to forget.' : 'Enjoy the breathing room.'}</p></div>}
          </div>
        </section>

        {view === 'today' && completedToday.length > 0 && <section className="completed-today" aria-live="polite">
          <div className="list-heading"><h2>Completed today</h2><span>{completedToday.length} {completedToday.length === 1 ? 'task' : 'tasks'}</span></div>
          <div className="task-list">
            {completedToday.map((task) => <TaskRow key={task.id} task={task} onUpdate={patchTask} onDelete={removeTask} />)}
          </div>
        </section>}
      </section>
    </main>
  );
}
