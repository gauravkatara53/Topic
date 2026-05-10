import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/placement/reminders ─────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await prisma.placementReminder.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
    include: {
      application: { select: { companyName: true, role: true } },
    },
  });

  return NextResponse.json(reminders);
}

// ─── POST /api/placement/reminders ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, dueDate, applicationId } = body;

  if (!title || !dueDate)
    return NextResponse.json({ error: "title and dueDate are required" }, { status: 400 });

  const reminder = await prisma.placementReminder.create({
    data: {
      userId,
      title,
      dueDate: new Date(dueDate),
      applicationId: applicationId ?? null,
    },
    include: { application: { select: { companyName: true, role: true } } },
  });

  return NextResponse.json(reminder, { status: 201 });
}
