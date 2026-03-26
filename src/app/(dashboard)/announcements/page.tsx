import { prisma } from "@/lib/prisma";
import { AnnouncementFeed } from "./_components/announcement-feed";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notices & Announcements",
  description: "Stay updated with the latest notices, events, and important announcements from NIT Jamshedpur administration.",
};

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    const dbAnnouncements = await prisma.announcement.findMany({
        orderBy: [
            { pinned: "desc" },
            { date: "desc" },
        ],
    });

    // Transform DB announcements
    const localAnnouncements = dbAnnouncements.map(a => ({
        id: a.id,
        title: a.title,
        body: a.body,
        category: a.category,
        date: a.date,
        pinned: a.pinned,
        source: "local" as const,
    }));

    let externalNotices = [];
    try {
        const res = await fetch("https://nitjsr.ac.in/backend/api/notices", { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const notices = data.data || [];

            // Filter out notices from before 2026
            const newNotices = notices.filter((n: any) => {
                const year = new Date(parseInt(n.idate)).getFullYear();
                return year >= 2026;
            });

            externalNotices = newNotices.map((n: any) => {
                const primaryCat = n.notification_for?.[0] || "general";
                return {
                    id: `ext-${n.id}`,
                    title: n.title,
                    url: n.path,
                    category: primaryCat,
                    tags: n.notification_for,
                    date: new Date(parseInt(n.idate)),
                    pinned: n.highlight === 1,
                    source: "nitjsr" as const,
                };
            });
        }
    } catch (e) {
        console.error("Failed to fetch external notices", e);
    }

    const allAnnouncements = [...localAnnouncements, ...externalNotices].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.date.getTime() - a.date.getTime();
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Campus Notices</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Official announcements and college updates from NIT Jamshedpur</p>
                </div>
            </div>

            <AnnouncementFeed initialData={allAnnouncements} />
        </div>
    );
}
