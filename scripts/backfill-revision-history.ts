import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BATCH_SIZE = 100;

async function main() {
  console.log('🔄 Starting RevisionHistory backfill...\n');

  // 1. Count total records
  const totalCount = await (prisma as any).userQuestionRevision.count();
  console.log(`📊 Found ${totalCount} UserQuestionRevision records to process.\n`);

  if (totalCount === 0) {
    console.log('✅ No records to process. Exiting.');
    return;
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;
  let processed = 0;

  // 2. Process in batches
  for (let skip = 0; skip < totalCount; skip += BATCH_SIZE) {
    const batch = await (prisma as any).userQuestionRevision.findMany({
      skip,
      take: BATCH_SIZE,
      orderBy: { createdAt: 'asc' },
    });

    for (const revision of batch) {
      processed++;

      try {
        // 3. Idempotency check: see if a RevisionHistory already exists for this userId+questionId
        const existingHistory = await (prisma as any).revisionHistory.findFirst({
          where: {
            userId: revision.userId,
            questionId: revision.questionId,
          },
        });

        if (existingHistory) {
          skipped++;
          continue;
        }

        // 4. Determine the revisedAt date and status
        const revisedAt = revision.lastRevised ?? revision.createdAt;
        const status = revision.lastRevised ? 'Completed' : 'Pending';

        // 5. Create the initial RevisionHistory entry
        await (prisma as any).revisionHistory.create({
          data: {
            userId: revision.userId,
            questionId: revision.questionId,
            companyId: revision.companyId ?? null,
            revisionNumber: 1,
            revisedAt,
            nextRevisionDate: revision.nextRevision ?? null,
            previousNextDate: null,
            status,
            daysGap: null,
            notes: 'Backfilled from existing revision data',
          },
        });

        created++;
      } catch (error: any) {
        errors++;
        console.error(
          `❌ Error processing record ${revision.id} (user: ${revision.userId}, question: ${revision.questionId}): ${error.message}`
        );
      }
    }

    // 6. Log progress
    console.log(`Processing ${Math.min(processed, totalCount)} of ${totalCount} records...`);
  }

  // 7. Log summary
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Backfill complete: ${created} entries created, ${skipped} skipped (already existed)`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors encountered during processing`);
  }
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('Fatal error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
