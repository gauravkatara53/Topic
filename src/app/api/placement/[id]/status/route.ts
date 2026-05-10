import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/placement/[id]/status — add a status update ───────────────────
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.placementApplication.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const { status, notes, link, date } = body;

    if (!status) return NextResponse.json({ error: "Status is required" }, { status: 400 });

    // Create the status update entry
    const statusUpdate = await prisma.placementStatusUpdate.create({
      data: {
        applicationId: id,
        status,
        notes: notes ?? null,
        link: link ?? null,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Update the application's current status separately (MongoDB doesn't support $transaction write conflict)
    await prisma.placementApplication.update({
      where: { id },
      data: { currentStatus: status },
    });

    return NextResponse.json(statusUpdate, { status: 201 });
  } catch (err) {
    console.error("[placement status POST]", err);
    return NextResponse.json({ error: "Failed to add status update", detail: String(err) }, { status: 500 });
  }
}
