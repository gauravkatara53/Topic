import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const branch = searchParams.get("branch");
        const semester = searchParams.get("semester");
        const search = searchParams.get("search");

        const where: any = {};
        if (branch && branch !== "All") where.branch = branch;
        if (semester && semester !== "All") where.semester = parseInt(semester);
        if (search) {
            where.subject = { contains: search };
        }

        const files = await prisma.file.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { uploader: { select: { name: true } } }
        });

        return NextResponse.json(files);
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Usually we would handle FormData for real file uploads, upload to S3/Cloudinary,
        // and save the returned URL. For this simulation, we'll accept JSON with a mock URL.
        const body = await req.json();
        const { branch, semester, subject, type, fileName } = body;

        if (!branch || !semester || !subject || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Mock file URL
        const mockUrl = `https://mock-storage.com/${branch}/${semester}/${encodeURIComponent(subject)}_${Date.now()}.pdf`;

        const fileRecord = await prisma.file.create({
            data: {
                uploaderId: userId,
                branch,
                semester: parseInt(semester, 10),
                subject,
                type,
                url: mockUrl,
            },
            include: {
                uploader: { select: { name: true } }
            }
        });

        return NextResponse.json(fileRecord, { status: 201 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
