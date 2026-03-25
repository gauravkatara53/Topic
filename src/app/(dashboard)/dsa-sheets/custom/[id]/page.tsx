import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { CustomSheetClient } from "./_components/custom-sheet-client";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const sheet = await prisma.userCustomSheet.findUnique({
    where: { id: resolvedParams.id }
  });
  if (!sheet) return { title: "Sheet Not Found" };
  return {
    title: `${sheet.name} | Topic`,
    description: sheet.description || "Personal DSA collection.",
  };
}

export default async function CustomSheetPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const sheet = await prisma.userCustomSheet.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  if (!sheet || sheet.userId !== userId) notFound();

  // Optimize: Only fetch progress data for questions in this custom sheet
  const sheetQuestionIds = sheet.questions.map((sq: any) => sq.questionId);

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

  const userCompletedIds = completed.map(c => c.questionId);
  const userStarredIds = starred.map(s => s.questionId);
  const userHighlights = highlights.map(h => ({ questionId: h.questionId, colorTheme: h.colorTheme }));
  const userNotes = notes.map(n => ({ questionId: n.questionId, content: n.content }));
  const userRevisions = revisions;

  return (
    <CustomSheetClient 
      sheet={sheet as any}
      userId={userId}
      initialCompletedIds={userCompletedIds}
      initialStarredIds={userStarredIds}
      initialHighlights={userHighlights}
      initialRevisions={revisions}
      initialNotes={userNotes}
    />
  );
}
