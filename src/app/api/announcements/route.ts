import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        const where: any = {};
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { body: { contains: search } }
            ];
        }

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: [
                { pinned: "desc" },
                { date: "desc" }
            ]
        });

        return NextResponse.json(announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { title, content, category, pinned } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                body: content,
                category,
                pinned: pinned || false,
            }
        });

        return NextResponse.json(announcement, { status: 201 });
    } catch (error) {
        console.error("Error creating announcement:", error);
        return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }
}
