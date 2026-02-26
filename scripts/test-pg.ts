
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('Connecting to Postgres via pg...');
    try {
        const client = await pool.connect();
        console.log('✅ Connected to database via pg');

        const res = await client.query('SELECT NOW()');
        console.log('✅ Query success:', res.rows[0]);

        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await pool.end();
    }
}

main();
