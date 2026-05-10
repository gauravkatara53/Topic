import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/placement/[id] ──────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const app = await prisma.placementApplication.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { date: "desc" } },
        reminders: { orderBy: { dueDate: "asc" } },
      },
    });

    if (!app || app.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(app);
  } catch (err) {
    console.error("[placement GET id]", err);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

// ─── PATCH /api/placement/[id] ────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.placementApplication.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // If status changed, create a status history entry separately after the update
    const statusChanged = body.currentStatus && body.currentStatus !== existing.currentStatus;

    // Update the application (no nested write for statusHistory)
    const updated = await prisma.placementApplication.update({
      where: { id },
      data: {
        companyName:            body.companyName            ?? existing.companyName,
        role:                   body.role                   ?? existing.role,
        type:                   body.type                   ?? existing.type,
        internshipOrFullTime:   body.internshipOrFullTime   ?? existing.internshipOrFullTime,
        packageOrStipend:       body.packageOrStipend       !== undefined ? (body.packageOrStipend != null ? Number(body.packageOrStipend) : null) : existing.packageOrStipend,
        location:               body.location               !== undefined ? (body.location || null) : existing.location,
        jobLink:                body.jobLink                !== undefined ? (body.jobLink || null) : existing.jobLink,
        applicationDate:        body.applicationDate ? new Date(body.applicationDate) : existing.applicationDate,
        deadlineDate:           body.deadlineDate ? new Date(body.deadlineDate) : (body.deadlineDate === "" ? null : existing.deadlineDate),
        placementDriveName:     body.placementDriveName     !== undefined ? (body.placementDriveName || null) : existing.placementDriveName,
        eligibilityCriteria:    body.eligibilityCriteria    !== undefined ? (body.eligibilityCriteria || null) : existing.eligibilityCriteria,
        cgpaRequirement:        body.cgpaRequirement        !== undefined ? (body.cgpaRequirement != null ? Number(body.cgpaRequirement) : null) : existing.cgpaRequirement,
        referralTaken:          body.referralTaken          !== undefined ? body.referralTaken : existing.referralTaken,
        referralPersonName:     body.referralPersonName     !== undefined ? (body.referralPersonName || null) : existing.referralPersonName,
        referralPersonLinkedIn: body.referralPersonLinkedIn !== undefined ? (body.referralPersonLinkedIn || null) : existing.referralPersonLinkedIn,
        referralSource:         body.referralSource         !== undefined ? (body.referralSource || null) : existing.referralSource,
        emailUsed:              body.emailUsed              !== undefined ? (body.emailUsed || null) : existing.emailUsed,
        currentStatus:          body.currentStatus          ?? existing.currentStatus,
        resumeVersion:          body.resumeVersion          !== undefined ? (body.resumeVersion || null) : existing.resumeVersion,
        coverLetterUsed:        body.coverLetterUsed        !== undefined ? body.coverLetterUsed : existing.coverLetterUsed,
        skillsRequired:         Array.isArray(body.skillsRequired) ? body.skillsRequired : existing.skillsRequired,
        interviewExperience:    body.interviewExperience    !== undefined ? (body.interviewExperience || null) : existing.interviewExperience,
        hrContact:              body.hrContact              !== undefined ? (body.hrContact || null) : existing.hrContact,
        salaryOffered:          body.salaryOffered          !== undefined ? (body.salaryOffered != null ? Number(body.salaryOffered) : null) : existing.salaryOffered,
        offerDeadline:          body.offerDeadline ? new Date(body.offerDeadline) : existing.offerDeadline,
        joiningDate:            body.joiningDate ? new Date(body.joiningDate) : existing.joiningDate,
        notes:                  body.notes                  !== undefined ? (body.notes || null) : existing.notes,
        tags:                   Array.isArray(body.tags) ? body.tags : existing.tags,
        resumeUrl:              body.resumeUrl              !== undefined ? (body.resumeUrl || null) : existing.resumeUrl,
      },
    });

    // Create status history entry separately if status changed
    if (statusChanged) {
      await prisma.placementStatusUpdate.create({
        data: {
          applicationId: id,
          status: body.currentStatus,
          date: new Date(),
          notes: body.statusNote || null,
        },
      });
    }

    // Return the full updated record with relations
    const full = await prisma.placementApplication.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { date: "desc" } },
        reminders: { orderBy: { dueDate: "asc" } },
      },
    });

    return NextResponse.json(full);
  } catch (err) {
    console.error("[placement PATCH]", err);
    return NextResponse.json({ error: "Failed to update application", detail: String(err) }, { status: 500 });
  }
}

// ─── DELETE /api/placement/[id] ───────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.placementApplication.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.placementApplication.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[placement DELETE]", err);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
