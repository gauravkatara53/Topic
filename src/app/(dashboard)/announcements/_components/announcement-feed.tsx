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
            case "exam": return "bg-rose-50 text-rose-600 border border-rose-100";
            case "event": return "bg-indigo-50 text-indigo-600 border border-indigo-100";
            case "holiday": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
            case "student": return "bg-blue-50 text-blue-600 border border-blue-100";
            case "announcement": return "bg-amber-50 text-amber-600 border border-amber-100";
            case "recruitment": return "bg-purple-50 text-purple-600 border border-purple-100";
            case "office": return "bg-cyan-50 text-cyan-600 border border-cyan-100";
            default: return "bg-slate-50 text-slate-600 border border-slate-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search announcements..."
                        className="pl-10 h-10 border-slate-200 rounded-xl bg-white focus-visible:ring-teal-500 w-full shadow-sm"
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
                                ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50/50">
                        No announcements found.
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                        {paginatedData.map((announcement, index) => (
                            <div key={announcement.id} className="group p-5 hover:bg-slate-50/80 transition-colors flex gap-5 items-start">
                                {/* Number Prefix */}
                                <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 items-center justify-center font-semibold text-sm">
                                    {startIndex + index + 1}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-[14px] sm:text-[17px] font-semibold text-slate-600 leading-snug flex items-start gap-2">
                                        {/* {announcement.pinned && (
                                            <Pin className="h-4 w-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                                        )} */}
                                        {announcement.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(announcement.date), "MMM d, yyyy")}
                                        </span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {announcement.source === 'nitjsr' && (
                                                <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-50 text-teal-600 border border-teal-200">
                                                    NITJSR Portal
                                                </div>
                                            )}
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(announcement.category)}`}>
                                                {announcement.category}
                                            </div>
                                        </div>
                                    </div>

                                    {announcement.body && (
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">{announcement.body}</p>
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
                                            className="p-2.5 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-center border border-transparent hover:border-teal-100 bg-white shadow-sm hover:shadow"
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
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
