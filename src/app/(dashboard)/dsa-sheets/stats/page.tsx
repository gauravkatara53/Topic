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
  
  const statsData = { totalCompleted, completedToday, completedRevisions };

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
