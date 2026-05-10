// ─── Placement Tracker Types ────────────────────────────────────────────────

export const PLACEMENT_STATUSES = [
  "Applied",
  "OA Received",
  "OA Completed",
  "Shortlisted",
  "Interview Scheduled",
  "Round 1",
  "Round 2",
  "HR Round",
  "Offer Received",
  "Rejected",
  "Ghosted",
  "Selected",
] as const;

export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number];

export const APPLICATION_TYPES = ["ON_CAMPUS", "OFF_CAMPUS"] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];

export const INTERNSHIP_TYPES = ["INTERNSHIP", "FULL_TIME"] as const;
export type InternshipType = (typeof INTERNSHIP_TYPES)[number];

export interface PlacementStatusUpdate {
  id: string;
  applicationId: string;
  status: string;
  date: string;
  notes?: string | null;
  link?: string | null;
  createdAt: string;
}

export interface PlacementReminder {
  id: string;
  userId: string;
  applicationId?: string | null;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  application?: { companyName: string; role: string } | null;
}

export interface PlacementApplication {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  type: ApplicationType;
  internshipOrFullTime: InternshipType;
  packageOrStipend?: number | null;
  location?: string | null;
  jobLink?: string | null;
  applicationDate: string;
  deadlineDate?: string | null;
  placementDriveName?: string | null;
  eligibilityCriteria?: string | null;
  cgpaRequirement?: number | null;
  referralTaken: boolean;
  referralPersonName?: string | null;
  referralPersonLinkedIn?: string | null;
  referralSource?: string | null;
  emailUsed?: string | null;
  currentStatus: string;
  resumeVersion?: string | null;
  coverLetterUsed: boolean;
  skillsRequired: string[];
  interviewExperience?: string | null;
  hrContact?: string | null;
  salaryOffered?: number | null;
  offerDeadline?: string | null;
  joiningDate?: string | null;
  notes?: string | null;
  tags: string[];
  resumeUrl?: string | null;
  statusHistory: PlacementStatusUpdate[];
  reminders: PlacementReminder[];
  createdAt: string;
  updatedAt: string;
}

// ─── Form types ──────────────────────────────────────────────────────────────
export type PlacementApplicationFormData = {
  companyName: string;
  role: string;
  type: ApplicationType;
  internshipOrFullTime: InternshipType;
  packageOrStipend?: number | null;
  location?: string;
  jobLink?: string;
  applicationDate: string;
  deadlineDate?: string;
  placementDriveName?: string;
  eligibilityCriteria?: string;
  cgpaRequirement?: number | null;
  referralTaken: boolean;
  referralPersonName?: string;
  referralPersonLinkedIn?: string;
  referralSource?: string;
  emailUsed?: string;
  currentStatus: string;
  resumeVersion?: string;
  coverLetterUsed: boolean;
  skillsRequired: string[];
  interviewExperience?: string;
  hrContact?: string;
  notes?: string;
  tags: string[];
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface PlacementAnalytics {
  totalApplications: number;
  applicationsThisMonth: number;
  pendingApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  rejectedApplications: number;
  selectedCount: number;
  referralApplications: number;
  onCampusApplications: number;
  offCampusApplications: number;
  statusDistribution: { status: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  topRoles: { role: string; count: number }[];
  campusSplit: { name: string; value: number }[];
}

// ─── Filter & Sort ────────────────────────────────────────────────────────────
export type SortOption = "latest" | "oldest" | "package_high" | "package_low" | "company_az";

export interface PlacementFilters {
  search: string;
  status: string;
  type: string;
  referral: string;
  sort: SortOption;
}

// ─── Status color map ─────────────────────────────────────────────────────────
export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Applied:              { bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-300",   dot: "bg-blue-500" },
  "OA Received":        { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "OA Completed":       { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  Shortlisted:          { bg: "bg-cyan-100 dark:bg-cyan-900/30",    text: "text-cyan-700 dark:text-cyan-300",   dot: "bg-cyan-500" },
  "Interview Scheduled":{ bg: "bg-sky-100 dark:bg-sky-900/30",     text: "text-sky-700 dark:text-sky-300",     dot: "bg-sky-500" },
  "Round 1":            { bg: "bg-indigo-100 dark:bg-indigo-900/30",text: "text-indigo-700 dark:text-indigo-300",dot: "bg-indigo-500" },
  "Round 2":            { bg: "bg-indigo-100 dark:bg-indigo-900/30",text: "text-indigo-700 dark:text-indigo-300",dot: "bg-indigo-500" },
  "HR Round":           { bg: "bg-orange-100 dark:bg-orange-900/30",text: "text-orange-700 dark:text-orange-300",dot: "bg-orange-500" },
  "Offer Received":     { bg: "bg-emerald-100 dark:bg-emerald-900/30",text: "text-emerald-700 dark:text-emerald-300",dot: "bg-emerald-500" },
  Rejected:             { bg: "bg-red-100 dark:bg-red-900/30",     text: "text-red-700 dark:text-red-300",     dot: "bg-red-500" },
  Ghosted:              { bg: "bg-slate-100 dark:bg-slate-700/50", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  Selected:             { bg: "bg-teal-100 dark:bg-teal-900/30",   text: "text-teal-700 dark:text-teal-300",  dot: "bg-teal-500" },
};

export const PENDING_STATUSES = [
  "Applied", "OA Received", "OA Completed", "Shortlisted",
  "Interview Scheduled", "Round 1", "Round 2", "HR Round",
];
