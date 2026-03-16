import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const records = await prisma.attendanceRecord.findMany({
            where: { userId },
            orderBy: { subject: "asc" },
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return NextResponse.json({ error: "Deprecated. Use /api/attendance/fetch" }, { status: 405 });
}
