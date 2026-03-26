"use client";

import { useState, useMemo } from "react";
import { Search, Pin, Calendar, Tag, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type Announcement = {
    id: string;
    title: string;
    body?: string | null;
    url?: string | null;
    category: string;
    tags?: string[];
    date: Date;
    pinned: boolean;
    source: "local" | "nitjsr";
};

export function AnnouncementFeed({ initialData }: { initialData: Announcement[] }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const categories = useMemo(() => {
        const cats = new Set<string>();
        cats.add("All");
        initialData.forEach(item => {
            if (item.category) cats.add(item.category);
            item.tags?.forEach(tag => cats.add(tag));
        });
        return Array.from(cats);
    }, [initialData]);

    const filteredData = initialData.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.body && item.body.toLowerCase().includes(search.toLowerCase()));

        const matchesFilter = filter === "All" ||
            item.category === filter ||
            (item.tags && item.tags.includes(filter));

        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case "exam": return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20";
            case "event": return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20";
            case "holiday": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20";
            case "student": return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20";
            case "announcement": return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20";
            case "recruitment": return "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20";
            case "office": return "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20";
            default: return "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Search announcements..."
                        className="pl-10 h-10 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-teal-500 w-full shadow-sm"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {categories.map((cat) => (
                        <div
                            key={cat}
                            className={`cursor-pointer whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${filter === cat
                                ? "bg-slate-700 dark:bg-teal-600 text-white border-slate-700 dark:border-teal-600 shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                            onClick={() => {
                                setFilter(cat);
                                setCurrentPage(1); // Reset to first page on filter
                            }}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                        No announcements found.
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/50">
                        {paginatedData.map((announcement, index) => (
                            <div key={announcement.id} className="group p-5 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors flex gap-5 items-start">
                                {/* Number Prefix */}
                                <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 items-center justify-center font-semibold text-sm">
                                    {startIndex + index + 1}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-[14px] sm:text-[17px] font-semibold text-slate-600 dark:text-slate-200 leading-snug flex items-start gap-2">
                                        {/* {announcement.pinned && (
                                            <Pin className="h-4 w-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                                        )} */}
                                        {announcement.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(announcement.date), "MMM d, yyyy")}
                                        </span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {announcement.source === 'nitjsr' && (
                                                <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                                                    NITJSR Portal
                                                </div>
                                            )}
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(announcement.category)}`}>
                                                {announcement.category}
                                            </div>
                                        </div>
                                    </div>

                                    {announcement.body && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mt-2">{announcement.body}</p>
                                    )}
                                </div>

                                {/* Actions Area */}
                                <div className="shrink-0 pt-1">
                                    {announcement.url && (
                                        <a
                                            href={announcement.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View Official Notice"
                                            className="p-2.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors flex items-center justify-center border border-transparent hover:border-teal-100 dark:hover:border-teal-500/30 bg-white dark:bg-slate-800 shadow-sm hover:shadow"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-slate-800 shadow-sm"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-slate-800 shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
