'use client';

import { FormEvent, useMemo, useState } from 'react';

type Filter = 'all' | 'today' | 'upcoming' | 'completed';

type Task = {
  id: number;
  title: string;
  category: string;
  due: string;
  completed: boolean;
  starred?: boolean;
  when: 'today' | 'upcoming';
};

const initialTasks: Task[] = [
  { id: 1, title: 'Review project brief', category: 'Work', due: '10:00 AM', completed: true, when: 'today' },
  { id: 2, title: 'Design new landing page', category: 'Work', due: '12:30 PM', completed: false, starred: true, when: 'today' },
  { id: 3, title: 'Pick up groceries', category: 'Personal', due: '4:00 PM', completed: false, when: 'today' },
  { id: 4, title: 'Call Mom', category: 'Personal', due: '6:30 PM', completed: false, when: 'today' },
  { id: 5, title: 'Plan next week', category: 'Work', due: 'Tomorrow', completed: false, when: 'upcoming' },
];

const navItems: { filter: Filter; label: string; icon: string }[] = [
  { filter: 'all', label: 'All tasks', icon: '▦' },
  { filter: 'today', label: 'Today', icon: '◷' },
  { filter: 'upcoming', label: 'Upcoming', icon: '□' },
  { filter: 'completed', label: 'Completed', icon: '✓' },
];

export function TaskDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<Filter>('today');
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    return task.when === filter;
  }), [filter, tasks]);

  const completedToday = tasks.filter((task) => task.when === 'today' && task.completed).length;
  const totalToday = tasks.filter((task) => task.when === 'today').length;

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    setTasks((current) => [{
      id: Date.now(), title, category: 'Personal', due: 'Today', completed: false, when: 'today',
    }, ...current]);
    setDraft('');
  }

  function selectFilter(nextFilter: Filter) {
    setFilter(nextFilter);
    setMenuOpen(false);
  }

  return (
    <main className="task-app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Task navigation">
        <div className="brand-row">
          <div className="brand-mark">✓</div>
          <span>Taskly</span>
          <button className="mobile-close" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>×</button>
        </div>
        <nav className="task-nav">
          {navItems.map((item) => (
            <button className={`nav-item ${filter === item.filter ? 'nav-item-active' : ''}`} key={item.filter} type="button" onClick={() => selectFilter(item.filter)}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
              {item.filter === 'all' && <span className="nav-count">{tasks.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-section">
          <p className="sidebar-label">LISTS</p>
          <button className="list-item" type="button" onClick={() => selectFilter('today')}><span className="list-dot list-dot-violet" />Work <span>{tasks.filter((task) => task.category === 'Work' && !task.completed).length}</span></button>
          <button className="list-item" type="button" onClick={() => selectFilter('all')}><span className="list-dot list-dot-orange" />Personal <span>{tasks.filter((task) => task.category === 'Personal' && !task.completed).length}</span></button>
          <button className="new-list" type="button"><span>＋</span> New list</button>
        </div>
        <div className="sidebar-user"><div className="avatar">AE</div><div><strong>Alex Ellis</strong><small>Free plan</small></div><button type="button" aria-label="Account options">•••</button></div>
      </aside>
      {menuOpen && <button className="menu-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <section className="dashboard">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>☰</button>
          <div className="mobile-brand"><span>✓</span> Taskly</div>
          <button className="icon-button" type="button" aria-label="Notifications">♧<i /></button>
          <button className="icon-button" type="button" aria-label="Settings">⚙</button>
        </header>
        <div className="content-wrap">
          <section className="hero">
            <div><p className="eyebrow">THURSDAY, AUGUST 27</p><h1>{filter === 'today' ? 'Good morning, Alex.' : navItems.find((item) => item.filter === filter)?.label}</h1><p className="subcopy">{filter === 'today' ? 'Here’s what’s on your plate today.' : 'Keep making space for what matters.'}</p></div>
            <div className="progress-card" aria-label={`${completedToday} of ${totalToday} tasks completed`}><div className="progress-circle"><span>{Math.round((completedToday / totalToday) * 100)}%</span></div><div><strong>{completedToday} of {totalToday}</strong><small>tasks completed</small></div></div>
          </section>
          <form className="quick-add" onSubmit={addTask}><span className="add-symbol">＋</span><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a task for today" aria-label="New task title" /><button type="submit">Add task</button></form>
          <section className="task-section" aria-live="polite">
            <div className="section-heading"><h2>{filter === 'today' ? 'Today' : navItems.find((item) => item.filter === filter)?.label}</h2><span>{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span></div>
            <div className="task-list">
              {visibleTasks.length ? visibleTasks.map((task) => (
                <article className={`task-row ${task.completed ? 'task-done' : ''}`} key={task.id}>
                  <button className="task-check" type="button" aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`} aria-pressed={task.completed} onClick={() => toggleTask(task.id)}>{task.completed && '✓'}</button>
                  <div className="task-main"><h3>{task.title}</h3><p><span className={`category-dot ${task.category === 'Work' ? 'work' : 'personal'}`} />{task.category}</p></div>
                  <div className="task-meta"><span>{task.due}</span>{task.starred && <span className="star" aria-label="Important">★</span>}<button type="button" aria-label={`More options for ${task.title}`}>•••</button></div>
                </article>
              )) : <div className="empty-state"><span>✓</span><p>Nothing here yet.</p><small>Enjoy the breathing room, or add a task above.</small></div>}
            </div>
          </section>
          <section className="focus-card"><div className="focus-icon">✦</div><div><p className="eyebrow">FOCUS FOR TODAY</p><h2>One step at a time.</h2><p>Small, intentional progress adds up to meaningful work.</p></div><button type="button">Start focus mode <span>→</span></button></section>
        </div>
      </section>
    </main>
  );
}
