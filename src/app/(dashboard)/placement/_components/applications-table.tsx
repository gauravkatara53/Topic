"use client";

import { PlacementApplication } from "@/types/placement";
import { QuickStatusDropdown } from "./quick-status-dropdown";
import { StatusBadge } from "./status-badge";
import { formatPackage } from "./format-package";
import { format } from "date-fns";
import {
  ExternalLink, Trash2, Edit2, GraduationCap, Globe,
  Users, Package, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationsTableProps {
  applications: PlacementApplication[];
  onEdit: (app: PlacementApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onSelect: (app: PlacementApplication) => void;
}

export function ApplicationsTable({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
  onSelect,
}: ApplicationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Company / Role</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Type</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Package</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Applied</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, idx) => (
            <tr
              key={app.id}
              className={cn(
                "group border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors cursor-pointer",
                idx === applications.length - 1 && "border-b-0"
              )}
              onClick={() => onSelect(app)}
            >
              {/* Company/Role */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b254b]/10 to-[#2dd4bf]/20 dark:from-[#2dd4bf]/10 dark:to-[#1b254b]/40 flex items-center justify-center shrink-0 text-[15px] font-black text-[#1b254b] dark:text-[#2dd4bf]">
                    {app.companyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{app.companyName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{app.role}</p>
                  </div>
                </div>
              </td>

              {/* Type */}
              <td className="px-4 py-3.5 hidden md:table-cell">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full",
                  app.type === "ON_CAMPUS"
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                )}>
                  {app.type === "ON_CAMPUS"
                    ? <><GraduationCap className="w-3 h-3" /> On-Campus</>
                    : <><Globe className="w-3 h-3" /> Off-Campus</>}
                </span>
                {app.referralTaken && (
                  <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300">
                    <Users className="w-2.5 h-2.5" />Ref
                  </span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <QuickStatusDropdown
                  applicationId={app.id}
                  currentStatus={app.currentStatus}
                  onStatusChange={onStatusChange}
                />
              </td>

              {/* Package */}
              <td className="px-4 py-3.5 hidden lg:table-cell">
                {app.packageOrStipend ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <Package className="w-3.5 h-3.5" />
                    {formatPackage(app.packageOrStipend, app.internshipOrFullTime)}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                )}
              </td>

              {/* Applied Date */}
              <td className="px-4 py-3.5 hidden lg:table-cell">
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(app.applicationDate), "dd MMM yy")}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {app.jobLink && (
                    <a
                      href={app.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1b254b] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
