import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from './shared/prisma/prisma.service.js';

/**
 * Creates (or promotes) the admin account used to log in to the admin app.
 *
 *   npm run seed:admin
 *
 * Login is by phone number + password. Override the defaults with
 * ADMIN_PHONE, ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD. Without
 * ADMIN_PASSWORD a random password is generated and printed once.
 * Running it again resets the password and keeps the account an admin.
 */
const phoneNumber = process.env.ADMIN_PHONE || '670010386';
const email = process.env.ADMIN_EMAIL || 'maximebichenyi@gmail.com';
const name = process.env.ADMIN_NAME || 'AgriAI Admin';
const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');

async function main() {
    const passwordHash = await bcrypt.hash(password, 10);

    // Don't take an email that already belongs to a different account.
    const emailOwner = await prisma.user.findUnique({ where: { email } });
    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    const emailFree = !emailOwner || emailOwner.id === existing?.id;
    if (!emailFree) {
        console.warn(`⚠️  ${email} already belongs to another account (${emailOwner!.phoneNumber}); leaving it there.`);
    }

    const user = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: { userType: 'ADMIN', passwordHash, ...(emailFree ? { email } : {}), name: existing.name || name },
        })
        : await prisma.user.create({
            data: { phoneNumber, name, userType: 'ADMIN', passwordHash, ...(emailFree ? { email } : {}) },
        });

    console.log(`✅ Admin ${existing ? 'updated' : 'created'}`);
    console.log(`   Phone:    ${user.phoneNumber}`);
    console.log(`   Email:    ${user.email ?? '(none)'}`);
    if (!process.env.ADMIN_PASSWORD) {
        console.log(`   Password: ${password}   <- shown once, save it now`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Could not seed the admin:', e.message ?? e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
