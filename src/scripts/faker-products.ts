import "dotenv/config";
import { faker } from "@faker-js/faker";
import prisma from "../utils/prisma.js";

/**
 * Updates ALL existing products with Faker-generated:
 * - title
 * - description
 *
 * It does NOT touch:
 * - image
 * - price, stock, rating, features, categories, etc.
 *
 * Usage:
 *   npm run faker:products
 *
 * Optional env vars:
 *   FAKER_SEED=123        (deterministic output)
 *   FAKER_LOCALE=en       (if you want a specific locale; defaults to faker's default)
 */
async function main() {
    console.log("🧪 Faker Products: generating title + description for all products…");

    const seedRaw = process.env.FAKER_SEED;
    if (seedRaw) {
        const seedNum = Number(seedRaw);
        if (!Number.isFinite(seedNum)) {
            throw new Error(
                `FAKER_SEED must be a number if provided. Received: ${seedRaw}`,
            );
        }
        faker.seed(seedNum);
        console.log(`🔒 Using deterministic faker seed: ${seedNum}`);
    }

    // Pull only what we need; importantly we are NOT updating image.
    const products = await prisma.product.findMany({
        select: { id: true, title: true, image: true },
    });

    console.log(`📦 Found ${products.length} products.`);

    let updated = 0;

    // Update sequentially to keep logs readable and avoid hammering DB.
    for (const p of products) {
        // Generate something product-ish and relatively safe for ecommerce.
        // We keep the title reasonably short so UI doesn't explode.
        const adjective = faker.commerce.productAdjective();
        const material = faker.commerce.productMaterial();
        const product = faker.commerce.product();

        const title = `${adjective} ${material} ${product}`.slice(0, 80);

        // A slightly richer description (1–3 paragraphs).
        const bullets = Array.from({ length: faker.number.int({ min: 3, max: 6 }) }).map(
            () => `- ${faker.commerce.productDescription()}`,
        );

        const description = [
            faker.commerce.productDescription(),
            "",
            "Highlights:",
            ...bullets,
            "",
            faker.lorem.sentences({ min: 1, max: 2 }),
        ]
            .join("\n")
            .slice(0, 2000); // keep it bounded

        await prisma.product.update({
            where: { id: p.id },
            data: {
                title,
                description,
            },
        });

        updated++;
        if (updated % 25 === 0 || updated === products.length) {
            console.log(`✅ Updated ${updated}/${products.length}`);
        }
    }

    console.log(`✨ Done. Updated ${updated} products (image links untouched).`);
}

main()
    .catch((e) => {
        console.error("❌ faker-products failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
