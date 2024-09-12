import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
// eslint-disable-next-line import/no-extraneous-dependencies
import mysql from 'mysql2/promise';

import { Env } from './Env';

const databaseUrl = new URL(Env.DATABASE_URL);

const pool = mysql.createPool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port) || 3306,
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.substring(1),
});

export const db = drizzle(pool);

// Disable migrate function if using Edge runtime and use `npm run db:migrate` instead.
// Only run migrate in development. Otherwise, migrate will also be run during the build which can cause errors.
// Migrate during the build can cause errors due to the locked database when multiple migrations are running at the same time.
if (process.env.NODE_ENV === 'development') {
  await migrate(db, { migrationsFolder: './migrations' });
}
