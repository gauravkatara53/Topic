import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PENDING_STATUSES } from "@/types/placement";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.placementApplication.findMany({
    where: { userId },
    select: {
      id: true,
      currentStatus: true,
      type: true,
      referralTaken: true,
      packageOrStipend: true,
      applicationDate: true,
      role: true,
      companyName: true,
    },
  });

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const total = apps.length;
  const thisMonthCount = apps.filter((a) => {
    const d = new Date(a.applicationDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const pending = apps.filter((a) =>
    (PENDING_STATUSES as readonly string[]).includes(a.currentStatus)
  ).length;

  const interviewsScheduled = apps.filter((a) =>
    ["Interview Scheduled", "Round 1", "Round 2", "HR Round"].includes(a.currentStatus)
  ).length;

  const offersReceived = apps.filter((a) =>
    ["Offer Received", "Selected"].includes(a.currentStatus)
  ).length;

  const rejected = apps.filter((a) => a.currentStatus === "Rejected").length;
  const selected = apps.filter((a) => a.currentStatus === "Selected").length;
  const referral = apps.filter((a) => a.referralTaken).length;
  const onCampus = apps.filter((a) => a.type === "ON_CAMPUS").length;
  const offCampus = apps.filter((a) => a.type === "OFF_CAMPUS").length;

  // Status distribution
  const statusMap: Record<string, number> = {};
  apps.forEach((a) => {
    statusMap[a.currentStatus] = (statusMap[a.currentStatus] || 0) + 1;
  });
  const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  // Monthly trend (last 6 months)
  const monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyMap[label] = 0;
  }
  apps.forEach((a) => {
    const d = new Date(a.applicationDate);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (label in monthlyMap) monthlyMap[label]++;
  });
  const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

  // Top roles
  const roleMap: Record<string, number> = {};
  apps.forEach((a) => {
    roleMap[a.role] = (roleMap[a.role] || 0) + 1;
  });
  const topRoles = Object.entries(roleMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([role, count]) => ({ role, count }));

  return NextResponse.json({
    totalApplications: total,
    applicationsThisMonth: thisMonthCount,
    pendingApplications: pending,
    interviewsScheduled,
    offersReceived,
    rejectedApplications: rejected,
    selectedCount: selected,
    referralApplications: referral,
    onCampusApplications: onCampus,
    offCampusApplications: offCampus,
    statusDistribution,
    monthlyTrend,
    topRoles,
    campusSplit: [
      { name: "On-Campus", value: onCampus },
      { name: "Off-Campus", value: offCampus },
    ],
  });
}
