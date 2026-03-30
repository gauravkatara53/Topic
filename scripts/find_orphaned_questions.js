const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for orphaned CustomSheetQuestion records...');
  // For MongoDB, findMany might return a lot, but let's assume it's manageable for a dev script
  const customSheetQuestions = await prisma.customSheetQuestion.findMany({
    select: { id: true, questionId: true, sheetId: true }
  });
  console.log(`Found ${customSheetQuestions.length} custom sheet questions.`);

  let orphanedCount = 0;
  for (const csq of customSheetQuestions) {
    const question = await prisma.popularQuestion.findUnique({
      where: { id: csq.questionId }
    });
    if (!question) {
      console.log(`ORPHANED CustomSheetQuestion: ID ${csq.id}, Sheet ID ${csq.sheetId}, Question ID ${csq.questionId}`);
      orphanedCount++;
    }
  }
  console.log(`Total orphaned custom sheet questions: ${orphanedCount}`);

  console.log('---');

  console.log('Checking for orphaned PopularSheetQuestion records...');
  const popularSheetQuestions = await prisma.popularSheetQuestion.findMany({
    select: { id: true, questionId: true, sheetId: true }
  });
  console.log(`Found ${popularSheetQuestions.length} popular sheet questions.`);

  let popularOrphanedCount = 0;
  for (const psq of popularSheetQuestions) {
    const question = await prisma.popularQuestion.findUnique({
      where: { id: psq.questionId }
    });
    if (!question) {
      console.log(`ORPHANED PopularSheetQuestion: ID ${psq.id}, Sheet ID ${psq.sheetId}, Question ID ${psq.questionId}`);
      popularOrphanedCount++;
    }
  }
  console.log(`Total orphaned popular sheet questions: ${popularOrphanedCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
