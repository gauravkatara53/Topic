"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFollowSheet(companyId: string, isFollowing: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure user exists locally
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error("User record not fully initialized");
  }

  if (isFollowing) {
    await prisma.userFollowedSheet.deleteMany({
      where: {
        userId,
        companyId
      }
    });
  } else {
    // Follow
    await prisma.userFollowedSheet.upsert({
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

  revalidatePath('/dsa-sheets');
  revalidatePath(`/dsa-sheets/${companyId}`);
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

  await prisma.userQuestionRevision.upsert({
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
  });

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
    await prisma.userCompletedQuestion.upsert({
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
    await prisma.userCompletedQuestion.deleteMany({
      where: { userId, questionId }
    });
  }

  revalidatePath("/dsa-sheets");
  return { success: true };
}

export async function updateRevisionStatus(questionId: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.userQuestionRevision.updateMany({
    where: {
      userId,
      questionId
    },
    data: { status }
  });

  revalidatePath("/dsa-sheets");
  return { success: true };
}

export async function toggleQuestionStar(
  questionId: string,
  companyId: string,
  isNowStarred: boolean
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (isNowStarred) {
    await prisma.userStarredQuestion.upsert({
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
    await prisma.userStarredQuestion.deleteMany({
      where: { userId, questionId }
    });
  }

  revalidatePath("/dsa-sheets");
  return { success: true };
}

export async function updateFollowedSheetTheme(companyId: string, theme: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.userFollowedSheet.update({
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

  revalidatePath('/dsa-sheets');
  return { success: true };
}

export async function updateQuestionHighlight(questionId: string, companyId: string, theme: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.userQuestionHighlight.upsert({
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

  revalidatePath('/dsa-sheets');
  revalidatePath(`/dsa-sheets/${companyId}`);
  return { success: true };
}
export async function togglePopularSheetFollow(popularSheetId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await prisma.userFollowedPopularSheet.findUnique({
    where: {
      userId_popularSheetId: { userId, popularSheetId }
    }
  });

  if (existing) {
    await prisma.userFollowedPopularSheet.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.userFollowedPopularSheet.create({
      data: { userId, popularSheetId }
    });
  }

  revalidatePath('/dsa-sheets');
  return { success: true };
}

export async function updateQuestionNote(questionId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.userQuestionNote.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: { content },
    create: { userId, questionId, content }
  });

  return { success: true };
}
