import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function StatsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <DSASheetsClient userId={userId} initialTab="My Stats" />;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalCompleted = await prisma.userCompletedQuestion.count({
    where: { userId }
  });

  const completedToday = await prisma.userCompletedQuestion.count({
    where: { userId, createdAt: { gte: startOfToday } }
  });

  const completedRevisions = await prisma.userQuestionRevision.count({
    where: { userId, status: 'Completed' }
  });
  
  const statsData = { totalCompleted, completedToday, completedRevisions };

  const starred = await prisma.userStarredQuestion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
  let starredData: any[] = [];
  if (starred.length > 0) {
    const starredIds = starred.map(s => s.questionId).filter(isObjectId);
    if (starredIds.length > 0) {
      const starredQs = await prisma.dSASheet.findMany({
        where: { id: { in: starredIds } }
      });
      starredData = starred.map(s => {
        const matchingQ = starredQs.find(q => q.id === s.questionId);
        return { ...s, question: matchingQ };
      }).filter(s => s.question);
    }
  }

  const completed = await prisma.userCompletedQuestion.findMany({
    where: { userId },
    select: { questionId: true }
  });
  const initialCompletedIds = completed.map(c => c.questionId);

  return <DSASheetsClient 
    userId={userId} 
    statsData={statsData}
    starredData={starredData}
    initialCompletedIds={initialCompletedIds}
    initialTab="My Stats"
  />;
}
