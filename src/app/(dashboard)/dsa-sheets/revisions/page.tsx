import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function RevisionsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <DSASheetsClient userId={userId} initialTab="Revisions" />;
  }

  const upcomingRevisions = await prisma.userQuestionRevision.findMany({
    where: {
      userId,
      nextRevision: { not: null }
    }
  });

  const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
  const qIds = upcomingRevisions.map(r => r.questionId).filter(isObjectId);
  
  let userRevisions: any[] = [];
  if (qIds.length > 0) {
    const revQuestions = await prisma.dSASheet.findMany({
      where: { id: { in: qIds } }
    });
    userRevisions = upcomingRevisions.map(r => {
      const matchingQ = revQuestions.find(q => q.id === r.questionId);
      return { ...r, question: matchingQ };
    }).filter(r => r.question);
  }

  const completed = await prisma.userCompletedQuestion.findMany({
    where: { userId },
    select: { questionId: true }
  });
  const initialCompletedIds = completed.map(c => c.questionId);

  return <DSASheetsClient 
    userId={userId} 
    revisionsData={userRevisions}
    initialCompletedIds={initialCompletedIds}
    initialTab="Revisions"
  />;
}
