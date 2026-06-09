"use client";

import { useState, useEffect, useCallback } from "react";
import { PlacementOutreach } from "@/types/placement";
import { OutreachModal } from "./outreach-modal";
import { Loader2, PlusCircle, ExternalLink, Edit2, Trash2, Mail, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OUTREACH_STATUS_COLORS } from "@/types/placement";

export function OutreachSection() {
  const [outreach, setOutreach] = useState<PlacementOutreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOutreach, setEditingOutreach] = useState<PlacementOutreach | null>(null);

  const fetchOutreach = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/placement/outreach");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOutreach(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load outreach contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutreach();
  }, [fetchOutreach]);

  const handleSaved = (saved: PlacementOutreach) => {
    setOutreach((prev) => {
      const idx = prev.findIndex((o) => o.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    try {
      await fetch(`/api/placement/outreach/${id}`, { method: "DELETE" });
      setOutreach((prev) => prev.filter((o) => o.id !== id));
      toast.success("Contact deleted");
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2dd4bf]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Networking & Outreach</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track people you've reached out to for referrals and opportunities.</p>
        </div>
        <button
          onClick={() => { setEditingOutreach(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1b254b] text-white rounded-xl font-semibold text-sm hover:bg-[#243060] transition-all shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {outreach.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No contacts yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
            Start tracking the people you reach out to for referrals and career opportunities.
          </p>
          <button
            onClick={() => { setEditingOutreach(null); setModalOpen(true); }}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#1b254b] dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Add your first contact
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Person / Role</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Company</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Dates</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outreach.map((o, idx) => {
                const colors = OUTREACH_STATUS_COLORS[o.status] || OUTREACH_STATUS_COLORS["To Contact"];
                return (
                  <tr
                    key={o.id}
                    className={cn(
                      "group border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors",
                      idx === outreach.length - 1 && "border-b-0"
                    )}
                  >
                    {/* Person / Role */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/20 dark:from-indigo-500/20 dark:to-purple-500/30 flex items-center justify-center shrink-0 text-[15px] font-black text-indigo-700 dark:text-indigo-300">
                          {o.personName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{o.personName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{o.role || "No role"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{o.companyName}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold", colors.bg, colors.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                        {o.status}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                        {o.dateReachedOut && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> Sent: {format(new Date(o.dateReachedOut), "MMM d, yyyy")}
                          </span>
                        )}
                        {o.repliedAt && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Mail className="w-3 h-3" /> Rep: {format(new Date(o.repliedAt), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {o.linkedinUrl && (
                          <a
                            href={o.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="LinkedIn"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => { setEditingOutreach(o); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1b254b] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <OutreachModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingOutreach(null); }}
        editingOutreach={editingOutreach}
        onSaved={handleSaved}
      />
    </div>
  );
}
