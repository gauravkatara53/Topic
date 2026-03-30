import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function PopularSheetsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === "gauravkatara53@gmail.com";

  const popularSheetsRaw = await prisma.popularSheet.findMany({
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  const popularSheets = popularSheetsRaw.map((sheet: any) => ({
    ...sheet,
    questions: (sheet.questions || []).filter((sq: any) => sq.question)
  }));

  const completed = await prisma.userCompletedQuestion.findMany({
    where: { userId: userId || "" },
    select: { questionId: true }
  });
  const initialCompletedIds = completed.map(c => c.questionId);

  return <DSASheetsClient
    userId={userId}
    isAdmin={isAdmin}
    popularSheets={popularSheets}
    initialCompletedIds={initialCompletedIds}
    initialTab="Popular"
  />;
}
