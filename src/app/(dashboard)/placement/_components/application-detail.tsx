"use client";

import { PlacementApplication } from "@/types/placement";
import { StatusBadge } from "./status-badge";
import { formatPackage } from "./format-package";
import {
  X, ExternalLink, Building2, MapPin, Package, CalendarDays,
  Users, GraduationCap, Globe, Mail, FileText, Tag, Clock,
  MessageSquare, Phone
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ApplicationDetailProps {
  app: PlacementApplication;
  onClose: () => void;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-slate-400">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{String(value)}</p>
      </div>
    </div>
  );
}

export function ApplicationDetail({ app, onClose }: ApplicationDetailProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b254b]/10 to-[#2dd4bf]/20 dark:from-[#2dd4bf]/10 dark:to-[#1b254b]/40 flex items-center justify-center text-[17px] font-black text-[#1b254b] dark:text-[#2dd4bf]">
                {app.companyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{app.companyName}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{app.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <StatusBadge status={app.currentStatus} />
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              app.type === "ON_CAMPUS"
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            )}>
              {app.type === "ON_CAMPUS" ? <GraduationCap className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
              {app.type === "ON_CAMPUS" ? "On-Campus" : "Off-Campus"}
            </span>
            <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-medium">
              {app.internshipOrFullTime === "INTERNSHIP" ? "Internship" : "Full Time"}
            </span>
            {app.referralTaken && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300">
                <Users className="w-3 h-3" /> Referral
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">

          {/* Quick stats */}
          {app.packageOrStipend && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide mb-0.5">
                {app.internshipOrFullTime === "INTERNSHIP" ? "Stipend" : "Package"}
              </p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {formatPackage(app.packageOrStipend, app.internshipOrFullTime, "long")}
              </p>
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Basic Details</h3>
            <div className="space-y-3">
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={app.location} />
              <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Applied On" value={format(new Date(app.applicationDate), "dd MMM yyyy")} />
              {app.deadlineDate && (
                <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Deadline" value={format(new Date(app.deadlineDate), "dd MMM yyyy")} />
              )}
              <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email Used" value={app.emailUsed} />
              <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label="Resume Version" value={app.resumeVersion} />
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="HR Contact" value={app.hrContact} />
            </div>
          </div>

          {/* Job link */}
          {app.jobLink && (
            <a
              href={app.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#2dd4bf] hover:underline font-medium"
            >
              <ExternalLink className="w-4 h-4" /> View Job Posting
            </a>
          )}

          {/* On-Campus extra */}
          {app.type === "ON_CAMPUS" && (app.placementDriveName || app.eligibilityCriteria) && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">On-Campus Details</h3>
              <div className="space-y-3">
                <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Drive Name" value={app.placementDriveName} />
                <InfoRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Eligibility" value={app.eligibilityCriteria} />
                {app.cgpaRequirement && (
                  <InfoRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="CGPA Required" value={`${app.cgpaRequirement}+`} />
                )}
              </div>
            </div>
          )}

          {/* Referral */}
          {app.referralTaken && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Referral Details</h3>
              <div className="space-y-3">
                <InfoRow icon={<Users className="w-3.5 h-3.5" />} label="Referred By" value={app.referralPersonName} />
                <InfoRow icon={<ExternalLink className="w-3.5 h-3.5" />} label="LinkedIn" value={app.referralPersonLinkedIn} />
                <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Source" value={app.referralSource} />
              </div>
            </div>
          )}

          {/* Skills */}
          {app.skillsRequired.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-1.5">
                {app.skillsRequired.map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-[#1b254b]/8 dark:bg-white/10 text-[#1b254b] dark:text-slate-300 border border-[#1b254b]/10 dark:border-white/10 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {app.notes && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notes</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                {app.notes}
              </p>
            </div>
          )}

          {/* Interview Experience */}
          {app.interviewExperience && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Interview Experience</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
                {app.interviewExperience}
              </p>
            </div>
          )}

          {/* Tags */}
          {app.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {app.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 text-teal-700 dark:text-teal-300 border border-[#2dd4bf]/20 font-medium">
                    <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {app.statusHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Status History</h3>
              <div className="space-y-2 relative ml-2">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                {app.statusHistory.map((sh) => (
                  <div key={sh.id} className="relative pl-5">
                    <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#2dd4bf] border-2 border-white dark:border-slate-900" />
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={sh.status} size="sm" />
                          <span className="text-[11px] text-slate-400">
                            {format(new Date(sh.date), "dd MMM yyyy")}
                          </span>
                        </div>
                        {sh.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sh.notes}</p>
                        )}
                        {sh.link && (
                          <a href={sh.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2dd4bf] hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" /> Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
