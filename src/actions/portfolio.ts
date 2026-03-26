"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { scrapeAllPlatforms } from "@/lib/scrapers";

export async function linkPlatformHandle(platform: string, url: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validate URL/handle extraction logic could be here
  const handle = url.split("/").filter(Boolean).pop() || "";

  try {
    await (prisma as any).userPortfolio.upsert({
      where: { userId },
      create: {
        userId,
        [platform.toLowerCase()]: handle,
      },
      update: {
        [platform.toLowerCase()]: handle,
      },
    });

    revalidatePath("/dsa-sheets");
    return { success: true, handle };
  } catch (error) {
    console.error(`Error linking ${platform}:`, error);
    return { success: false, error: "Failed to link platform" };
  }
}

export async function refreshPortfolioStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const portfolio = await (prisma as any).userPortfolio.findUnique({
    where: { userId }
  });

  if (!portfolio) return { success: false, error: "No handles linked yet" };

  try {
    const stats = await scrapeAllPlatforms({
      leetcode: portfolio.leetcode || undefined,
      github: portfolio.github || undefined,
      codeforces: portfolio.codeforces || undefined,
    });

    await (prisma as any).userPortfolio.update({
      where: { userId },
      data: {
        totalSolved: stats.totalSolved,
        activeDays: stats.activeDays,
        globalRank: stats.platformData?.leetcode?.profile?.ranking || stats.platformData?.leetcode?.contest?.globalRanking || 0,
        statsCache: stats as any,
        lastRefreshed: new Date(),
      }
    });

    revalidatePath("/dsa-sheets");
    return { success: true, stats };
  } catch (error) {
    console.error("Error refreshing portfolio:", error);
    return { success: false, error: "Refresh failed" };
  }
}

export async function getPortfolioData() {
  const { userId } = await auth();
  if (!userId) return null;

  return (prisma as any).userPortfolio.findUnique({
    where: { userId }
  });
}
