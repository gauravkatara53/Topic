import { Metadata } from "next";
import { DSASheetsClient } from "./_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "DSA Sheets | Topic",
  description: "Track Coding Sheets in One Place. Choose from structured coding paths.",
};

export default async function DSASheetsPage() {
  const { userId } = await auth();

  const companies = await prisma.dSASheetCompany.findMany({
    orderBy: {
      count: 'desc'
    }
  });

  let followedSheets: any[] = [];
  let userCompletedCountByCompany: Record<string, number> = {};
  let userRevisions: any[] = [];
  let initialCompletedIds: string[] = [];
  let statsData = { totalCompleted: 0, completedToday: 0, completedRevisions: 0 };
  let starredData: any[] = [];
  let popularSheets: any[] = [];
  let followedPopularIds: string[] = [];

  // Fetch Popular Sheets
  popularSheets = await prisma.popularSheet.findMany({
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  if (userId) {
    followedSheets = await prisma.userFollowedSheet.findMany({
      where: { userId }
    });

    const followedPopular = await prisma.userFollowedPopularSheet.findMany({
      where: { userId },
      select: { popularSheetId: true }
    });
    followedPopularIds = followedPopular.map(f => f.popularSheetId);

    // Merge popular sheets into followedSheets or pass separately
    // I'll pass followedPopularIds to the client.

    const completed = await prisma.userCompletedQuestion.findMany({
      where: { userId },
      select: { questionId: true }
    });
    initialCompletedIds = completed.map(c => c.questionId);
    
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

    const upcomingRevisions = await prisma.userQuestionRevision.findMany({
      where: {
        userId,
        nextRevision: { not: null }
      }
    });

    if (upcomingRevisions.length > 0) {
      const qIds = upcomingRevisions.map(r => r.questionId).filter(isObjectId);
      if (qIds.length > 0) {
        const revQuestions = await prisma.dSASheet.findMany({
          where: { id: { in: qIds } }
        });
        userRevisions = upcomingRevisions.map(r => {
          const matchingQ = revQuestions.find(q => q.id === r.questionId);
          return {
            ...r,
            question: matchingQ
          };
        }).filter(r => r.question);
      }
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
    
    statsData = { totalCompleted, completedToday, completedRevisions };

    const starred = await prisma.userStarredQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

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
  }

  return <DSASheetsClient 
    dbCompanies={companies} 
    followedSheets={followedSheets} 
    userId={userId} 
    completedData={userCompletedCountByCompany} 
    revisionsData={userRevisions}
    initialCompletedIds={initialCompletedIds}
    statsData={statsData}
    starredData={starredData}
    popularSheets={popularSheets}
    followedPopularIds={followedPopularIds}
  />;
}
