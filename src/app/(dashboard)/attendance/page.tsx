import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AttendanceDashboard } from "./_components/attendance-dashboard";
import { AttendancePromo } from "./_components/attendance-promo";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "Monitor your college attendance, calculate bunks, and stay above the 75% threshold with smart predictions.",
};

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
    const { userId } = await auth();

    if (!userId) {
        return <AttendancePromo />;
    }

    const records = await prisma.attendanceRecord.findMany({
        where: { userId },
        orderBy: { subject: "asc" },
    });

    const serializedRecords = records.map((r: any) => ({
        ...r,
        scrapedAt: r.scrapedAt ? r.scrapedAt.toISOString() : null,
    }));

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Tracker</h2>
                    <p className="text-muted-foreground">Monitor your classes, calculate bunks, and stay safe.</p>
                </div>
            </div>

            <AttendanceDashboard initialRecords={serializedRecords} />
        </div>
    );
}
