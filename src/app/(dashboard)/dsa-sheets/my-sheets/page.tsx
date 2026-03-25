import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function MySheetsPage() {
  const { userId } = await auth();

  const companies = await prisma.dSASheetCompany.findMany({
    orderBy: { count: 'desc' }
  });

  if (!userId) {
    return <DSASheetsClient dbCompanies={companies} userId={userId} initialTab="My Sheets" />;
  }

  const followedSheets = await prisma.userFollowedSheet.findMany({
    where: { userId }
  });

  const followedPopular = await prisma.userFollowedPopularSheet.findMany({
    where: { userId },
    select: { popularSheetId: true }
  });
  const followedPopularIds = followedPopular.map(f => f.popularSheetId);
 
  const userCustomSheets = await prisma.userCustomSheet.findMany({
    where: { userId },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });


  // Fetch ONLY followed Popular Sheets for rendering in My Sheets tab
  const popularSheets = followedPopularIds.length > 0 ? await prisma.popularSheet.findMany({
    where: { id: { in: followedPopularIds } },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  }) : [];

  // Calculate some progress data
  let userCompletedCountByCompany: Record<string, number> = {};
  const completed = await prisma.userCompletedQuestion.findMany({
      where: { userId },
      select: { questionId: true }
  });
  const initialCompletedIds = completed.map(c => c.questionId);
  const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
  const validCompletedIds = initialCompletedIds.filter(isObjectId);
  
  if (validCompletedIds.length > 0) {
      const completedQs = await prisma.dSASheet.findMany({
          where: { id: { in: validCompletedIds } }
      });
      completedQs.forEach(q => {
          if (q.companies) {
              const comps = q.companies.split(',').map(s => s.trim().toLowerCase());
              comps.forEach(comp => {
                  userCompletedCountByCompany[comp] = (userCompletedCountByCompany[comp] || 0) + 1;
              });
          }
      });
  }

  return <DSASheetsClient 
    dbCompanies={companies} 
    followedSheets={followedSheets} 
    userId={userId} 
    completedData={userCompletedCountByCompany} 
    initialCompletedIds={initialCompletedIds}
    popularSheets={popularSheets}
    followedPopularIds={followedPopularIds}
    userCustomSheets={userCustomSheets}
    initialTab="My Sheets"
  />;
}
