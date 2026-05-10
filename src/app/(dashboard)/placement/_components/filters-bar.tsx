"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { PLACEMENT_STATUSES } from "@/types/placement";
import type { PlacementFilters, SortOption } from "@/types/placement";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  filters: PlacementFilters;
  onChange: (f: Partial<PlacementFilters>) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "Latest Applied" },
  { value: "oldest", label: "Oldest First" },
  { value: "package_high", label: "Highest Package" },
  { value: "package_low", label: "Lowest Package" },
  { value: "company_az", label: "Company A–Z" },
];

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const hasActiveFilters =
    filters.status !== "" || filters.type !== "" || filters.referral !== "";

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, role…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf] text-sm transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOption })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf] transition-all min-w-[170px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">Filter:</span>
        </div>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50",
            filters.status
              ? "bg-[#1b254b] border-[#1b254b] text-white"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          )}
        >
          <option value="">All Statuses</option>
          {PLACEMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50",
            filters.type
              ? "bg-[#1b254b] border-[#1b254b] text-white"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          )}
        >
          <option value="">All Types</option>
          <option value="ON_CAMPUS">On-Campus</option>
          <option value="OFF_CAMPUS">Off-Campus</option>
        </select>

        {/* Referral filter */}
        <select
          value={filters.referral}
          onChange={(e) => onChange({ referral: e.target.value })}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50",
            filters.referral
              ? "bg-[#1b254b] border-[#1b254b] text-white"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          )}
        >
          <option value="">All</option>
          <option value="true">Referral ✓</option>
          <option value="false">No Referral</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ status: "", type: "", referral: "" })}
            className="text-xs px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
