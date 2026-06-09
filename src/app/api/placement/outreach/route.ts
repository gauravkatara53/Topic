import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const outreach = await prisma.placementOutreach.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(outreach);
  } catch (err) {
    console.error("[outreach GET]", err);
    return NextResponse.json({ error: "Failed to fetch outreach contacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (!body.personName || !body.companyName) {
      return NextResponse.json({ error: "personName and companyName are required" }, { status: 400 });
    }

    const data = {
      userId,
      personName:     body.personName,
      companyName:    body.companyName,
      role:           body.role || "",
      linkedinUrl:    body.linkedinUrl || null,
      email:          body.email || null,
      status:         body.status || "To Contact",
      dateReachedOut: body.dateReachedOut ? new Date(body.dateReachedOut) : null,
      repliedAt:      body.repliedAt ? new Date(body.repliedAt) : null,
      notes:          body.notes || null,
    };

    const outreach = await prisma.placementOutreach.create({ data });
    return NextResponse.json(outreach, { status: 201 });
  } catch (err) {
    console.error("[outreach POST]", err);
    return NextResponse.json({ error: "Failed to create outreach contact" }, { status: 500 });
  }
}
