import { DSASheetsClient } from "./_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hydrateQuestions } from "@/lib/dsa-questions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DSA Sheets | Topic",
  description: "Track Coding Sheets in One Place. Choose from structured coding paths.",
};

export default async function DSASheetsPage() {
  const { userId } = await auth();

  const companiesPromise = (prisma as any).dSASheetCompany.findMany({
    orderBy: { count: 'desc' }
  });

  const followedSheetsPromise = userId ? (prisma as any).userFollowedSheet.findMany({
    where: { userId }
  }) : Promise.resolve([]);

  const completedQuestionsPromise = userId ? (prisma as any).userCompletedQuestion.findMany({
    where: { userId }
  }) : Promise.resolve([]);

  const revisionsPromise = userId ? (prisma as any).userQuestionRevision.findMany({
    where: { userId }
  }) : Promise.resolve([]);

  const starredPromise = userId ? (prisma as any).userStarredQuestion.findMany({
    where: { userId }
  }) : Promise.resolve([]);

  const popularSheetsPromise = (prisma as any).popularSheet.findMany({
    include: { questions: { include: { question: true } } }
  });

  const followedPopularPromise = userId ? (prisma as any).userFollowedPopularSheet.findMany({
    where: { userId }
  }) : Promise.resolve([]);

  const userCustomSheetsPromise = userId ? (prisma as any).userCustomSheet.findMany({
    where: { userId },
    include: { questions: { include: { question: true } } }
  }) : Promise.resolve([]);

  const userPortfolioPromise = userId ? (prisma as any).userPortfolio.findUnique({
    where: { userId }
  }) : Promise.resolve(null);

  const [
    companies,
    followedSheets,
    completedQuestions,
    revisionsRaw,
    starredRaw,
    popularSheets,
    followedPopular,
    userCustomSheets,
    userPortfolio
  ] = await Promise.all([
    companiesPromise,
    followedSheetsPromise,
    completedQuestionsPromise,
    revisionsPromise,
    starredPromise,
    popularSheetsPromise,
    followedPopularPromise,
    userCustomSheetsPromise,
    userPortfolioPromise
  ]);

  const allIds = [...new Set([...revisionsRaw.map((r: any) => String(r.questionId)), ...starredRaw.map((s: any) => String(s.questionId))])];
  const questionMap = await hydrateQuestions(allIds);
  
  const revisions = revisionsRaw.map((r: any) => ({ ...r, question: questionMap.get(String(r.questionId)) })).filter((r: any) => r.question);
  const starred = starredRaw.map((s: any) => ({ ...s, question: questionMap.get(String(s.questionId)) })).filter((s: any) => s.question);

  // Aggregate completed counts
  const completedData: Record<string, number> = {};
  completedQuestions.forEach((q: any) => {
    if (q.companyId) {
      const key = q.companyId.toLowerCase();
      completedData[key] = (completedData[key] || 0) + 1;
    }
  });

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = completedQuestions.filter((q: any) => new Date(q.createdAt) >= today).length;
  const completedRevisions = revisions.filter((r: any) => r.status === 'Completed').length;

  const statsData = {
    totalCompleted: completedQuestions.length,
    completedToday,
    completedRevisions
  };

  return <DSASheetsClient 
    dbCompanies={companies} 
    userId={userId} 
    followedSheets={followedSheets}
    completedData={completedData}
    revisionsData={revisions}
    starredData={starred}
    popularSheets={popularSheets}
    followedPopularIds={followedPopular.map((f: any) => f.popularSheetId)}
    userCustomSheets={userCustomSheets}
    userPortfolio={userPortfolio}
    statsData={statsData}
    initialCompletedIds={completedQuestions.map((q: any) => q.questionId)}
    initialTab="Company Wise"
  />;
}
