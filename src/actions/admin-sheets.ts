"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "gauravkatara53@gmail.com";

async function checkAdmin() {
  const { userId } = await auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userId || userEmail !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin access required.");
  }
  return userId;
}

export async function createPopularSheet(name: string, description: string, slug: string) {
  await checkAdmin();

  const sheet = await prisma.popularSheet.create({
    data: {
      name,
      description,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
    }
  });

  revalidatePath('/dsa-sheets');
  return sheet;
}

export async function updatePopularSheet(id: string, name: string, description: string) {
  await checkAdmin();

  const sheet = await prisma.popularSheet.update({
    where: { id },
    data: {
      name,
      description,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }
  });

  revalidatePath('/dsa-sheets');
  revalidatePath(`/dsa-sheets/popular/${sheet.slug}`);
  return sheet;
}

export async function importPopularQuestions(
  sheetId: string,
  questions: {
    problemUrl: string,
    topic?: string,
    subTopic?: string,
    platform?: string,
    topics?: string,
    title?: string,
    difficulty?: string
  }[]
) {
  await checkAdmin();

  const results = [];

  for (const q of questions) {
    if (!q.problemUrl) continue;

    // Normalize URL
    const normalizedUrl = q.problemUrl.replace(/\/$/, "");

    let question = null;
    if (normalizedUrl === "#" || normalizedUrl.length < 5) {
      question = await prisma.popularQuestion.findFirst({
        where: {
          problemUrl: normalizedUrl,
          name: q.title || extractNameFromUrl(normalizedUrl)
        }
      });
    } else {
      question = await prisma.popularQuestion.findFirst({
        where: { problemUrl: normalizedUrl }
      });
    }

    const topicsArray = q.topics ? q.topics.split(',').map(t => t.trim()).filter(Boolean) : [];
    const formattedDifficulty = q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) : "Medium";

    if (!question) {
      question = await prisma.popularQuestion.create({
        data: {
          name: q.title || extractNameFromUrl(normalizedUrl),
          problemUrl: normalizedUrl,
          platform: q.platform || extractPlatformFromUrl(normalizedUrl),
          difficulty: formattedDifficulty,
          topics: topicsArray
        }
      });
    } else {
      // Update existing question with new metadata if provided
      await prisma.popularQuestion.update({
        where: { id: question.id },
        data: {
          name: q.title || question.name,
          platform: q.platform || question.platform,
          difficulty: q.difficulty ? formattedDifficulty : question.difficulty,
          topics: topicsArray.length > 0 ? topicsArray : question.topics
        }
      });
    }

    // 2. Link to popular sheet
    const link = await prisma.popularSheetQuestion.create({
      data: {
        sheetId,
        questionId: question.id,
        topic: q.topic || "Uncategorized",
        subTopic: q.subTopic || "General"
      }
    });
    results.push(link);
  }

  revalidatePath(`/dsa-sheets/popular/${sheetId}`);
  revalidatePath('/dsa-sheets');
  return { success: true, count: results.length };
}

function extractNameFromUrl(url: string) {
  try {
    const parts = url.split('/');
    const last = parts[parts.length - 1] || parts[parts.length - 2] || "Untitled Question";
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
  if (url.includes("hackerrank.com")) return "HackerRank";
  if (url.includes("takeuforward.org")) return "TUF";
  return "Other";
}
