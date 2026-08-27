import { Pool } from '@neondatabase/serverless';

function connectionString(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing.`);
  }

  const url = new URL(value);
  if (!url.searchParams.has('sslmode')) url.searchParams.set('sslmode', 'require');
  if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '15');
  return url.toString();
}

async function check(name) {
  const pool = new Pool({ connectionString: connectionString(name), max: 1 });
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query(
      "select current_database() as database, current_user as user, to_regclass('public.tasks') as tasks_table",
    );
    if (rows[0].tasks_table !== 'tasks') {
      throw new Error('The tasks table is missing. Run pnpm run migrate first.');
    }
    console.log(`[db:check] ${name} connected`, rows[0]);

    await client.query('begin');
    const { rows: inserted } = await client.query(
      'insert into tasks (title) values ($1) returning id, completed',
      ['Database connectivity smoke test'],
    );
    const { rows: updated } = await client.query(
      'update tasks set completed = true, updated_at = now() where id = $1 returning completed',
      [inserted[0].id],
    );
    if (updated[0].completed !== true) {
      throw new Error('Task update smoke test returned an unexpected result.');
    }
    await client.query('rollback');
    console.log(`[db:check] ${name} task create/update smoke test passed (rolled back).`);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

await check('DATABASE_URL');
await check('DATABASE_URL_UNPOOLED');
console.log('[db:check] Neon connectivity verified.');
