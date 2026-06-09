"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { OUTREACH_STATUSES } from "@/types/placement";
import type { PlacementOutreach, PlacementOutreachFormData } from "@/types/placement";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OutreachModalProps {
  open: boolean;
  onClose: () => void;
  editingOutreach?: PlacementOutreach | null;
  onSaved: (outreach: PlacementOutreach) => void;
}

const defaultForm = (): PlacementOutreachFormData => ({
  personName: "",
  companyName: "",
  role: "",
  linkedinUrl: "",
  email: "",
  status: "To Contact",
  dateReachedOut: new Date().toISOString().split("T")[0],
  repliedAt: "",
  notes: "",
});

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
    {children}
  </label>
);

const InputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf] transition-all placeholder-slate-400";

export function OutreachModal({ open, onClose, editingOutreach, onSaved }: OutreachModalProps) {
  const [form, setForm] = useState<PlacementOutreachFormData>(defaultForm());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingOutreach) {
      setForm({
        personName: editingOutreach.personName,
        companyName: editingOutreach.companyName,
        role: editingOutreach.role,
        linkedinUrl: editingOutreach.linkedinUrl ?? "",
        email: editingOutreach.email ?? "",
        status: editingOutreach.status,
        dateReachedOut: editingOutreach.dateReachedOut ? editingOutreach.dateReachedOut.split("T")[0] : "",
        repliedAt: editingOutreach.repliedAt ? editingOutreach.repliedAt.split("T")[0] : "",
        notes: editingOutreach.notes ?? "",
      });
    } else {
      setForm(defaultForm());
    }
  }, [editingOutreach, open]);

  const set = (k: keyof PlacementOutreachFormData, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.personName || !form.companyName) {
      toast.error("Person name and company are required");
      return;
    }
    setLoading(true);
    try {
      const url = editingOutreach ? `/api/placement/outreach/${editingOutreach.id}` : "/api/placement/outreach";
      const method = editingOutreach ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const detail = errData.detail || errData.error || "Unknown error";
        toast.error(`Failed to save: ${detail.slice(0, 120)}`);
        return;
      }
      const saved = await res.json();
      onSaved(saved);
      onClose();
      toast.success(editingOutreach ? "Contact updated!" : "Contact added!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editingOutreach ? "Edit Contact" : "Add Contact"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Networking & Referrals</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Person Name *</Label>
                <input className={InputCls} placeholder="John Doe" value={form.personName} onChange={(e) => set("personName", e.target.value)} />
              </div>
              <div>
                <Label>Company *</Label>
                <input list="company-suggestions" className={InputCls} placeholder="Google" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
                <datalist id="company-suggestions">
                  <option value="Google" />
                  <option value="Microsoft" />
                  <option value="Amazon" />
                  <option value="Atlassian" />
                  <option value="Meta" />
                  <option value="Apple" />
                  <option value="Netflix" />
                </datalist>
              </div>
            </div>

            <div>
              <Label>Role</Label>
              <input list="outreach-role-suggestions" className={InputCls} placeholder="Senior SWE, Recruiter…" value={form.role} onChange={(e) => set("role", e.target.value)} />
              <datalist id="outreach-role-suggestions">
                <option value="Software Engineer" />
                <option value="Senior Software Engineer" />
                <option value="Engineering Manager" />
                <option value="Technical Recruiter" />
                <option value="University Recruiter" />
                <option value="Founder" />
                <option value="CTO" />
                <option value="Alumni" />
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>LinkedIn URL</Label>
                <input className={InputCls} type="url" placeholder="https://linkedin.com/in/…" value={form.linkedinUrl ?? ""} onChange={(e) => set("linkedinUrl", e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <input className={InputCls} type="email" placeholder="john@example.com" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select className={InputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {OUTREACH_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date Reached Out</Label>
                <input className={InputCls} type="date" value={form.dateReachedOut ?? ""} onChange={(e) => set("dateReachedOut", e.target.value)} />
              </div>
              <div>
                <Label>Replied At</Label>
                <input className={InputCls} type="date" value={form.repliedAt ?? ""} onChange={(e) => set("repliedAt", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <textarea
                className={cn(InputCls, "resize-none")}
                rows={3}
                placeholder="Talked about X, Y, Z. Sent resume."
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-sm font-bold bg-[#2dd4bf] text-teal-950 rounded-xl hover:bg-[#26c0ac] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving…" : editingOutreach ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
