import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find any user to act as the author, or create a placeholder if the DB is empty
    let user = await prisma.user.findFirst();

    if (!user) {
        user = await prisma.user.create({
            data: {
                phoneNumber: '000000000',
                name: 'Agri AI Expert',
                userType: 'ADMIN',
            }
        });
    }

    const tips = [
        {
            title: 'Optimal Watering Times',
            content: 'Water your crops early in the morning or late in the afternoon to minimize evaporation and prevent fungal diseases. Avoid watering in the midday sun when evaporation is highest.',
            status: 'APPROVED',
            authorId: user.id,
        },
        {
            title: 'Companion Planting Basics',
            content: 'Planting marigolds near your tomatoes can help deter nematodes and other harmful pests naturally. This traditional method reduces the need for harsh chemical pesticides.',
            status: 'APPROVED',
            authorId: user.id,
        },
        {
            title: 'Soil Health Maintenance',
            content: 'Regular crop rotation and adding organic compost at the end of every season keeps your soil rich in essential nutrients, improves water retention, and maximizes yield.',
            status: 'APPROVED',
            authorId: user.id,
        }
    ];

    console.log(`Creating tips by author: ${user.name || user.phoneNumber}`);

    for (const tip of tips) {
        await prisma.tip.create({
            data: tip as any
        });
    }

    console.log('✅ Successfully created 3 tips in the database!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
