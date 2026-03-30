import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for orphaned CustomSheetQuestion records...');
  const customSheetQuestions = await prisma.customSheetQuestion.findMany();
  console.log(`Found ${customSheetQuestions.length} custom sheet questions.`);

  for (const csq of customSheetQuestions) {
    const question = await prisma.popularQuestion.findUnique({
      where: { id: csq.questionId }
    });
    if (!question) {
      console.log(`ORPHANED CustomSheetQuestion: ID ${csq.id}, Sheet ID ${csq.sheetId}, Question ID ${csq.questionId}`);
    }
  }

  console.log('Checking for orphaned PopularSheetQuestion records...');
  const popularSheetQuestions = await prisma.popularSheetQuestion.findMany();
  console.log(`Found ${popularSheetQuestions.length} popular sheet questions.`);

  for (const psq of popularSheetQuestions) {
    const question = await prisma.popularQuestion.findUnique({
      where: { id: psq.questionId }
    });
    if (!question) {
      console.log(`ORPHANED PopularSheetQuestion: ID ${psq.id}, Sheet ID ${psq.sheetId}, Question ID ${psq.questionId}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
