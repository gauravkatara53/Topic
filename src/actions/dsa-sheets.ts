"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hydrateQuestions } from "@/lib/dsa-questions";

export async function toggleFollowSheet(companyId: string, isFollowing: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure user exists locally
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error("User record not fully initialized");
  }

  if (isFollowing) {
    await (prisma as any).userFollowedSheet.deleteMany({
      where: {
        userId,
        companyId
      }
    });
  } else {
    // Follow
    await (prisma as any).userFollowedSheet.upsert({
      where: {
        userId_companyId: {
          userId,
          companyId
        }
      },
      create: {
        userId,
        companyId
      },
      update: {}
    });
  }

  revalidatePath('/dsa-sheets', 'layout');
  return { success: true };
}

export async function updateQuestionRevision(
  questionId: string, 
  companyId: string | null,
  lastRevised: Date | null, 
  nextRevision: Date | null, 
  status: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error("User record not fully initialized");
  }

  // 1. Get existing record for history tracking
  const existing = await (prisma as any).userQuestionRevision.findUnique({
    where: {
      userId_questionId: { userId, questionId }
    }
  });

  // 2. Calculate revision number and days gap
  const historyCount = await (prisma as any).revisionHistory.count({
    where: { userId, questionId }
  });
  const revisionNumber = historyCount + 1;

  const daysGap = existing?.lastRevised && lastRevised
    ? Math.floor((lastRevised.getTime() - new Date(existing.lastRevised).getTime()) / 86400000)
    : null;

  // 3. Transaction: insert history + upsert current state
  // IMPORTANT: This function handles SCHEDULING, not completion.
  // History entries from scheduling are "Scheduled" — only updateRevisionStatus()
  // creates "Completed" events, which are the sole source for analytics/stats.
  await (prisma as any).$transaction([
    (prisma as any).revisionHistory.create({
      data: {
        userId,
        questionId,
        companyId,
        revisionNumber,
        revisedAt: lastRevised || new Date(),
        nextRevisionDate: nextRevision,
        previousNextDate: existing?.nextRevision || null,
        status: "Scheduled",
        daysGap,
      }
    }),
    (prisma as any).userQuestionRevision.upsert({
      where: {
        userId_questionId: { userId, questionId }
      },
      create: {
        userId,
        questionId,
        companyId,
        lastRevised,
        nextRevision,
        status
      },
      update: {
        companyId,
        lastRevised,
        nextRevision,
        status
      }
    })
  ]);

  revalidatePath("/dsa-sheets", "layout");
  return { success: true };
}

export async function toggleQuestionCompletion(
  questionId: string,
  companyId: string,
  isNowCompleted: boolean
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (isNowCompleted) {
    await (prisma as any).userCompletedQuestion.upsert({
      where: {
        userId_questionId: { userId, questionId }
      },
      update: { companyId },
      create: {
        userId,
        questionId,
        companyId
      }
    });
  } else {
    await (prisma as any).userCompletedQuestion.deleteMany({
      where: { userId, questionId }
    });
  }

  revalidatePath("/dsa-sheets", "layout");
  return { success: true };
}

export async function updateRevisionStatus(questionId: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (status === 'Completed') {
    // Get existing record for history tracking
    const existing = await (prisma as any).userQuestionRevision.findUnique({
      where: { userId_questionId: { userId, questionId } }
    });

    const historyCount = await (prisma as any).revisionHistory.count({
      where: { userId, questionId }
    });

    const now = new Date();

    await (prisma as any).$transaction([
      (prisma as any).revisionHistory.create({
        data: {
          userId,
          questionId,
          companyId: existing?.companyId || null,
          revisionNumber: historyCount + 1,
          revisedAt: now,
          nextRevisionDate: existing?.nextRevision || null,
          previousNextDate: existing?.nextRevision || null,
          status: "Completed",
          daysGap: existing?.lastRevised
            ? Math.floor((now.getTime() - new Date(existing.lastRevised).getTime()) / 86400000)
            : null,
        }
      }),
      (prisma as any).userQuestionRevision.updateMany({
        where: { userId, questionId },
        data: { status, lastRevised: now }
      })
    ]);
  } else {
    await (prisma as any).userQuestionRevision.updateMany({
      where: { userId, questionId },
      data: { status }
    });
  }

  revalidatePath("/dsa-sheets", "layout");
  return { success: true };
}

export async function getRevisionHistory(questionId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  const history = await (prisma as any).revisionHistory.findMany({
    where: { userId, questionId },
    orderBy: { revisedAt: 'desc' }
  });

  return history;
}

export async function toggleQuestionStar(
  questionId: string,
  companyId: string,
  isNowStarred: boolean
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (isNowStarred) {
    await (prisma as any).userStarredQuestion.upsert({
      where: {
        userId_questionId: { userId, questionId }
      },
      update: { companyId },
      create: {
        userId,
        questionId,
        companyId
      }
    });
  } else {
    await (prisma as any).userStarredQuestion.deleteMany({
      where: { userId, questionId }
    });
  }

  revalidatePath("/dsa-sheets", "layout");
  return { success: true };
}

export async function updateFollowedSheetTheme(companyId: string, theme: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await (prisma as any).userFollowedSheet.update({
    where: {
      userId_companyId: {
        userId,
        companyId
      }
    },
    data: {
      colorTheme: theme
    }
  });

  revalidatePath('/dsa-sheets', 'layout');
  return { success: true };
}

export async function updateQuestionHighlight(questionId: string, companyId: string, theme: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await (prisma as any).userQuestionHighlight.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId
      }
    },
    create: {
      userId,
      questionId,
      companyId,
      colorTheme: theme
    },
    update: {
      colorTheme: theme,
      companyId
    }
  });

  revalidatePath('/dsa-sheets', 'layout');
  return { success: true };
}
export async function togglePopularSheetFollow(popularSheetId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await (prisma as any).userFollowedPopularSheet.findUnique({
    where: {
      userId_popularSheetId: { userId, popularSheetId }
    }
  });

  if (existing) {
    await (prisma as any).userFollowedPopularSheet.delete({
      where: { id: existing.id }
    });
  } else {
    await (prisma as any).userFollowedPopularSheet.create({
      data: { userId, popularSheetId }
    });
  }

  revalidatePath('/dsa-sheets', 'layout');
  return { success: true };
}

export async function updateQuestionNote(questionId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await (prisma as any).userQuestionNote.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: { content },
    create: { userId, questionId, content }
  });

  return { success: true };
}

export async function getRevisionsForDate(dateString: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) return [];

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const revisions = await (prisma as any).userQuestionRevision.findMany({
    where: {
      userId,
      nextRevision: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  if (revisions.length === 0) return [];

  const qIds = revisions.map((r: any) => r.questionId);
  const questionMap = await hydrateQuestions(qIds);

  return revisions.map((r: any) => {
    const matchingQ = questionMap.get(r.questionId);
    return {
      id: r.id,
      questionId: r.questionId,
      status: r.status,
      nextRevision: r.nextRevision,
      question: matchingQ || { title: "Unknown Question", difficulty: "Medium", id: r.questionId }
    };
  }).filter((r: any) => r.question);
}
