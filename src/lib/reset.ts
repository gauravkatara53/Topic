import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function reset() {
    console.log("Starting reset...");
    try {
        await prisma.attendanceRecord.deleteMany({});
        await prisma.portalCredential.deleteMany({});
        await prisma.file.deleteMany({});
        await prisma.calendarEvent.deleteMany({});
        await prisma.announcement.deleteMany({});
        await prisma.user.deleteMany({});
        console.log("Successfully wiped collections.");
    } catch (err: any) {
        console.error("Prisma error:", err.message);

        // Fallback: Use MongoDB driver directly
        console.log("Attempting direct MongoDB driver reset...");
        const { MongoClient } = require("mongodb");
        const client = new MongoClient(process.env.DATABASE_URL!);
        try {
            await client.connect();
            const db = client.db("campushub");
            await db.collection("AttendanceRecord").deleteMany({});
            await db.collection("PortalCredential").deleteMany({});
            await db.collection("File").deleteMany({});
            await db.collection("CalendarEvent").deleteMany({});
            await db.collection("Announcement").deleteMany({});
            await db.collection("User").deleteMany({});
            console.log("Successfully wiped collections natively.");
        } catch (nativeErr: any) {
            console.error("Native reset failed:", nativeErr.message);
        } finally {
            await client.close();
        }
    } finally {
        await prisma.$disconnect()
    }
}
reset();
