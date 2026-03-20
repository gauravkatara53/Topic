import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bell, Calendar as CalIcon, BookOpen, ClipboardCheck, LogIn, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export async function OverviewWidgets({ userId }: { userId: string | null }) {
    const [notes, events, attendance] = await Promise.all([
        prisma.file.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
        prisma.calendarEvent.findMany({ take: 3, where: { date: { gte: new Date() } }, orderBy: { date: "asc" } }),
        userId ? prisma.attendanceRecord.findMany({ where: { userId } }) : Promise.resolve([])
    ]);

    const announcementsCount = await prisma.announcement.count();

    const totalClasses = attendance.reduce((acc: number, r: any) => acc + r.total, 0);
    const totalAttended = attendance.reduce((acc: number, r: any) => acc + r.attended, 0);
    const globalAttendance = totalClasses === 0 ? 0 : (totalAttended / totalClasses) * 100;
    const riskCount = attendance.filter((a: any) => a.percentage < 75).length;

    return (
        <>
            <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4 items-stretch">
                {/* Attendance Widget */}
                <Card className="shadow-sm border-slate-200/50 rounded-2xl overflow-hidden min-h-[120px] sm:h-[164px]">
                    <CardContent className="p-3.5 sm:p-5 flex flex-col justify-between h-full gap-3 sm:gap-0">
                        <div className="flex justify-between items-start">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-50 rounded-[10px] sm:rounded-xl flex items-center justify-center text-orange-500">
                                <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                        {!userId ? (
                            <div className="space-y-1.5 mt-auto">
                                <div className="flex items-center gap-2">
                                    <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                                    <span className="text-[11px] sm:text-[13px] text-slate-500 font-semibold">Sign in required</span>
                                </div>
                                <Link href="/sign-in" className="text-[10px] sm:text-[12px] text-orange-500 font-bold hover:text-orange-600 transition-colors flex items-center gap-1">
                                    Sign in to track <ArrowRight className="h-2.5 w-2.5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-0.5 mt-auto">
                                <h3 className="text-[26px] sm:text-[32px] font-bold text-orange-500 tracking-tight leading-none mb-1">
                                    {attendance.length > 0 ? `${globalAttendance.toFixed(1)}%` : "N/A"}
                                </h3>
                                <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium pt-1 line-clamp-2 leading-tight">
                                    Attendance {attendance.length > 0 ? <span className="text-slate-400 font-normal">· {totalAttended}/{totalClasses}</span> : <span className="text-slate-400 font-normal">· None</span>}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Study Material Widget */}
                <Card className="shadow-sm border-slate-200/50 rounded-2xl overflow-hidden min-h-[120px] sm:h-[164px]">
                    <CardContent className="p-3.5 sm:p-5 flex flex-col justify-between h-full gap-3 sm:gap-0">
                        <div className="flex justify-between items-start">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-teal-50 rounded-[10px] sm:rounded-xl flex items-center justify-center text-teal-600">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                        <div className="space-y-0.5 mt-auto">
                            <h3 className="text-[26px] sm:text-[32px] font-bold text-slate-800 tracking-tight leading-none mb-1">
                                {notes.length > 0 ? notes.length : "0"}
                            </h3>
                            <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium pt-1 line-clamp-2 leading-tight">
                                Notes <span className="text-slate-400 font-normal">· {notes.length === 0 ? "First to upload" : "Available"}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements Widget */}
                <Card className="shadow-sm border-slate-200/50 rounded-2xl overflow-hidden min-h-[120px] sm:h-[164px]">
                    <CardContent className="p-3.5 sm:p-5 flex flex-col justify-between h-full gap-3 sm:gap-0">
                        <div className="flex justify-between items-start">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-teal-50 rounded-[10px] sm:rounded-xl flex items-center justify-center text-teal-600">
                                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                        <div className="space-y-0.5 mt-auto">
                            <h3 className="text-[26px] sm:text-[32px] font-bold text-slate-800 tracking-tight leading-none mb-1">
                                {announcementsCount}
                            </h3>
                            <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium pt-1 line-clamp-2 leading-tight">
                                Notices <span className="text-slate-400 font-normal">· {announcementsCount === 0 ? "All caught up" : "Recently"}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Up Next Widget */}
                <Card className="shadow-sm border-slate-200/50 rounded-2xl overflow-hidden min-h-[120px] sm:h-[164px]">
                    <CardContent className="p-3.5 sm:p-5 flex flex-col justify-between h-full gap-3 sm:gap-0">
                        <div className="flex justify-between items-start">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-teal-50 rounded-[10px] sm:rounded-xl flex items-center justify-center text-teal-600">
                                <CalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                        <div className="space-y-0.5 mt-auto">
                            <h3 className="text-[26px] sm:text-[32px] font-bold text-slate-800 tracking-tight leading-none mb-1">
                                {events.length > 0 ? events.length : "0"}
                            </h3>
                            <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium pt-1 line-clamp-2 leading-tight">
                                Upcoming <span className="text-slate-400 font-normal">· {events.length === 0 ? "None" : "Events"}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Warning Banner Below Widgets (Dynamic based on attendance) */}
            {userId && attendance.length > 0 && globalAttendance < 75 && (
                <div className="bg-[#fff9f2] border border-orange-200/60 p-3 sm:p-4 rounded-2xl flex items-start gap-3 mt-1 shadow-sm">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-800 tracking-tight">Attendance Below 75%</h4>
                        <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium leading-snug">Your global attendance is {globalAttendance.toFixed(1)}%. You have {riskCount} subject(s) below the 75% threshold.</p>
                        <Link href="/attendance" className="text-[12px] sm:text-[13px] font-bold text-orange-500 hover:text-orange-600 transition-colors pt-1.5 flex items-center gap-1 w-max">
                            View Analytics <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export async function DashboardContent() {
    const [dbAnnouncementsRaw, notes] = await Promise.all([
        prisma.announcement.findMany({ take: 5, orderBy: { date: "desc" } }),
        prisma.file.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    ]);

    const localAnnouncements = dbAnnouncementsRaw.map((a: any) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        date: a.date,
        source: "local" as const,
    }));

    let externalNotices: any[] = [];
    try {
        const res = await fetch("https://nitjsr.ac.in/backend/api/notices", { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const notices = data.data || [];
            const newNotices = notices.filter((n: any) => {
                const year = new Date(parseInt(n.idate)).getFullYear();
                return year >= 2026;
            });
            externalNotices = newNotices.map((n: any) => {
                const primaryCat = n.notification_for?.[0] || "general";
                return {
                    id: `ext-${n.id}`,
                    title: n.title,
                    category: primaryCat,
                    date: new Date(parseInt(n.idate)),
                    source: "nitjsr" as const,
                };
            });
        }
    } catch (e) {
        console.error("Failed to fetch external notices", e);
    }

    const announcements = [...localAnnouncements, ...externalNotices]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 4);

    return (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Recent Announcements */}
            <Card className="rounded-2xl border-slate-200/60 shadow-sm flex flex-col h-full overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                        Latest Notices
                    </CardTitle>
                    <Link href="/announcements" className="text-[13px] sm:text-sm font-medium text-teal-600 flex items-center gap-1 hover:text-teal-700">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 pt-0 flex-1">
                    {announcements.length > 0 ? (
                        announcements.map((ann: any, idx: number) => (
                            <div key={ann.id || idx} className="flex gap-3 sm:gap-4 items-start bg-slate-50/50 hover:bg-slate-50 transition-colors p-3 sm:p-4 rounded-xl border border-slate-100">
                                <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${ann.source === 'nitjsr' ? 'bg-teal-500' : 'bg-orange-400'}`} />
                                <div className="space-y-1 w-full">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-[13px] sm:text-[14px] font-semibold text-slate-800 line-clamp-2 leading-snug">{ann.title}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                        <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium whitespace-nowrap truncate">
                                            {format(new Date(ann.date), "MMM d, yy")}
                                        </p>
                                        {ann.source === 'nitjsr' && (
                                            <div className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-teal-50 text-teal-600 border border-teal-200 shrink-0">
                                                NITJSR
                                            </div>
                                        )}
                                        <div className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 truncate max-w-[80px] sm:max-w-none">
                                            {ann.category}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 sm:py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                            <p className="text-[13px] sm:text-sm text-slate-500 font-medium">No recent notices</p>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">You're all caught up!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Notes */}
            <Card className="rounded-2xl border-slate-200/60 shadow-sm flex flex-col h-full overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 sm:w-5 sm:h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        Top Notes
                    </CardTitle>
                    <Link href="/notes" className="text-[13px] sm:text-sm font-medium text-teal-600 flex items-center gap-1 hover:text-teal-700">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 pt-0 flex-1">
                    {notes.length > 0 ? (
                        notes.map((n: any, idx: number) => (
                            <div key={n.id} className="flex gap-3 sm:gap-4 justify-between items-center px-3 py-3 sm:px-4 sm:py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className="flex gap-3 sm:gap-4 items-center overflow-hidden">
                                    <span className="text-xl sm:text-2xl font-bold text-[#b2e5d5] font-sans w-5 sm:w-6 shrink-0 text-center">{idx + 1}</span>
                                    <div className="space-y-0.5 pr-1 min-w-0">
                                        <p className="text-[14px] sm:text-[15px] font-semibold text-slate-800 truncate">{n.subject}</p>
                                        <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium truncate">
                                            {n.branch} · Sem {n.semester}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-[#e6fbf4] text-teal-600 px-1.5 py-1 sm:px-2 sm:py-1 flex items-center gap-1 rounded font-semibold text-[10px] sm:text-[11px] tracking-wide shrink-0">
                                    {n.downloads}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 sm:h-3 sm:w-3"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 sm:py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
                            <p className="text-[13px] sm:text-sm text-slate-500 font-medium">No notes available yet</p>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Be the first to upload one!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export async function UpcomingEvents() {
    const events = await prisma.calendarEvent.findMany({
        take: 3,
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" }
    });

    return (
        <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6 border-b border-slate-100 bg-white">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
                    <CalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                    Upcoming Events
                </CardTitle>
                <Link href="/calendar" className="text-[13px] font-medium text-teal-600 flex items-center gap-1 hover:text-teal-700">
                    Full calendar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-slate-50/30">
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {events.map((ev: any, i: number) => {
                            let colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                            if (ev.type === "EXAM") colorClass = "text-rose-600 bg-rose-50 border-rose-100";
                            else if (ev.type === "EVENT") colorClass = "text-blue-600 bg-blue-50 border-blue-100";
                            else if (ev.type === "ACADEMIC") colorClass = "text-orange-600 bg-orange-50 border-orange-100";

                            return (
                                <div key={ev.id || i} className="flex flex-col justify-between gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 hover:shadow-sm hover:border-slate-300 transition-all bg-white min-h-[90px] sm:min-h-[110px]">
                                    <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${colorClass} w-max`}>
                                        {ev.type}
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-[13px] sm:text-[14px] text-slate-800 leading-tight line-clamp-2">{ev.title}</h4>
                                        <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium mt-1">{format(new Date(ev.date), "MMM d, yyyy")}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-6 sm:py-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                        <CalIcon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-300 mx-auto mb-2.5 sm:mb-3" />
                        <p className="text-[13px] sm:text-sm text-slate-500 font-medium">No upcoming events right now</p>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Enjoy your free time!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[120px] sm:h-[164px] bg-slate-200 rounded-2xl" />
                ))}
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="h-80 bg-slate-200 rounded-2xl" />
                <div className="h-80 bg-slate-200 rounded-2xl" />
            </div>
            <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
    );
}
