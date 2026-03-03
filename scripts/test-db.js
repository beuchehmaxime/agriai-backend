import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Connecting to Prisma...');
    try {
        await prisma.$connect();
        console.log('✅ Connected to database');
        const count = await prisma.user.count();
        console.log(`✅ User count: ${count}`);
    }
    catch (e) {
        console.error('❌ Connection failed:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
