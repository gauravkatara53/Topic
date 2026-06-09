import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.placementOutreach.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    const data = {
      personName:     body.personName,
      companyName:    body.companyName,
      role:           body.role,
      linkedinUrl:    body.linkedinUrl || null,
      email:          body.email || null,
      status:         body.status,
      dateReachedOut: body.dateReachedOut ? new Date(body.dateReachedOut) : null,
      repliedAt:      body.repliedAt ? new Date(body.repliedAt) : null,
      notes:          body.notes || null,
    };

    const updated = await prisma.placementOutreach.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[outreach PUT]", err);
    return NextResponse.json({ error: "Failed to update outreach contact" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.placementOutreach.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.placementOutreach.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[outreach DELETE]", err);
    return NextResponse.json({ error: "Failed to delete outreach contact" }, { status: 500 });
  }
}
