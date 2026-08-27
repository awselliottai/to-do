# AGENTS.md

## Purpose
This file defines the operating rules for agent work in this repository.

Use it to:
- minimize unnecessary context loading and token use;
- preserve the project’s established structure and conventions;
- keep changes traceable through rolling logs;
- ensure verification is performed before work is finalized.

For detailed project capabilities, architecture, page inventories, API inventories, database design, and feature-specific deep dives, use:
- `README.md`
- relevant files under `public/docs/`
- the codebase itself

Do not treat `AGENTS.md` as the primary project encyclopedia.

---

## Context Loading and Token Discipline

### Default rule
Load only the context needed to complete the current task well.

Prioritize, in order:
1. the user’s current prompt;
2. the exact files or symbols being changed;
3. the most relevant nearby code, types, routes, or utilities;
4. rolling logs and project docs only when the task warrants them.

### Avoid unnecessary reading
- Do not open large files, broad directories, or project-wide docs “just in case.”
- Prefer targeted search before opening files.
- For very large files, inspect the relevant exports, functions, components, or route sections rather than loading the whole file unless necessary.
- Reuse already obtained context; do not repeatedly re-read the same material.
- Do not re-read the full `public/updates/` tree for routine work.

### When to consult `README.md`
Consult `README.md` when a task:
- touches architecture, major flows, or cross-cutting behavior;
- adds, removes, or materially changes a page, route family, subsystem, or operator-facing workflow;
- requires confirmation of the current high-level project structure;
- appears to conflict with established project descriptions.

Do not open or revise `README.md` for every routine change.

### When to consult rolling logs
Rolling logs are important, but they should be loaded selectively.

Before implementing:
- non-trivial changes;
- continuing work from a recent task;
- changes to a subsystem that may have recent design decisions, constraints, or TODOs;
- refactors or behavior changes where prior tradeoffs matter;

read:
1. today’s `public/updates/MM-DD-YY/rolling-log.md`, if it exists;
2. only the most relevant recent prior log entries for the same subsystem.

For isolated trivial edits, style tweaks, small typo fixes, or obvious one-line corrections, rolling-log review may be skipped unless the user’s prompt clearly references recent prior work.

If a new change diverges from a prior logged decision, note that divergence in the new rolling-log entry.

---

## Repository Working Principles

### Preserve existing architecture unless instructed otherwise
Work within the current Next.js App Router structure and established project organization.

Do not casually:
- replace established route patterns;
- introduce parallel systems when an existing one should be extended;
- move server logic into client components;
- duplicate utilities that already exist;
- delete files, exports, or routes without confirming they are unreachable or obsolete.

Use `README.md`, focused code search, and relevant docs when a task requires broader architectural awareness.

### Project style
Follow existing conventions:
- TypeScript / Next.js App Router conventions already used in the repo;
- 2-space indentation;
- semicolons;
- single quotes;
- alias imports such as `@/app/*` and `@/lib/*` when crossing feature boundaries.

### Client/server boundaries
- Client components must use `'use client'`.
- Server-only logic belongs in route handlers, server actions, or other existing server-side patterns.
- Avoid unnecessarily enlarging client components with data, orchestration, or backend responsibilities that belong elsewhere.

---

## Component Structure and Modularity

### New UI or page behavior
When adding substantial UI behavior to a page:
- prefer small components wired into the page;
- use `app/ui/` for broadly reusable UI;
- use a page-local `ui/` folder for specialized components tied to one page or feature area.

Avoid expanding `page.tsx` files into large monoliths.

### Editing already-large pages, route handlers, or orchestration files
When editing a page, route handler, orchestration file, or shared module that is already unwieldy, or becomes so through the requested change:
- favor extracting focused subcomponents, helpers, utilities, or feature-local modules;
- reduce local complexity where practical;
- preserve existing behavior and interfaces unless the task requires otherwise.

As a rough signal, a file in the multi-thousand-line range should generally prompt consideration of decomposition, provided that doing so does not create unnecessary abstraction or destabilize API, database, or routing interactions.

This applies not only to page files, but also to large central implementation files such as:
- `app/page.tsx`
- similarly oversized route handlers, coordination modules, or shared service files.

### Prevent monolithic files
Do not continue concentrating new behavior inside already-centralized files when a clean, focused decomposition is available.

Rather than bloating large files such as `app/page.tsx` or equivalent high-complexity modules:
- create new components, helpers, utilities, or route-local modules where appropriate;
- refactor newly touched logic into dedicated files when doing so is reasonably scoped;
- import and compose those focused modules from the main page, route handler, or orchestrator;
- prefer dedicated sub-routes or sub-route support modules when API functionality becomes distinct enough to warrant separation.

The default bias should be:
- **compose instead of accumulate**;
- **import focused modules instead of extending central files indefinitely**;
- **refactor touched monolithic areas when doing so reduces future complexity without derailing the task**.

Do not force abstraction for tiny edits, isolated line changes, or situations where splitting code would make the implementation harder to follow. But substantial new logic should not simply be appended to an already oversized file when a coherent decomposition is available.

---

## Debuggability

Add simple, purposeful `console.log` statements to code you touch when they improve interpretability, traceability, or debugging.

Do not add noisy or redundant logs merely to satisfy this rule. Logging should help future diagnosis.

---

## Rolling Update Logs

Meaningful changes must be recorded under:

- directory: `public/updates/MM-DD-YY/`
- file: `public/updates/MM-DD-YY/rolling-log.md`

Create the date folder and log file if needed.

### Log meaningful changes
Log:
- behavior changes;
- API, routing, prompt, or feature-semantics changes;
- schema, migration, storage, or persisted-data changes;
- production-impacting fixes;
- performance or security changes;
- operator workflow or documentation changes that affect usage.

Trivial internal cleanups, formatting-only edits, typo fixes, and very small non-behavioral refactors may be omitted or summarized briefly when useful.

### Entry format
Append newest entries at the bottom.

Use this structure:

- `HH:MM` — **Title**
  - **Prompt:** …
  - **Summary:** …
  - **Why:** …
  - **Files:** `…`, `…`
  - **DB/Data:** …
  - **Verification:** …
  - **Follow-ups:** …

Record a concise, faithful prompt summary. Quote exact wording only when it materially affects behavior, safety, data semantics, or a disputed implementation decision.

---

## Documentation Maintenance

Update `README.md` only when a change materially alters high-level project understanding, such as:
- a new major page, flow, subsystem, or operator workflow;
- a meaningful architectural shift;
- a new persistent feature area that future contributors need to understand;
- a changed description that would otherwise make `README.md` misleading.

Do not update `README.md` for every local fix, UI tweak, or narrow internal implementation detail.

Use dedicated docs under `public/docs/` when a subsystem needs detailed operational or design explanation that would bloat `README.md`.

When changing `README.md` or `public/docs/`, verify descriptions against the current route, component, endpoint, and configuration implementation. Do not revive removed flows merely because historical logs or documents reference them.

---

## Verification Requirements

### Required after code changes
Run:

- `pnpm run typecheck`

Resolve all resulting type errors before finalizing.

### Run additional checks when warranted
Use the scope of the change to determine whether to run:

- `pnpm run lint`
- targeted manual testing of the affected route, page, or flow


## Do not build

Do not run `pnpm run build`, as it can potentially affect currently-running dev servers and slows the entire process.

Broader verification is expected for:
- cross-cutting refactors;
- route/API changes;
- production-impacting bug fixes;
- changes affecting complex state, data fetching, routing, database, or persistence flows;
- cleanup/removal work.

### Report verification honestly
In the final response and rolling-log entry:
- state what was run;
- state whether it passed;
- mention any check not run and why, if relevant.

---

## Dead Code and Cleanup Guidance

Be conservative when removing code.

Before deleting files, routes, exports, or helpers:
- identify current runtime entrypoints relevant to the task;
- search for direct and indirect imports;
- search for route usage and dynamic references;
- account for env-gated, registry-driven, or otherwise indirect reachability;
- confirm the item is actually obsolete or unreachable.

When performing broad cleanup:
- use `README.md` and the current codebase to understand preserved surfaces;
- verify removals through search, typechecking, and targeted tests, lint, or manual checks where appropriate;
- update comments, barrels, and docs affected by deletions.

### Direct-addressable API and compatibility surfaces

Do not treat the absence of a first-party UI `fetch()` call as proof that an API route is unused.

Before deleting an API route, also inspect:
- route-specific persistence, cache keys, and shared server utilities;
- direct-client, curl, admin, parameterized, and compatibility use;
- dynamic route construction and documentation references;
- the route’s distinct request/response contract versus nearby alternatives.

Remove a route only when its callers and contract are demonstrably obsolete. If it remains useful as a compatibility or operator surface, retain it or explicitly deprecate it with a documented replacement.

### Cleanup verification

For route, API, or broad cleanup work:
- search imports, route strings, dynamic references, docs, and shared state;
- run `pnpm run typecheck`;
- run targeted tests when they cover the affected subsystem;
- manually exercise the canonical replacement route for user-facing flows;
- run `git diff --check`;
- document retained compatibility contracts and intentionally preserved direct endpoints.

---

## Database, Schema, and Persisted Data Changes

Treat persisted-data changes as high risk.

When modifying schema, migrations, storage behavior, retention, or external-database interactions:
- inspect the relevant existing schema and access patterns first;
- preserve compatibility unless the task requires migration;
- document data implications in the rolling log;
- note migrations, backfills, risks, and any necessary follow-up steps.

Keep generated migrations and schema changes synchronized where applicable.

---

## Security and Configuration

- Never commit secrets.
- Keep credentials in `.env.local` or deployment configuration.
- Treat env-gated admin or privileged surfaces carefully.
- When touching authentication, admin flows, upload flows, credential handling, or external-service integration, inspect the existing pattern before changing it and document meaningful security implications in the rolling log.

---

## Commit and PR Orientation

When asked to prepare commit or PR material:
- use concise imperative commit language;
- summarize scope, risks, and verification;
- mention env var changes, migration steps, or operational considerations when applicable;
- include screenshots or manual-testing notes for UI changes when useful.

---

## Final Working Standard

A good implementation in this repo should:
- solve the user’s request directly;
- load no more context than needed;
- preserve established architecture unless there is a clear reason to change it;
- avoid enlarging already-monolithic files when clean decomposition is available;
- remain modular and debuggable;
- record meaningful work in rolling logs;
- update high-level docs only when warranted;
- pass typechecking before completion.