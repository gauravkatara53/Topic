"use client";

import { Briefcase, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAdd?: () => void;
}

export function EmptyState({
  title = "No applications yet",
  description = "Start tracking your placement journey by adding your first application.",
  onAdd,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1b254b]/10 to-[#2dd4bf]/20 dark:from-[#1b254b]/40 dark:to-[#2dd4bf]/20 flex items-center justify-center rotate-6 absolute inset-0" />
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1b254b]/5 to-[#2dd4bf]/10 dark:from-[#1b254b]/30 dark:to-[#2dd4bf]/10 flex items-center justify-center -rotate-3 absolute inset-0" />
        <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative shadow-sm">
          <Briefcase className="w-10 h-10 text-[#2dd4bf]" />
        </div>
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {onAdd && (
        <Button
          onClick={onAdd}
          className="mt-6 bg-gradient-to-r from-[#1b254b] to-[#243060] hover:from-[#243060] hover:to-[#2b365d] text-white gap-2 rounded-xl px-6 shadow-lg shadow-[#1b254b]/20"
        >
          <PlusCircle className="w-4 h-4" />
          Add Application
        </Button>
      )}
    </div>
  );
}
