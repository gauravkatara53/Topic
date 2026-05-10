"use client";

import { PlacementApplication } from "@/types/placement";
import { QuickStatusDropdown } from "./quick-status-dropdown";
import { formatPackage } from "./format-package";
import { format } from "date-fns";
import {
  ExternalLink, Trash2, Edit2, GraduationCap, Globe,
  Users, Package, CalendarDays, MapPin, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationsGridProps {
  applications: PlacementApplication[];
  onEdit: (app: PlacementApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onSelect: (app: PlacementApplication) => void;
}

export function ApplicationsGrid({
  applications,
  onEdit,
  onDelete,
  onStatusChange,
  onSelect,
}: ApplicationsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-[#2dd4bf]/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
          onClick={() => onSelect(app)}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2dd4bf]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b254b]/10 to-[#2dd4bf]/20 dark:from-[#2dd4bf]/10 dark:to-[#1b254b]/40 flex items-center justify-center text-[17px] font-black text-[#1b254b] dark:text-[#2dd4bf] shrink-0 border border-[#2dd4bf]/10">
                {app.companyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-[15px] leading-tight">{app.companyName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{app.role}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              {app.jobLink && (
                <a href={app.jobLink} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-slate-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button onClick={() => onEdit(app)} className="p-1 rounded-lg text-slate-400 hover:text-[#1b254b] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(app.id)} className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status */}
          <div onClick={(e) => e.stopPropagation()} className="mb-3">
            <QuickStatusDropdown
              applicationId={app.id}
              currentStatus={app.currentStatus}
              onStatusChange={onStatusChange}
            />
          </div>

          {/* Meta info */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-4 flex-wrap">
              <span className={cn(
                "flex items-center gap-1 text-xs font-medium",
                app.type === "ON_CAMPUS" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
              )}>
                {app.type === "ON_CAMPUS" ? <GraduationCap className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {app.type === "ON_CAMPUS" ? "On-Campus" : "Off-Campus"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {app.internshipOrFullTime === "INTERNSHIP" ? "Internship" : "Full Time"}
              </span>
              {app.referralTaken && (
                <span className="flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400">
                  <Users className="w-3 h-3" /> Referral
                </span>
              )}
            </div>

            {app.packageOrStipend && (
              <p className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <Package className="w-3.5 h-3.5" />
                {formatPackage(app.packageOrStipend, app.internshipOrFullTime)}
              </p>
            )}

            {app.location && (
              <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3" /> {app.location}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <CalendarDays className="w-3 h-3" />
              {format(new Date(app.applicationDate), "dd MMM yyyy")}
            </span>
            {app.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] text-slate-400">{app.tags.slice(0, 2).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
