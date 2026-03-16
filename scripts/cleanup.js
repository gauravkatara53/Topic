const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Starting cleanup script...");
    const allFiles = await prisma.file.findMany();
    let deletedCount = 0;

    for (const file of allFiles) {
        if (file.uploaderId) {
            const user = await prisma.user.findUnique({
                where: { id: file.uploaderId }
            });

            if (!user) {
                console.log(`Deleting orphaned file with ID: ${file.id}`);
                await prisma.file.delete({
                    where: { id: file.id }
                });
                deletedCount++;
            }
        }
    }

    console.log(`Cleanup finished. Deleted ${deletedCount} orphaned files.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
