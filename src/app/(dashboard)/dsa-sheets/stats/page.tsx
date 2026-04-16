import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hydrateQuestions } from "@/lib/dsa-questions";

export default async function StatsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <DSASheetsClient userId={userId} initialTab="My Stats" />;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalCompleted = await (prisma as any).userCompletedQuestion.count({
    where: { userId }
  });

  const completedToday = await (prisma as any).userCompletedQuestion.count({
    where: { userId, createdAt: { gte: startOfToday } }
  });

  const completedRevisions = await (prisma as any).userQuestionRevision.count({
    where: { userId, status: 'Completed' }
  });

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    last7Days.push(d);
  }

  const startDate7 = last7Days[0];
  const startDateHistory = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());

  const recentCompletions = await (prisma as any).userCompletedQuestion.findMany({
    where: { userId, createdAt: { gte: startDateHistory } },
    select: { createdAt: true }
  });

  const recentRevisions = await (prisma as any).userQuestionRevision.findMany({
    where: { userId, status: 'Completed', lastRevised: { gte: startDateHistory } },
    select: { lastRevised: true }
  });

  const dailyStats = last7Days.map(date => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const completedCount = recentCompletions.filter((c: any) => {
      const d = new Date(c.createdAt);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    }).length;

    const revisedCount = recentRevisions.filter((r: any) => {
      if (!r.lastRevised) return false;
      const d = new Date(r.lastRevised);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    }).length;

    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      completed: completedCount,
      revised: revisedCount
    };
  });

  const historyStats: Record<string, { solved: number, revised: number, total: number }> = {};
  let totalSolvedAllTime = 0;
  let totalRevisedAllTime = 0;

  recentCompletions.forEach((c: any) => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (!historyStats[key]) historyStats[key] = { solved: 0, revised: 0, total: 0 };
    historyStats[key].solved++;
    historyStats[key].total++;
    totalSolvedAllTime++;
  });
  recentRevisions.forEach((r: any) => {
    if (!r.lastRevised) return;
    const d = new Date(r.lastRevised);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (!historyStats[key]) historyStats[key] = { solved: 0, revised: 0, total: 0 };
    historyStats[key].revised++;
    historyStats[key].total++;
    totalRevisedAllTime++;
  });

  // Calculate Streaks
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  // Check last 365 days for streaks
  for (let i = 0; i < 365; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const hasActivity = historyStats[key] && historyStats[key].total > 0;

    if (hasActivity) {
      tempStreak++;
    } else {
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      if (i === 1 && !historyStats[`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`]) {
        // If no activity today and we are checking yesterday, current streak is 0
        currentStreak = 0; 
      } else if (currentStreak === 0 && i > 0 && tempStreak > 0) {
          // first gap found while going backwards
          // Wait, this logic is slightly flawed. Let's simplify.
      }
      tempStreak = 0;
    }
  }

  // Proper Current Streak
  let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // If no activity today, check yesterday. If yesterday also no activity, streak is 0.
  const todayK = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
  const yesterdayD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayK = `${yesterdayD.getFullYear()}-${yesterdayD.getMonth() + 1}-${yesterdayD.getDate()}`;
  
  if (historyStats[todayK]) {
    while (historyStats[`${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (historyStats[yesterdayK]) {
    checkDate = yesterdayD;
    while (historyStats[`${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Recalculate max streak correctly
  tempStreak = 0;
  maxStreak = 0;
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (historyStats[key]) {
      tempStreak++;
    } else {
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      tempStreak = 0;
    }
  }
  if (tempStreak > maxStreak) maxStreak = tempStreak;

  const statsData = { 
    totalCompleted, 
    completedToday, 
    completedRevisions, 
    dailyStats, 
    historyStats,
    totalSolvedAllTime,
    totalRevisedAllTime,
    currentStreak,
    maxStreak
  };

  const starred = await (prisma as any).userStarredQuestion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  let starredData: any[] = [];
  if (starred.length > 0) {
    const starredIds = starred.map((s: any) => s.questionId);
    const questionMap = await hydrateQuestions(starredIds);
    starredData = starred.map((s: any) => {
      const matchingQ = questionMap.get(s.questionId);
      return { ...s, question: matchingQ };
    }).filter((s: any) => s.question);
  }

  const completed = await (prisma as any).userCompletedQuestion.findMany({
    where: { userId },
    select: { questionId: true }
  });
  const initialCompletedIds = completed.map((c: any) => c.questionId);

  return <DSASheetsClient 
    userId={userId} 
    statsData={statsData}
    starredData={starredData}
    initialCompletedIds={initialCompletedIds}
    initialTab="My Stats"
  />;
}
