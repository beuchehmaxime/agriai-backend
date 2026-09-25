import prisma from '../shared/prisma/prisma.service.js';
import { ADMIN_PHONE } from './admin.js';

const TIPS = [
    {
        title: 'Optimal Watering Times',
        content: 'Water your crops early in the morning or late in the afternoon to minimize evaporation and prevent fungal diseases. Avoid watering in the midday sun when evaporation is highest.',
    },
    {
        title: 'Companion Planting Basics',
        content: 'Planting marigolds near your tomatoes can help deter nematodes and other harmful pests naturally. This traditional method reduces the need for harsh chemical pesticides.',
    },
    {
        title: 'Soil Health Maintenance',
        content: 'Regular crop rotation and adding organic compost at the end of every season keeps your soil rich in essential nutrients, improves water retention, and maximizes yield.',
    },
];

/**
 * Adds the starter farming tips (approved), written by the admin account.
 * A tip whose title already exists is skipped, so nothing is duplicated.
 */
export async function seedTips() {
    const author = await prisma.user.findUnique({ where: { phoneNumber: ADMIN_PHONE } })
        ?? await prisma.user.findFirst({ where: { userType: 'ADMIN' }, orderBy: { createdAt: 'asc' } });

    if (!author) {
        console.log('[seed] tips: no admin account yet to author them, skipped.');
        return;
    }

    let created = 0;
    for (const tip of TIPS) {
        const exists = await prisma.tip.findFirst({ where: { title: tip.title } });
        if (!exists) {
            await prisma.tip.create({ data: { ...tip, status: 'APPROVED', authorId: author.id } });
            created++;
        }
    }
    console.log(`[seed] tips: ${created} created, ${TIPS.length - created} already there.`);
}
