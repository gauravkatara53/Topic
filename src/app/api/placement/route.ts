import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/placement — list applications ───────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")   || "";
  const status   = searchParams.get("status")   || "";
  const type     = searchParams.get("type")     || "";
  const referral = searchParams.get("referral") || "";
  const sort     = searchParams.get("sort")     || "latest";
  const page     = parseInt(searchParams.get("page")  || "1");
  const limit    = parseInt(searchParams.get("limit") || "50");
  const skip     = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };
  if (search) {
    where.OR = [
      { companyName: { contains: search } },
      { role: { contains: search } },
    ];
  }
  if (status)             where.currentStatus = status;
  if (type)               where.type = type;
  if (referral === "true")  where.referralTaken = true;
  if (referral === "false") where.referralTaken = false;

  const orderBy: Record<string, string> =
    sort === "oldest"       ? { applicationDate: "asc" }   :
    sort === "package_high" ? { packageOrStipend: "desc" }  :
    sort === "package_low"  ? { packageOrStipend: "asc" }   :
    sort === "company_az"   ? { companyName: "asc" }        :
                              { applicationDate: "desc" };

  try {
    const [applications, total] = await Promise.all([
      prisma.placementApplication.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          statusHistory: { orderBy: { date: "desc" } },
          reminders: { orderBy: { dueDate: "asc" } },
        },
      }),
      prisma.placementApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, total, page, limit });
  } catch (err) {
    console.error("[placement GET]", err);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// ─── POST /api/placement — create application ─────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (!body.companyName || !body.role) {
      return NextResponse.json({ error: "companyName and role are required" }, { status: 400 });
    }

    const data = {
      userId,
      companyName:            body.companyName,
      role:                   body.role,
      type:                   body.type || "OFF_CAMPUS",
      internshipOrFullTime:   body.internshipOrFullTime || "FULL_TIME",
      packageOrStipend:       body.packageOrStipend != null ? Number(body.packageOrStipend) : null,
      location:               body.location || null,
      jobLink:                body.jobLink || null,
      applicationDate:        body.applicationDate ? new Date(body.applicationDate) : new Date(),
      deadlineDate:           body.deadlineDate ? new Date(body.deadlineDate) : null,
      placementDriveName:     body.placementDriveName || null,
      eligibilityCriteria:    body.eligibilityCriteria || null,
      cgpaRequirement:        body.cgpaRequirement != null ? Number(body.cgpaRequirement) : null,
      referralTaken:          Boolean(body.referralTaken),
      referralPersonName:     body.referralPersonName || null,
      referralPersonLinkedIn: body.referralPersonLinkedIn || null,
      referralSource:         body.referralSource || null,
      emailUsed:              body.emailUsed || null,
      currentStatus:          body.currentStatus || "Applied",
      resumeVersion:          body.resumeVersion || null,
      coverLetterUsed:        Boolean(body.coverLetterUsed),
      skillsRequired:         Array.isArray(body.skillsRequired) ? body.skillsRequired : [],
      interviewExperience:    body.interviewExperience || null,
      hrContact:              body.hrContact || null,
      notes:                  body.notes || null,
      tags:                   Array.isArray(body.tags) ? body.tags : [],
    };

    // Create the application
    const application = await prisma.placementApplication.create({ data });

    // Create initial status history entry (separate query — MongoDB nested writes can be unreliable)
    await prisma.placementStatusUpdate.create({
      data: {
        applicationId: application.id,
        status:        data.currentStatus,
        date:          data.applicationDate,
        notes:         "Application created",
      },
    });

    // Return the full record with relations
    const full = await prisma.placementApplication.findUnique({
      where: { id: application.id },
      include: {
        statusHistory: { orderBy: { date: "desc" } },
        reminders: true,
      },
    });

    return NextResponse.json(full, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; meta?: unknown };
    console.error("[placement POST]", error?.message, error?.code);
    return NextResponse.json(
      { error: "Failed to create application", detail: error?.message ?? String(err) },
      { status: 500 }
    );
  }
}
