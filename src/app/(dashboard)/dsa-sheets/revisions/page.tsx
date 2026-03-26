import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hydrateQuestions } from "@/lib/dsa-questions";

export default async function RevisionsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <DSASheetsClient userId={userId} initialTab="Revisions" />;
  }

  const upcomingRevisions = await (prisma as any).userQuestionRevision.findMany({
    where: {
      userId,
      nextRevision: { not: null }
    }
  });

  const qIds = upcomingRevisions.map((r: any) => r.questionId);
  const questionMap = await hydrateQuestions(qIds);
  
  const userRevisions = upcomingRevisions.map((r: any) => {
    const matchingQ = questionMap.get(r.questionId);
    return { ...r, question: matchingQ };
  }).filter((r: any) => r.question);

  const completed = await (prisma as any).userCompletedQuestion.findMany({
    where: { userId },
    select: { questionId: true }
  });
  const initialCompletedIds = completed.map((c: any) => c.questionId);

  return <DSASheetsClient 
    userId={userId} 
    revisionsData={userRevisions}
    initialCompletedIds={initialCompletedIds}
    initialTab="Revisions"
  />;
}
