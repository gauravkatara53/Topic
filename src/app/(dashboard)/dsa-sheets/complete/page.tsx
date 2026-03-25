import { DSASheetsClient } from "../_components/dsa-sheets-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function CompleteDSAPage() {
  const { userId } = await auth();

  const companies = await prisma.dSASheetCompany.findMany({
    orderBy: { count: 'desc' }
  });

  if (!userId) {
    return <DSASheetsClient dbCompanies={companies} userId={userId} initialTab="My Sheets" />;
  }

  return <DSASheetsClient
    dbCompanies={companies}
    userId={userId}
    initialTab="Complete DSA"
  />;
}
