"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { PLACEMENT_STATUSES } from "@/types/placement";
import type { PlacementApplication, PlacementApplicationFormData } from "@/types/placement";
import { formatPackage, packageLabel, packagePlaceholder } from "./format-package";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  editingApp?: PlacementApplication | null;
  onSaved: (app: PlacementApplication) => void;
}

const defaultForm = (): PlacementApplicationFormData => ({
  companyName: "",
  role: "",
  type: "OFF_CAMPUS",
  internshipOrFullTime: "FULL_TIME",
  packageOrStipend: null,
  location: "",
  jobLink: "",
  applicationDate: new Date().toISOString().split("T")[0],
  deadlineDate: "",
  placementDriveName: "",
  eligibilityCriteria: "",
  cgpaRequirement: null,
  referralTaken: false,
  referralPersonName: "",
  referralPersonLinkedIn: "",
  referralSource: "",
  emailUsed: "",
  currentStatus: "Applied",
  resumeVersion: "",
  coverLetterUsed: false,
  skillsRequired: [],
  interviewExperience: "",
  hrContact: "",
  notes: "",
  tags: [],
});

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
    {children}
  </label>
);

const InputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf] transition-all placeholder-slate-400";

export function ApplicationModal({ open, onClose, editingApp, onSaved }: ApplicationModalProps) {
  const [form, setForm] = useState<PlacementApplicationFormData>(defaultForm());
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState<"basic" | "referral" | "extra">("basic");

  useEffect(() => {
    if (editingApp) {
      setForm({
        companyName: editingApp.companyName,
        role: editingApp.role,
        type: editingApp.type,
        internshipOrFullTime: editingApp.internshipOrFullTime,
        packageOrStipend: editingApp.packageOrStipend ?? null,
        location: editingApp.location ?? "",
        jobLink: editingApp.jobLink ?? "",
        applicationDate: editingApp.applicationDate.split("T")[0],
        deadlineDate: editingApp.deadlineDate?.split("T")[0] ?? "",
        placementDriveName: editingApp.placementDriveName ?? "",
        eligibilityCriteria: editingApp.eligibilityCriteria ?? "",
        cgpaRequirement: editingApp.cgpaRequirement ?? null,
        referralTaken: editingApp.referralTaken,
        referralPersonName: editingApp.referralPersonName ?? "",
        referralPersonLinkedIn: editingApp.referralPersonLinkedIn ?? "",
        referralSource: editingApp.referralSource ?? "",
        emailUsed: editingApp.emailUsed ?? "",
        currentStatus: editingApp.currentStatus,
        resumeVersion: editingApp.resumeVersion ?? "",
        coverLetterUsed: editingApp.coverLetterUsed,
        skillsRequired: editingApp.skillsRequired ?? [],
        interviewExperience: editingApp.interviewExperience ?? "",
        hrContact: editingApp.hrContact ?? "",
        notes: editingApp.notes ?? "",
        tags: editingApp.tags ?? [],
      });
    } else {
      setForm(defaultForm());
    }
    setActiveSection("basic");
  }, [editingApp, open]);

  const set = (k: keyof PlacementApplicationFormData, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skillsRequired.includes(s)) set("skillsRequired", [...form.skillsRequired, s]);
    setSkillInput("");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!form.companyName || !form.role) {
      toast.error("Company name and role are required");
      return;
    }
    setLoading(true);
    try {
      const url = editingApp ? `/api/placement/${editingApp.id}` : "/api/placement";
      const method = editingApp ? "PATCH" : "POST";
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
      toast.success(editingApp ? "Application updated!" : "Application added! 🎉");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const SECTIONS = [
    { id: "basic" as const, label: "Basic" },
    { id: "referral" as const, label: "Referral" },
    { id: "extra" as const, label: "Extra" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editingApp ? "Edit Application" : "Add Application"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Track your placement journey</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section tabs */}
          <div className="flex gap-1 px-6 pt-3 shrink-0">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                  activeSection === s.id
                    ? "bg-[#1b254b] text-white"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Body (scrollable) */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

            {/* ── BASIC SECTION ── */}
            {activeSection === "basic" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Company *</Label>
                    <input className={InputCls} placeholder="Google, Amazon…" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <input list="role-suggestions" className={InputCls} placeholder="SDE Intern, Full Stack…" value={form.role} onChange={(e) => set("role", e.target.value)} />
                    <datalist id="role-suggestions">
                      <option value="SDE" />
                      <option value="SDE Intern" />
                      <option value="SWE" />
                      <option value="SWE Intern" />
                      <option value="Full Stack Developer" />
                      <option value="Frontend Developer" />
                      <option value="Backend Developer" />
                      <option value="Data Analyst" />
                      <option value="Data Scientist" />
                      <option value="Product Manager" />
                      <option value="Business Analyst" />
                      <option value="DevOps Engineer" />
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <select className={InputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                      <option value="OFF_CAMPUS">Off-Campus</option>
                      <option value="ON_CAMPUS">On-Campus</option>
                    </select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select className={InputCls} value={form.internshipOrFullTime} onChange={(e) => set("internshipOrFullTime", e.target.value)}>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Status</Label>
                    <select className={InputCls} value={form.currentStatus} onChange={(e) => set("currentStatus", e.target.value)}>
                      {PLACEMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>{packageLabel(form.internshipOrFullTime)}</Label>
                    <input
                      className={InputCls}
                      type="number"
                      min={0}
                      placeholder={packagePlaceholder(form.internshipOrFullTime)}
                      value={form.packageOrStipend ?? ""}
                      onChange={(e) => set("packageOrStipend", e.target.value ? parseFloat(e.target.value) : null)}
                    />
                    {/* Live preview */}
                    {form.packageOrStipend != null && form.packageOrStipend > 0 && (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        → {formatPackage(form.packageOrStipend, form.internshipOrFullTime, "long")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <input className={InputCls} placeholder="Bangalore, Remote…" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
                </div>

                <div>
                  <Label>Job Link</Label>
                  <input className={InputCls} type="url" placeholder="https://…" value={form.jobLink ?? ""} onChange={(e) => set("jobLink", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Application Date</Label>
                    <input className={InputCls} type="date" value={form.applicationDate} onChange={(e) => set("applicationDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <input className={InputCls} type="date" value={form.deadlineDate ?? ""} onChange={(e) => set("deadlineDate", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Email Used</Label>
                  <input className={InputCls} type="email" placeholder="your@email.com" value={form.emailUsed ?? ""} onChange={(e) => set("emailUsed", e.target.value)} />
                </div>

                {form.type === "ON_CAMPUS" && (
                  <>
                    <div>
                      <Label>Placement Drive Name</Label>
                      <input className={InputCls} placeholder="Campus Placement 2025…" value={form.placementDriveName ?? ""} onChange={(e) => set("placementDriveName", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Eligibility Criteria</Label>
                        <input list="eligibility-suggestions" className={InputCls} placeholder="No backlogs, etc." value={form.eligibilityCriteria ?? ""} onChange={(e) => set("eligibilityCriteria", e.target.value)} />
                        <datalist id="eligibility-suggestions">
                          <option value="B.Tech CSE/IT" />
                          <option value="All Branches" />
                          <option value="No active backlogs" />
                          <option value="No current/past backlogs" />
                          <option value=">= 7.0 CGPA" />
                          <option value=">= 8.0 CGPA" />
                          <option value="Female Candidates Only" />
                        </datalist>
                      </div>
                      <div>
                        <Label>Min CGPA</Label>
                        <input className={InputCls} type="number" step={0.01} min={0} max={10} placeholder="7.5" value={form.cgpaRequirement ?? ""} onChange={(e) => set("cgpaRequirement", e.target.value ? parseFloat(e.target.value) : null)} />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── REFERRAL SECTION ── */}
            {activeSection === "referral" && (
              <>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("referralTaken", !form.referralTaken)}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors",
                      form.referralTaken ? "bg-[#2dd4bf]" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                      form.referralTaken && "translate-x-4"
                    )} />
                  </button>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Referral taken</span>
                </div>

                {form.referralTaken && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <Label>Referred By</Label>
                      <input className={InputCls} placeholder="John Doe" value={form.referralPersonName ?? ""} onChange={(e) => set("referralPersonName", e.target.value)} />
                    </div>
                    <div>
                      <Label>LinkedIn Profile</Label>
                      <input className={InputCls} type="url" placeholder="https://linkedin.com/in/…" value={form.referralPersonLinkedIn ?? ""} onChange={(e) => set("referralPersonLinkedIn", e.target.value)} />
                    </div>
                    <div>
                      <Label>Source</Label>
                      <input className={InputCls} placeholder="LinkedIn, College Alumni, Friend…" value={form.referralSource ?? ""} onChange={(e) => set("referralSource", e.target.value)} />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── EXTRA SECTION ── */}
            {activeSection === "extra" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Resume Version</Label>
                    <input className={InputCls} placeholder="v3, ATS-Optimised…" value={form.resumeVersion ?? ""} onChange={(e) => set("resumeVersion", e.target.value)} />
                  </div>
                  <div>
                    <Label>HR Contact</Label>
                    <input className={InputCls} placeholder="hr@company.com" value={form.hrContact ?? ""} onChange={(e) => set("hrContact", e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("coverLetterUsed", !form.coverLetterUsed)}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors shrink-0",
                      form.coverLetterUsed ? "bg-[#2dd4bf]" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform", form.coverLetterUsed && "translate-x-4")} />
                  </button>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cover letter used</span>
                </div>

                {/* Skills */}
                <div>
                  <Label>Skills Required</Label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className={cn(InputCls, "flex-1")}
                      placeholder="React, TypeScript…"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <button onClick={addSkill} className="px-3 py-2 rounded-xl bg-[#1b254b] text-white text-sm hover:bg-[#243060] transition-colors shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skillsRequired.map((skill) => (
                      <span key={skill} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#1b254b]/8 dark:bg-white/10 text-[#1b254b] dark:text-slate-300 border border-[#1b254b]/10 dark:border-white/10 font-medium">
                        {skill}
                        <button onClick={() => set("skillsRequired", form.skillsRequired.filter((s) => s !== skill))}>
                          <Minus className="w-2.5 h-2.5 text-slate-400 hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className={cn(InputCls, "flex-1")}
                      placeholder="dream-company, startup…"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <button onClick={addTag} className="px-3 py-2 rounded-xl bg-[#2dd4bf] text-white text-sm hover:bg-[#26c0ac] transition-colors shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 text-teal-700 dark:text-teal-300 border border-[#2dd4bf]/20 font-medium">
                        {tag}
                        <button onClick={() => set("tags", form.tags.filter((t) => t !== tag))}>
                          <Minus className="w-2.5 h-2.5 text-slate-400 hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label>Notes</Label>
                  <textarea
                    className={cn(InputCls, "resize-none")}
                    rows={3}
                    placeholder="Any notes about this application…"
                    value={form.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>

                {/* Interview Experience */}
                <div>
                  <Label>Interview Experience</Label>
                  <textarea
                    className={cn(InputCls, "resize-none")}
                    rows={4}
                    placeholder="Describe rounds, questions asked, difficulty…"
                    value={form.interviewExperience ?? ""}
                    onChange={(e) => set("interviewExperience", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {activeSection !== "extra" && (
                <button
                  onClick={() => setActiveSection(activeSection === "basic" ? "referral" : "extra")}
                  className="px-4 py-2 text-sm font-semibold text-[#1b254b] dark:text-[#2dd4bf] border border-[#1b254b]/20 dark:border-[#2dd4bf]/30 rounded-xl hover:bg-[#1b254b]/5 dark:hover:bg-[#2dd4bf]/10 transition-all"
                >
                  Next →
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-[#1b254b] to-[#243060] text-white rounded-xl hover:from-[#243060] hover:to-[#2b365d] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving…" : editingApp ? "Save Changes" : "Add Application"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
