import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const categories = [
        { name: 'Fertilizers', description: 'Organic and synthetic nutrients to promote plant growth.' },
        { name: 'Pesticides', description: 'Chemical or biological agents to control pests and insects.' },
        { name: 'Herbicides', description: 'Chemicals used to control unwanted plants and weeds.' },
        { name: 'Fungicides', description: 'Chemical compounds used to prevent or eradicate fungal diseases.' },
        { name: 'Seeds & Seedlings', description: 'High-quality seeds and young plants for various crops.' },
        { name: 'Farming Tools', description: 'Hand tools like hoes, shovels, machetes, and rakes.' },
        { name: 'Heavy Machinery', description: 'Tractors, plows, harvesters, and other mechanized equipment.' },
        { name: 'Irrigation Equipment', description: 'Pumps, pipes, sprinklers, and drip irrigation systems.' },
        { name: 'Protective Gear', description: 'Safety equipment including gloves, boots, masks, and coveralls.' },
        { name: 'Organic Solutions', description: 'Eco-friendly, chemical-free alternatives for pest and soil management.' },
        { name: 'Animal Feed', description: 'Nutritious feed and supplements for livestock and poultry.' },
        { name: 'Harvesting Supplies', description: 'Bags, crates, sickles, and other supplies used during harvest.' }
    ];
    console.log('Seeding categories...');
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('✅ Successfully seeded agricultural categories!');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
