import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function PopularSheetsPage() {
  const { userId } = await auth();

  const popularSheets = await prisma.popularSheet.findMany({
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  const completed = await prisma.userCompletedQuestion.findMany({
    where: { userId: userId || "" },
    select: { questionId: true }
  });
  const initialCompletedIds = completed.map(c => c.questionId);

  return <DSASheetsClient 
    userId={userId} 
    popularSheets={popularSheets}
    initialCompletedIds={initialCompletedIds}
    initialTab="Popular"
  />;
}
