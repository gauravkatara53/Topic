"use client";

import { useState, useMemo } from "react";
import { Trophy, Search, ChevronLeft, ChevronRight, Medal, TrendingUp, Calculator, Users } from "lucide-react";
import cgpaDataRaw from "@/data/cgpa.json";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// The data from the prompt represents the JSON.
interface StudentCGPA {
    Regn: string;
    Name: string;
    Cgpa: number | null;
    Sgpa: number | null;
}

const cgpaData: StudentCGPA[] = cgpaDataRaw as any;

const extractBatch = (regn: string) => {
    if (regn && regn.length >= 4) {
        return regn.substring(0, 4);
    }
    return "N/A";
};

const extractBranch = (regn: string) => {
    if (regn && regn.length >= 8) {
        return regn.substring(6, 8);
    }
    return "N/A";
};

export default function CGLeaderboardPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBatch, setFilterBatch] = useState("All");
    const [filterBranch, setFilterBranch] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Extract unique batches and branches for the filters
    const uniqueBatches = useMemo(() => {
        const batches = new Set<string>();
        cgpaData.forEach(d => {
            const b = extractBatch(d.Regn);
            if (b !== "N/A") batches.add(b);
        });
        return Array.from(batches).sort();
    }, []);

    const uniqueBranches = useMemo(() => {
        const branches = new Set<string>();
        cgpaData.forEach(d => {
            const b = extractBranch(d.Regn);
            if (b !== "N/A") branches.add(b);
        });
        return Array.from(branches).sort();
    }, []);

    // Process data: filter nulls, sort by CGPA descending, and assign global rank
    const rankedData = useMemo(() => {
        const valid = cgpaData.filter(d => d.Cgpa !== null && d.Cgpa > 0);
        const sorted = valid.sort((a, b) => (b.Cgpa || 0) - (a.Cgpa || 0));
        return sorted.map((student, index) => ({
            ...student,
            GlobalRank: index + 1
        }));
    }, []);

    // Filter based on search term, batch, and branch
    const filteredData = useMemo(() => {
        let result = rankedData;

        if (filterBatch !== "All") {
            result = result.filter(d => extractBatch(d.Regn) === filterBatch);
        }

        if (filterBranch !== "All") {
            result = result.filter(d => extractBranch(d.Regn) === filterBranch);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(
                d =>
                    (d.Name && d.Name.toLowerCase().includes(lowerSearch)) ||
                    (d.Regn && d.Regn.toLowerCase().includes(lowerSearch))
            );
        }
        return result;
    }, [rankedData, searchTerm, filterBatch, filterBranch]);

    // Calculate statistics based on filtered data
    const highestCgpa = filteredData.length > 0 ? filteredData[0].Cgpa : 0;

    const averageCgpa = useMemo(() => {
        if (filteredData.length === 0) return 0;
        const sum = filteredData.reduce((acc, curr) => acc + (curr.Cgpa || 0), 0);
        return sum / filteredData.length;
    }, [filteredData]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Handle Search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-slate-400 fill-slate-400/20 dark:text-slate-300 dark:fill-slate-300/20" />;
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-700 fill-amber-700/20 dark:text-amber-500 dark:fill-amber-500/20" />;
        return <span className="text-slate-500 dark:text-slate-400 font-semibold w-5 text-center">#{rank}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Trophy className="h-7 w-7 text-teal-500" />
                        CGPA Leaderboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Top academic performers across all batches and branches.
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Students</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{filteredData.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-teal-50 dark:bg-teal-500/10 text-teal-500 dark:text-teal-400 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Highest CGPA</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{highestCgpa?.toFixed(2) || "0.00"}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded-full flex items-center justify-center">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Average CGPA</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{averageCgpa.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full sm:w-40">
                        <Select value={filterBatch} onValueChange={(v) => { setFilterBatch(v); setCurrentPage(1); }}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="Batch" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <SelectItem value="All">All Batches</SelectItem>
                                {uniqueBatches.map(batch => (
                                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-40">
                        <Select value={filterBranch} onValueChange={(v) => { setFilterBranch(v); setCurrentPage(1); }}>
                            <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <SelectItem value="All">All Branches</SelectItem>
                                {uniqueBranches.map(branch => (
                                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="relative w-full md:w-72 mt-4 md:mt-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by Name or Reg No..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="px-6 py-4 w-20 text-center">Rank</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Reg No.</th>
                                <th className="px-6 py-4 hidden md:table-cell">Branch</th>
                                <th className="px-6 py-4 text-center">SGPA</th>
                                <th className="px-6 py-4 text-right">CGPA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((student, index) => {
                                    const currentRank = startIndex + index + 1;
                                    return (
                                        <tr key={student.Regn} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4 text-center flex justify-center items-center h-full text-slate-700 dark:text-slate-300">
                                                {getRankBadge(currentRank)}
                                            </td>
                                            <td className="px-6 py-4 border-l-2 border-transparent group-hover:border-teal-400 transition-all">
                                                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                    {student.Name || "Unknown"}
                                                    {student.GlobalRank === 1 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">#1 GLOBAL</span>}
                                                </div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500 sm:hidden mt-0.5">{student.Regn}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell font-mono text-xs">
                                                {student.Regn}
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                    {extractBranch(student.Regn)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-medium">
                                                {student.Sgpa?.toFixed(2) || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-teal-600 dark:text-teal-400">
                                                {student.Cgpa?.toFixed(2) || "-"}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No results found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Showing <span className="font-medium text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{" "}
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}
                            </span>{" "}
                            of <span className="font-medium text-slate-800 dark:text-slate-200">{filteredData.length}</span> students
                        </p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-1 px-3 text-sm font-medium rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" /> Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 px-3 text-sm font-medium rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
