import prisma from '../shared/prisma/prisma.service.js';

const CATEGORIES = [
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
    { name: 'Harvesting Supplies', description: 'Bags, crates, sickles, and other supplies used during harvest.' },
];

/** Adds any missing shop categories. Existing ones (and admin edits to them) are left alone. */
export async function seedCategories() {
    let created = 0;
    for (const category of CATEGORIES) {
        const exists = await prisma.category.findUnique({ where: { name: category.name } });
        if (!exists) {
            await prisma.category.create({ data: category });
            created++;
        }
    }
    console.log(`[seed] categories: ${created} created, ${CATEGORIES.length - created} already there.`);
}
