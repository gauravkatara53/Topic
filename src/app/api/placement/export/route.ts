import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.placementApplication.findMany({
    where: { userId },
    orderBy: { applicationDate: "desc" },
    include: { statusHistory: { orderBy: { date: "desc" } } },
  });

  const rows = apps.map((a) => ({
    "Company": a.companyName,
    "Role": a.role,
    "Type": a.type === "ON_CAMPUS" ? "On Campus" : "Off Campus",
    "Category": a.internshipOrFullTime === "INTERNSHIP" ? "Internship" : "Full Time",
    "Status": a.currentStatus,
    "Package (LPA)": a.packageOrStipend ?? "",
    "Location": a.location ?? "",
    "Applied On": new Date(a.applicationDate).toLocaleDateString("en-IN"),
    "Deadline": a.deadlineDate ? new Date(a.deadlineDate).toLocaleDateString("en-IN") : "",
    "Referral": a.referralTaken ? "Yes" : "No",
    "Referral By": a.referralPersonName ?? "",
    "Email Used": a.emailUsed ?? "",
    "Resume Version": a.resumeVersion ?? "",
    "Tags": (a.tags ?? []).join(", "),
    "Notes": a.notes ?? "",
    "Job Link": a.jobLink ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 25 }, { wch: 30 }, { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 25 },
    { wch: 16 }, { wch: 20 }, { wch: 40 }, { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Applications");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="placement-tracker-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
