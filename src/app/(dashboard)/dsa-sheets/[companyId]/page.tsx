import { Metadata } from "next";
import { CompanySheetClient } from "./_components/company-sheet-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type Props = {
  params: Promise<{ companyId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const name = resolvedParams.companyId.charAt(0).toUpperCase() + resolvedParams.companyId.slice(1);
  return {
    title: `${name} DSA Sheet | Topic`,
    description: `Master data structures and algorithms with the ${name} interview prep sheet.`,
  };
}

export default async function CompanySheetPage({ params }: Props) {
  const resolvedParams = await params;
  const companyId = resolvedParams.companyId;

  const { userId } = await auth();

  const questions = await prisma.dSASheet.findMany({
    where: {
      companies: {
        contains: companyId,
        mode: 'insensitive'
      }
    },
    orderBy: {
      frequency: 'desc'
    }
  });

  let isFollowing = false;
  let userRevisions: any[] = [];
  let userCompletedIds: string[] = [];
  let userStarredIds: string[] = [];
  let userHighlights: { questionId: string, colorTheme: string }[] = [];
  let userNotes: { questionId: string, content: string }[] = [];

  if (userId) {
    const followRecord = await prisma.userFollowedSheet.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId
        }
      }
    });
    isFollowing = !!followRecord;

    if (isFollowing) {
      userRevisions = await prisma.userQuestionRevision.findMany({
        where: { userId }
      });
    }

    const dbCompleted = await prisma.userCompletedQuestion.findMany({
      where: { userId }
    });
    userCompletedIds = dbCompleted.map((c: any) => c.questionId);

    const dbStarred = await prisma.userStarredQuestion.findMany({
      where: { userId }
    });
    userStarredIds = dbStarred.map((s: any) => s.questionId);

    const highlights = await prisma.userQuestionHighlight.findMany({
      where: { userId }
    });
    userHighlights = highlights.map((h: any) => ({ questionId: h.questionId, colorTheme: h.colorTheme }));

    const notes = await prisma.userQuestionNote.findMany({
      where: { userId }
    });
    userNotes = notes.map((n: any) => ({ questionId: n.questionId, content: n.content }));
  }

  return <CompanySheetClient 
    companyId={companyId} 
    dbQuestions={questions} 
    isFollowing={isFollowing} 
    userId={userId} 
    dbRevisions={userRevisions} 
    initialCompleted={userCompletedIds}
    initialStarredIds={userStarredIds}
    initialHighlights={userHighlights}
    initialNotes={userNotes}
  />;
}
