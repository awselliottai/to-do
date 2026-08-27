// /lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

type DrizzleClient = ReturnType<typeof drizzle>;
type PrimaryDbState = {
    pooled: Pool;
    unpooled: Pool;
    db: DrizzleClient;
    dbPooled: DrizzleClient;
};

const g = globalThis as unknown as {
    __primaryDbState?: PrimaryDbState;
};

let primaryDbState: PrimaryDbState | undefined;

function ensureParams(url: string) {
    const add = (key: string, value: string) =>
        url.includes(`${key}=`) ? url : `${url}${url.includes('?') ? '&' : '?'}${key}=${value}`;
    let out = url;
    out = add('sslmode', 'require');
    out = add('connect_timeout', '15');
    return out;
}

function resolvePrimaryDbUrls() {
    const pooledUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    const unpooledUrl =
        process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || '';

    let effectivePooled = pooledUrl;
    let effectiveUnpooled = unpooledUrl;

    if (!effectivePooled && effectiveUnpooled) {
        console.warn(
            '[db] DATABASE_URL is missing; falling back to DATABASE_URL_UNPOOLED for pooled client. Provide DATABASE_URL (pooler host) for better connection reuse.',
        );
        effectivePooled = effectiveUnpooled;
    }

    if (!effectiveUnpooled && effectivePooled) {
        console.warn(
            '[db] DATABASE_URL_UNPOOLED is missing; falling back to pooled URL. Writes may be slower. Set DATABASE_URL_UNPOOLED to the direct host with sslmode=require&connect_timeout=15.',
        );
        effectiveUnpooled = effectivePooled;
    }

    if (!effectivePooled || !effectiveUnpooled) {
        throw new Error(
            'Missing DATABASE_URL or DATABASE_URL_UNPOOLED. Provide at least one Postgres connection string (pooler recommended) with sslmode=require&connect_timeout=15',
        );
    }

    return {
        pooledUrl: ensureParams(effectivePooled),
        unpooledUrl: ensureParams(effectiveUnpooled),
    };
}

function getPrimaryDbState() {
    if (primaryDbState) {
        return primaryDbState;
    }
    if (process.env.NODE_ENV !== 'production' && g.__primaryDbState) {
        primaryDbState = g.__primaryDbState;
        return primaryDbState;
    }

    const { pooledUrl, unpooledUrl } = resolvePrimaryDbUrls();
    console.info('[db] initializing primary database clients', {
        hasPooledUrl: Boolean(pooledUrl),
        hasUnpooledUrl: Boolean(unpooledUrl),
    });

    const pooled = new Pool({
        connectionString: pooledUrl,
        max: 5,
    });
    const unpooled = new Pool({
        connectionString: unpooledUrl,
        max: 3,
    });

    primaryDbState = {
        pooled,
        unpooled,
        db: drizzle(unpooled),
        dbPooled: drizzle(pooled),
    };

    if (process.env.NODE_ENV !== 'production') {
        g.__primaryDbState = primaryDbState;
    }

    return primaryDbState;
}

function proxyProperty<T extends object>(target: T, prop: PropertyKey) {
    const value = Reflect.get(target, prop);
    return typeof value === 'function' ? value.bind(target) : value;
}

function createLazyDrizzleProxy(kind: 'db' | 'dbPooled') {
    return new Proxy({} as DrizzleClient, {
        get(_target, prop) {
            return proxyProperty(getPrimaryDbState()[kind], prop);
        },
    });
}

function createLazyPoolProxy(kind: 'pooled' | 'unpooled') {
    return new Proxy({} as Pool, {
        get(_target, prop) {
            return proxyProperty(getPrimaryDbState()[kind], prop);
        },
    });
}

// NOTE: API routes like /api/chat and /api/chat/image use `db` for writes so that
// Neon routes traffic to the non-pooled host that tolerates longer-lived work.
// Read-heavy helpers (e.g., admin resource lists) can lean on `dbPooled` to keep
// the pooled connections hot without starving write throughput.
export const db = createLazyDrizzleProxy('db');
export const dbPooled = createLazyDrizzleProxy('dbPooled');

// Expose raw pools for administrative SQL (DDL or parameterized queries).
export const pooledClient = createLazyPoolProxy('pooled');
export const unpooledClient = createLazyPoolProxy('unpooled');

// Optional readiness check (don't call per-request).
export async function pingDb(kind: 'pooled' | 'unpooled' = 'unpooled') {
    const state = getPrimaryDbState();
    const client = kind === 'pooled' ? state.pooled : state.unpooled;
    const result = await client.query('select 1 as ok');
    return result?.rows?.[0]?.ok === 1;
}