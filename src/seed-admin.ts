import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from './shared/prisma/prisma.service.js';

/**
 * Creates (or promotes) the admin account used to log in to the admin app.
 * Login is by phone number + password.
 *
 * Automatically, on every server start (`npm start` runs it with --on-start):
 *   - needs ADMIN_PASSWORD in the environment, otherwise it does nothing
 *   - creates the admin if it doesn't exist, or makes sure it's an ADMIN
 *   - never changes an existing password unless ADMIN_RESET_PASSWORD=true
 *   - never stops the server from starting
 *
 * By hand (`npm run seed:admin`):
 *   - always sets the password: ADMIN_PASSWORD, or a random one printed once
 *
 * Defaults can be overridden with ADMIN_PHONE, ADMIN_EMAIL and ADMIN_NAME.
 */
const onStart = process.argv.includes('--on-start');
const phoneNumber = process.env.ADMIN_PHONE || '670010386';
const email = process.env.ADMIN_EMAIL || 'maximebichenyi@gmail.com';
const name = process.env.ADMIN_NAME || 'AgriAI Admin';

async function main() {
    if (onStart && !process.env.ADMIN_PASSWORD) {
        console.log('[seed-admin] ADMIN_PASSWORD not set, skipping admin seed.');
        return;
    }

    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    const setPassword = !existing || !onStart || process.env.ADMIN_RESET_PASSWORD === 'true' || !existing.passwordHash;

    // Don't take an email that already belongs to a different account.
    const emailOwner = await prisma.user.findUnique({ where: { email } });
    const emailFree = !emailOwner || emailOwner.id === existing?.id;
    if (!emailFree) {
        console.warn(`[seed-admin] ${email} already belongs to another account; leaving it there.`);
    }

    const passwordData = setPassword ? { passwordHash: await bcrypt.hash(password, 10) } : {};
    const emailData = emailFree ? { email } : {};

    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: { userType: 'ADMIN', name: existing.name || name, ...emailData, ...passwordData },
        });
    } else {
        await prisma.user.create({
            data: { phoneNumber, name, userType: 'ADMIN', ...emailData, ...passwordData },
        });
    }

    console.log(`[seed-admin] Admin ${existing ? 'checked' : 'created'}: ${phoneNumber}${setPassword ? ' (password set)' : ''}`);
    if (!process.env.ADMIN_PASSWORD) {
        console.log(`[seed-admin] Password: ${password}   <- shown once, save it now`);
    }
}

main()
    .catch((e) => {
        console.error('[seed-admin] Could not seed the admin:', e?.message ?? e);
        // On start, a seed problem must not keep the API down.
        if (!onStart) process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
