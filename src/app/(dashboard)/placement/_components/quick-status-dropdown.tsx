"use client";

import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { PLACEMENT_STATUSES } from "@/types/placement";
import { StatusBadge } from "./status-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickStatusDropdownProps {
  applicationId: string;
  currentStatus: string;
  onStatusChange: (id: string, status: string) => void;
}

export function QuickStatusDropdown({ applicationId, currentStatus, onStatusChange }: QuickStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = async (status: string) => {
    if (status === currentStatus) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/placement/${applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      onStatusChange(applicationId, status);
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={cn(
          "flex items-center gap-1 transition-all rounded-full px-0.5 py-0.5 hover:ring-2 hover:ring-[#2dd4bf]/40",
          loading && "opacity-60 cursor-not-allowed"
        )}
      >
        <StatusBadge status={currentStatus} size="sm" />
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-150">
            {PLACEMENT_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                className={cn(
                  "w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left",
                  status === currentStatus && "bg-slate-50 dark:bg-slate-700/50"
                )}
              >
                <StatusBadge status={status} size="sm" />
                {status === currentStatus && (
                  <span className="ml-auto text-[#2dd4bf] text-[10px] font-bold">Current</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
