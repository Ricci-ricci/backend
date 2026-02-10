import fs from "fs";
import path from "path";
import prisma from "./utils/prisma.js";

const IMAGES_DIR = path.join(process.cwd(), "uploads", "images");

const POSSIBLE_FEATURES = [
    "Waterproof",
    "Lightweight Design",
    "Premium Leather",
    "Shock Absorbent",
    "Eco-friendly Materials",
    "Breathable Mesh",
    "Non-slip Sole",
    "Quick Dry",
    "Memory Foam Insole",
    "Reflective Details",
    "All-day Comfort",
    "Limited Edition",
    "Sustainable Packaging",
    "High Durability",
    "Flexible Fit",
    "Arch Support",
];

const CATEGORY_NAMES = [
    "Running",
    "Lifestyle",
    "Training",
    "Basketball",
    "Outdoor",
];

function getRandomFeatures(count: number = 3): string[] {
    const shuffled = [...POSSIBLE_FEATURES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomPrice(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Converts "My_Cool_Image (1).jpg" -> "My Cool Image"
function cleanTitle(filename: string): string {
    const nameWithoutExt = path.parse(filename).name;

    // Replace underscores, dashes with spaces
    let title = nameWithoutExt.replace(/[_\-]/g, " ");

    // Remove file duplicate markers like (1), (2)
    title = title.replace(/\(\d+\)/g, "");

    // Remove extra whitespace
    title = title.replace(/\s+/g, " ").trim();

    // If title is too short or empty (happens with files named _.jpeg), give a generic name
    if (!title || title.length < 3) {
        const adjectives = [
            "Classic",
            "Modern",
            "Urban",
            "Performance",
            "Elite",
        ];
        const nouns = ["Sneaker", "Runner", "Trainer", "Sportswear", "Kicks"];
        const randomAdjective =
            adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${randomAdjective} ${randomNoun}`;
    }

    // Truncate if too long
    if (title.length > 50) {
        title = title.substring(0, 47) + "...";
    }

    return title;
}

// Converts "My Image.jpg" -> "my-image.jpg" to ensure browser compatibility
function sanitizeFilename(filename: string): string {
    const ext = path.extname(filename);
    const name = path.parse(filename).name;
    const sanitizedName = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-") // Replace special chars with -
        .replace(/-+/g, "-") // Remove duplicate dashes
        .replace(/^-|-$/g, ""); // Remove leading/trailing dashes

    // Add a random suffix to avoid collision if two files reduce to the same slug
    const uniqueSuffix = Math.floor(Math.random() * 1000);
    return `${sanitizedName}-${uniqueSuffix}${ext}`;
}

async function main() {
    console.log("🌱 Starting seed script...");

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error(`❌ Images directory not found at: ${IMAGES_DIR}`);
        process.exit(1);
    }

    // 1. Clear Database
    console.log("🧹 Clearing database...");
    try {
        // Delete related data first to avoid foreign key constraints (though MongoDB is flexible)
        await prisma.orderItem.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        console.log("✔ Database cleared.");
    } catch (error) {
        console.error("Error clearing database:", error);
    }

    // 2. Create Categories
    console.log("📂 Creating categories...");
    const createdCategories = [];
    for (const name of CATEGORY_NAMES) {
        const cat = await prisma.category.create({
            data: { name },
        });
        createdCategories.push(cat);
    }
    console.log(`✔ Created ${createdCategories.length} categories.`);

    // 3. Process Images and Create Products
    const files = fs.readdirSync(IMAGES_DIR);

    // Filter for image files
    const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    });

    console.log(`📸 Found ${imageFiles.length} images.`);

    let createdCount = 0;

    for (const file of imageFiles) {
        try {
            const originalPath = path.join(IMAGES_DIR, file);

            // Generate clean title from original filename before renaming
            const title = cleanTitle(file);

            // Rename file to be web-safe (slugified)
            const newFilename = sanitizeFilename(file);
            const newPath = path.join(IMAGES_DIR, newFilename);

            // Rename on disk
            fs.renameSync(originalPath, newPath);

            const features = getRandomFeatures(
                Math.floor(Math.random() * 3) + 2,
            ); // 2 to 4 features
            const price = getRandomPrice(50, 300);

            // Assign a random category
            // If categories were not created for any reason, skip product creation
            // (prevents randomCategory being undefined and failing the seed run)
            if (createdCategories.length === 0) {
                console.warn(
                    `⚠️ No categories available; skipping product creation for image ${file}`,
                );
                continue;
            }

            const randomCategory =
                createdCategories[
                    Math.floor(Math.random() * createdCategories.length)
                ];

            // Should be impossible due to the length-check above, but keeps TypeScript happy
            if (!randomCategory) {
                console.warn(
                    `⚠️ Failed to pick a random category; skipping product creation for image ${file}`,
                );
                continue;
            }

            // The path accessible via static file server
            const imagePath = `/uploads/images/${newFilename}`;

            await prisma.product.create({
                data: {
                    title: title,
                    description: `Experience the best quality with the ${title}. Featuring top-tier materials and design suitable for any occasion.`,
                    price: price,
                    stock: Math.floor(Math.random() * 100),
                    published: true,
                    image: imagePath,
                    features: features,
                    categoryId: randomCategory.id,
                    categoryName: randomCategory.name,
                },
            });

            createdCount++;
        } catch (error) {
            console.error(
                `❌ Failed to create product for image ${file}:`,
                error,
            );
        }
    }

    console.log(`\n✨ Seeding completed! Created ${createdCount} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
