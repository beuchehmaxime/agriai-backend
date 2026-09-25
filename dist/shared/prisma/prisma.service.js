import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined. Please check your .env file.');
}
// Hosted Postgres (e.g. Render's External URL) rejects connections without SSL, and
// node-postgres doesn't use SSL unless asked; Prisma reports that as "User was denied
// access on the database". Local databases and Render internal hostnames (no dots)
// stay without SSL. Set DATABASE_SSL=false to turn it off.
const dbHost = new URL(process.env.DATABASE_URL).hostname;
const useSsl = process.env.DATABASE_SSL !== 'false'
    && dbHost.includes('.')
    && !['localhost', '127.0.0.1'].includes(dbHost);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: useSsl ? true : undefined });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma;
