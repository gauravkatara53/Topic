import { prisma } from "@/lib/prisma";
import InteractiveCalendar from "./_components/interactive-calendar";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "College Calendar",
    description: "Keep track of upcoming college events, exams, holidays, and important academic deadlines.",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
    const events = await prisma.calendarEvent.findMany({
        orderBy: { date: "asc" },
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-120px)] min-h-[500px] flex flex-col pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">College Calendar</h2>
                    <p className="text-slate-500 text-sm">Keep track of exams, holidays, and deadlines.</p>
                </div>
            </div>

            <div className="flex-1 bg-card rounded-xl border shadow-sm p-4 ">
                <InteractiveCalendar initialEvents={events} />
            </div>
        </div>
    );
}
