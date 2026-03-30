const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup of orphaned question references...');

  // 1. Cleanup CustomSheetQuestion
  const customSheetQuestions = await prisma.customSheetQuestion.findMany({
    select: { id: true, questionId: true }
  });

  let csqDeleted = 0;
  for (const csq of customSheetQuestions) {
    const questionExists = await prisma.popularQuestion.findUnique({
      where: { id: csq.questionId },
      select: { id: true }
    });

    if (!questionExists) {
      console.log(`Deleting orphaned CustomSheetQuestion: ${csq.id} (refers to missing question ${csq.questionId})`);
      await prisma.customSheetQuestion.delete({
        where: { id: csq.id }
      });
      csqDeleted++;
    }
  }

  // 2. Cleanup PopularSheetQuestion
  const popularSheetQuestions = await prisma.popularSheetQuestion.findMany({
    select: { id: true, questionId: true }
  });

  let psqDeleted = 0;
  for (const psq of popularSheetQuestions) {
    const questionExists = await prisma.popularQuestion.findUnique({
      where: { id: psq.questionId },
      select: { id: true }
    });

    if (!questionExists) {
      console.log(`Deleting orphaned PopularSheetQuestion: ${psq.id} (refers to missing question ${psq.questionId})`);
      await prisma.popularSheetQuestion.delete({
        where: { id: psq.id }
      });
      psqDeleted++;
    }
  }

  console.log('--- Cleanup Summary ---');
  console.log(`CustomSheetQuestions deleted: ${csqDeleted}`);
  console.log(`PopularSheetQuestions deleted: ${psqDeleted}`);
}

main()
  .catch(e => {
    console.error('Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
