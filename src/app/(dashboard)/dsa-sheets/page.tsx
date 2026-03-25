import { DSASheetsClient } from "./_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";

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

  const userCustomSheets = userId ? await prisma.userCustomSheet.findMany({
    where: { userId },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  }) : [];

  return <DSASheetsClient 
    dbCompanies={companies} 
    userId={userId} 
    userCustomSheets={userCustomSheets}
    initialTab="Company Wise"
  />;
}
