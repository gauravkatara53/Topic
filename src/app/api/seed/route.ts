import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const password = await bcrypt.hash("password123", 10);

        const user = await prisma.user.upsert({
            where: { email: "student@college.edu" },
            update: {},
            create: {
                id: "user_api_student123",
                email: "student@college.edu",
                name: "Alex Student",
                password: password,
                role: "STUDENT",
                branch: "CSE",
                semester: 4,
            },
        });

        const admin = await prisma.user.upsert({
            where: { email: "admin@college.edu" },
            update: {},
            create: {
                id: "user_api_admin456",
                email: "admin@college.edu",
                name: "Dr. Admin Faculty",
                password: password,
                role: "FACULTY",
                branch: "CSE",
            },
        });

        await prisma.announcement.create({
            data: {
                title: "Mid-Term Examination Schedule Released",
                body: "The mid-term examination schedule for all semesters has been officially released. Please check the college portal for the detailed timetable.",
                category: "exam",
                pinned: true,
            }
        });

        await prisma.announcement.create({
            data: {
                title: "Tech Fest 2026 Registration Open",
                body: "Register for the upcoming technical fest. Events include hackathons, coding challenges, and robotics.",
                category: "event",
            }
        });

        return NextResponse.json({ message: "Database seeded!" });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error?.message || "Failed to seed" }, { status: 500 });
    }
}
