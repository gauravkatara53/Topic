import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get("month");

        let where = {};
        if (dateQuery) {
            // Basic filtering could be applied here if needed
            // where = { date: { gte: new Date(dateQuery) } };
        }

        const events = await prisma.calendarEvent.findMany({
            where,
            orderBy: { date: "asc" },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        // Here we could check clerk role metadata, but for now we'll just require authentication.
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { title, date, type, description } = body;

        if (!title || !date || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const event = await prisma.calendarEvent.create({
            data: {
                title,
                date: new Date(date),
                type,
                description,
            }
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
