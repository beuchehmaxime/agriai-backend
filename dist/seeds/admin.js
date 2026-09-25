import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../shared/prisma/prisma.service.js';
export const ADMIN_PHONE = process.env.ADMIN_PHONE || '670010386';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'maximebichenyi@gmail.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'AgriAI Admin';
/**
 * Creates the admin account (login: phone + password) or makes sure it's an ADMIN.
 *
 * On start: needs ADMIN_PASSWORD (otherwise skipped), and only changes an existing
 * password when ADMIN_RESET_PASSWORD=true. By hand: always sets the password,
 * using ADMIN_PASSWORD or a random one that is printed once.
 */
export async function seedAdmin(onStart) {
    if (onStart && !process.env.ADMIN_PASSWORD) {
        console.log('[seed] admin: ADMIN_PASSWORD not set, skipped.');
        return;
    }
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
    const existing = await prisma.user.findUnique({ where: { phoneNumber: ADMIN_PHONE } });
    const setPassword = !existing || !onStart || !existing.passwordHash || process.env.ADMIN_RESET_PASSWORD === 'true';
    // Don't take an email that already belongs to a different account.
    const emailOwner = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    const emailFree = !emailOwner || emailOwner.id === existing?.id;
    if (!emailFree) {
        console.warn(`[seed] admin: ${ADMIN_EMAIL} already belongs to another account; leaving it there.`);
    }
    const passwordData = setPassword ? { passwordHash: await bcrypt.hash(password, 10) } : {};
    const emailData = emailFree ? { email: ADMIN_EMAIL } : {};
    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: { userType: 'ADMIN', name: existing.name || ADMIN_NAME, ...emailData, ...passwordData },
        });
    }
    else {
        await prisma.user.create({
            data: { phoneNumber: ADMIN_PHONE, name: ADMIN_NAME, userType: 'ADMIN', ...emailData, ...passwordData },
        });
    }
    console.log(`[seed] admin: ${existing ? 'checked' : 'created'} ${ADMIN_PHONE}${setPassword ? ' (password set)' : ''}`);
    if (!process.env.ADMIN_PASSWORD) {
        console.log(`[seed] admin: password ${password}   <- shown once, save it now`);
    }
}
