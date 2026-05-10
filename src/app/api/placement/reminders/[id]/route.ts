import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── PATCH /api/placement/reminders/[id] ─────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.placementReminder.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.placementReminder.update({
    where: { id },
    data: {
      title:     body.title     !== undefined ? body.title : existing.title,
      dueDate:   body.dueDate   ? new Date(body.dueDate) : existing.dueDate,
      completed: body.completed !== undefined ? body.completed : existing.completed,
    },
    include: { application: { select: { companyName: true, role: true } } },
  });

  return NextResponse.json(updated);
}

// ─── DELETE /api/placement/reminders/[id] ────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.placementReminder.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.placementReminder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
