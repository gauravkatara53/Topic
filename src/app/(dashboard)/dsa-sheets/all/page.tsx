import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function AllSheetsPage() {
  const { userId } = await auth();

  const companies = await prisma.dSASheetCompany.findMany({
    orderBy: { count: 'desc' }
  });

  return <DSASheetsClient 
    dbCompanies={companies} 
    userId={userId} 
    initialTab="All"
  />;
}
