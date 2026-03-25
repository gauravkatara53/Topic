import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PopularSheetClient } from "./_components/popular-sheet-client";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const sheet = await prisma.popularSheet.findUnique({
    where: { slug: resolvedParams.slug }
  });
  if (!sheet) return { title: "Sheet Not Found" };
  return {
    title: `${sheet.name} | Topic`,
    description: sheet.description || `Master DSA with the ${sheet.name} curated sheet.`,
  };
}

export default async function PopularSheetPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const { userId } = await auth();

  const sheet = await prisma.popularSheet.findUnique({
    where: { slug },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  if (!sheet) notFound();

  let isFollowing = false;
  let userCompletedIds: string[] = [];
  let userStarredIds: string[] = [];
  let userHighlights: { questionId: string, colorTheme: string }[] = [];
  let userRevisions: any[] = [];
  let userNotes: { questionId: string, content: string }[] = [];

  if (userId) {
    const followRecord = await prisma.userFollowedPopularSheet.findUnique({
      where: {
        userId_popularSheetId: {
          userId,
          popularSheetId: sheet.id
        }
      }
    });
    isFollowing = !!followRecord;

    // Optimize: Only fetch progress data for questions IN THIS SHEET
    const sheetQuestionIds = sheet.questions.map((sq: any) => sq.question.id);

    const [completed, starred, highlights, revisions, notes] = await Promise.all([
      prisma.userCompletedQuestion.findMany({ 
        where: { userId, questionId: { in: sheetQuestionIds } }, 
        select: { questionId: true } 
      }),
      prisma.userStarredQuestion.findMany({ 
        where: { userId, questionId: { in: sheetQuestionIds } }, 
        select: { questionId: true } 
      }),
      prisma.userQuestionHighlight.findMany({ 
        where: { userId, questionId: { in: sheetQuestionIds } } 
      }),
      prisma.userQuestionRevision.findMany({ 
        where: { userId, questionId: { in: sheetQuestionIds } } 
      }),
      prisma.userQuestionNote.findMany({ 
        where: { userId, questionId: { in: sheetQuestionIds } } 
      })
    ]);

    userCompletedIds = completed.map(c => c.questionId);
    userStarredIds = starred.map(s => s.questionId);
    userHighlights = highlights.map(h => ({ questionId: h.questionId, colorTheme: h.colorTheme }));
    userRevisions = revisions;
    userNotes = notes.map(n => ({ questionId: n.questionId, content: n.content }));
  }

  return (
    <PopularSheetClient 
      sheet={sheet as any}
      userId={userId}
      isFollowing={isFollowing}
      initialCompletedIds={userCompletedIds}
      initialStarredIds={userStarredIds}
      initialHighlights={userHighlights}
      initialRevisions={userRevisions}
      initialNotes={userNotes}
    />
  );
}
