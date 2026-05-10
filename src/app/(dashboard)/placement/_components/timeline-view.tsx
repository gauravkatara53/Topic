"use client";

import { PlacementApplication } from "@/types/placement";
import { StatusBadge } from "./status-badge";
import { formatPackage } from "./format-package";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  applications: PlacementApplication[];
  onSelect: (app: PlacementApplication) => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  "Selected":       <CheckCircle2 className="w-4 h-4 text-teal-500" />,
  "Offer Received": <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  "Rejected":       <Circle className="w-4 h-4 text-red-400" />,
  "Ghosted":        <Circle className="w-4 h-4 text-slate-400" />,
};

export function TimelineView({ applications, onSelect }: TimelineViewProps) {
  // Group by month
  const grouped = applications.reduce<Record<string, PlacementApplication[]>>((acc, app) => {
    const key = format(new Date(app.applicationDate), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(app);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(grouped).map(([month, apps]) => (
        <div key={month}>
          {/* Month header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {month}
            </div>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 font-semibold">{apps.length} app{apps.length > 1 ? "s" : ""}</span>
          </div>

          {/* Timeline entries */}
          <div className="relative ml-4 space-y-3">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#2dd4bf]/40 to-transparent" />

            {apps.map((app) => (
              <div
                key={app.id}
                className="relative pl-7 cursor-pointer group"
                onClick={() => onSelect(app)}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-[-5px] top-3 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 transition-all group-hover:scale-125",
                  app.currentStatus === "Selected" ? "bg-teal-500" :
                  app.currentStatus === "Offer Received" ? "bg-emerald-500" :
                  app.currentStatus === "Rejected" ? "bg-red-400" :
                  app.currentStatus === "Ghosted" ? "bg-slate-400" :
                  "bg-[#2dd4bf]"
                )} />

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[#2dd4bf]/50 hover:shadow-md transition-all group-hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{app.companyName}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">·</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">{app.role}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StatusBadge status={app.currentStatus} size="sm" />
                        {app.packageOrStipend && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatPackage(app.packageOrStipend, app.internshipOrFullTime)}
                            </span>
                          )}
                        <span className="text-xs text-slate-400">
                          {format(new Date(app.applicationDate), "dd MMM")}
                        </span>
                      </div>
                    </div>

                    {app.jobLink && (
                      <a
                        href={app.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-300 hover:text-[#2dd4bf] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Status updates count */}
                  {app.statusHistory.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {app.statusHistory.length} status updates · Last: {format(new Date(app.statusHistory[0].date), "dd MMM")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
