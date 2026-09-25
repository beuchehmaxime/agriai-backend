import 'dotenv/config';
import prisma from './shared/prisma/prisma.service.js';
import { seedAdmin } from './seeds/admin.js';
import { seedCategories } from './seeds/categories.js';
import { seedTips } from './seeds/tips.js';
/**
 * Seeds the admin account, shop categories and starter tips. Every step is safe
 * to repeat: nothing is duplicated and existing data is not overwritten.
 *
 *   npm start           runs `node dist/seed.js --on-start` before the server
 *   npm run seed        everything, by hand (always sets the admin password)
 *   npm run seed:admin  only the admin, by hand
 *
 * With --on-start, a failing step is logged and the server still starts.
 */
const onStart = process.argv.includes('--on-start');
const adminOnly = process.argv.includes('--admin-only');
const steps = adminOnly
    ? [['admin', () => seedAdmin(onStart)]]
    : [
        ['admin', () => seedAdmin(onStart)],
        ['categories', seedCategories],
        ['tips', seedTips],
    ];
async function main() {
    let failed = false;
    for (const [name, run] of steps) {
        try {
            await run();
        }
        catch (e) {
            failed = true;
            console.error(`[seed] ${name} failed:`, e?.message ?? e);
        }
    }
    await prisma.$disconnect();
    // On start, a seed problem must not keep the API down.
    if (failed && !onStart)
        process.exitCode = 1;
}
main();
