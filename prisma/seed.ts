import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash("password123", 10);

    const user = await prisma.user.upsert({
        where: { email: "student@college.edu" },
        update: {},
        create: {
            id: "user_dummy_student123",
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
            id: "user_dummy_admin456",
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

    console.log("Database seeded!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
