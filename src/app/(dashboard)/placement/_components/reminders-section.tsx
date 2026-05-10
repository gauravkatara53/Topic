"use client";

import { useState } from "react";
import { PlacementReminder } from "@/types/placement";
import { Bell, Check, Plus, Trash2, CalendarClock, Building2 } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RemindersSectionProps {
  reminders: PlacementReminder[];
  applicationOptions: { id: string; companyName: string; role: string }[];
}

export function RemindersSection({ reminders: initialReminders, applicationOptions }: RemindersSectionProps) {
  const [reminders, setReminders] = useState(initialReminders);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", dueDate: "", applicationId: "" });
  const [loading, setLoading] = useState(false);

  const getDueBadge = (dueDate: string) => {
    const d = new Date(dueDate);
    if (isPast(d) && !isToday(d)) return { label: "Overdue", cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" };
    if (isToday(d)) return { label: "Today", cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" };
    if (isTomorrow(d)) return { label: "Tomorrow", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" };
    return null;
  };

  const handleAdd = async () => {
    if (!form.title || !form.dueDate) { toast.error("Title and due date are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/placement/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          dueDate: form.dueDate,
          applicationId: form.applicationId || null,
        }),
      });
      const newReminder = await res.json();
      setReminders((prev) => [newReminder, ...prev]);
      setForm({ title: "", dueDate: "", applicationId: "" });
      setShowForm(false);
      toast.success("Reminder added!");
    } catch {
      toast.error("Failed to add reminder");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, completed } : r));
    try {
      await fetch(`/api/placement/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (completed) toast.success("Reminder marked as done ✓");
    } catch {
      toast.error("Failed to update reminder");
    }
  };

  const handleDelete = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/placement/reminders/${id}`, { method: "DELETE" });
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const pending = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20">
            <Bell className="w-4 h-4 text-[#2dd4bf]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Reminders</h3>
            <p className="text-[11px] text-slate-400">{pending.length} pending</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#1b254b] text-white hover:bg-[#243060] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Reminder
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            placeholder="Reminder title…"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf]"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf]"
            />
            <select
              value={form.applicationId}
              onChange={(e) => setForm((p) => ({ ...p, applicationId: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf]"
            >
              <option value="">No linked app</option>
              {applicationOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.companyName} – {a.role}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-4 py-1.5 text-sm font-semibold bg-[#1b254b] text-white rounded-lg hover:bg-[#243060] transition-colors disabled:opacity-60"
            >
              {loading ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Pending reminders */}
      {pending.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-8 text-center">
          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No pending reminders</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((r) => {
            const badge = getDueBadge(r.dueDate);
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 hover:border-[#2dd4bf]/40 transition-colors group"
              >
                <button
                  onClick={() => handleToggle(r.id, true)}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-all shrink-0 flex items-center justify-center"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarClock className="w-3 h-3" />
                      {format(new Date(r.dueDate), "dd MMM yyyy")}
                    </span>
                    {r.application && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Building2 className="w-3 h-3" />
                        {r.application.companyName}
                      </span>
                    )}
                  </div>
                </div>
                {badge && (
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", badge.cls)}>
                    {badge.label}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <details className="group">
          <summary className="text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors list-none flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {done.length} completed
          </summary>
          <div className="mt-2 space-y-1.5">
            {done.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2.5 opacity-60 group/item">
                <Check className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="text-sm text-slate-500 dark:text-slate-400 line-through flex-1">{r.title}</span>
                <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover/item:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
