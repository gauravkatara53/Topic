"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomSheet(name: string, description?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const sheet = await prisma.userCustomSheet.create({
    data: {
      userId,
      name,
      description: description || "New Sheet Description",
    }
  });

  revalidatePath('/dsa-sheets');
  revalidatePath('/dsa-sheets/my-sheets');
  return sheet;
}

export async function updateCustomSheet(sheetId: string, data: { name?: string, description?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const sheet = await prisma.userCustomSheet.findUnique({
    where: { id: sheetId }
  });

  if (!sheet || sheet.userId !== userId) throw new Error("Unauthorized");

  const updated = await prisma.userCustomSheet.update({
    where: { id: sheetId },
    data
  });

  revalidatePath(`/dsa-sheets/custom/${sheetId}`);
  revalidatePath('/dsa-sheets');
  return updated;
}

export async function deleteCustomSheet(sheetId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const sheet = await prisma.userCustomSheet.findUnique({
    where: { id: sheetId }
  });

  if (!sheet || sheet.userId !== userId) throw new Error("Unauthorized or Sheet not found");

  await prisma.userCustomSheet.delete({
    where: { id: sheetId }
  });

  revalidatePath('/dsa-sheets');
  return { success: true };
}

export async function importCustomQuestions(sheetId: string, questions: { problemUrl: string, topic?: string, subTopic?: string }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const sheet = await prisma.userCustomSheet.findUnique({
    where: { id: sheetId }
  });

  if (!sheet || sheet.userId !== userId) throw new Error("Unauthorized or Sheet not found");

  const results = [];

  for (const q of questions) {
    if (!q.problemUrl) continue;

    // Normalize URL (strip trailing slash)
    const normalizedUrl = q.problemUrl.replace(/\/$/, "");

    // 1. Find or create the PopularQuestion record
    let question = await prisma.popularQuestion.findFirst({
      where: { problemUrl: { equals: normalizedUrl, mode: 'insensitive' } }
    });

    if (!question) {
      const name = extractNameFromUrl(normalizedUrl);
      const platform = extractPlatformFromUrl(normalizedUrl);
      
      question = await prisma.popularQuestion.create({
        data: {
          name,
          problemUrl: normalizedUrl,
          platform,
          difficulty: "Medium",
          topics: q.topic ? [q.topic] : []
        }
      });
    }

    // 2. Link to custom sheet (avoid duplicates in same sheet)
    const existingLink = await prisma.customSheetQuestion.findFirst({
      where: {
        sheetId,
        questionId: question.id
      }
    });

    if (!existingLink) {
      const link = await prisma.customSheetQuestion.create({
        data: {
          sheetId,
          questionId: question.id,
          topic: q.topic,
          subTopic: q.subTopic
        }
      });
      results.push(link);
    }
  }

  revalidatePath(`/dsa-sheets/custom/${sheetId}`);
  revalidatePath('/dsa-sheets');
  return { success: true, count: results.length };
}

export async function removeQuestionFromCustomSheet(linkId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const link = await prisma.customSheetQuestion.findUnique({
    where: { id: linkId },
    include: { sheet: true }
  });

  if (!link || link.sheet.userId !== userId) throw new Error("Unauthorized");

  await prisma.customSheetQuestion.delete({
    where: { id: linkId }
  });

  revalidatePath(`/dsa-sheets/custom/${link.sheetId}`);
  return { success: true };
}

function extractNameFromUrl(url: string) {
  try {
    const parts = url.split('/');
    const last = parts[parts.length - 1] || parts[parts.length - 2] || "Untitled Question";
    
    // Replace hyphens/underscores and capitalize
    return last.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  } catch {
    return "Untitled Question";
  }
}

function extractPlatformFromUrl(url: string) {
  if (url.includes("leetcode.com")) return "LeetCode";
  if (url.includes("geeksforgeeks.org")) return "GFG";
  if (url.includes("interviewbit.com")) return "InterviewBit";
  if (url.includes("codeforces.com")) return "Codeforces";
  if (url.includes("codechef.com")) return "CodeChef";
  return "Other";
}
