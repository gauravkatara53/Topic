"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Map, Database, LayoutTemplate, BriefcaseBusiness, ListTodo, CheckCircle2, Sparkles, Clock, CalendarDays, Circle, FileText, Save, Palette, ChevronDown, ChevronRight, Users, ArrowRight, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleQuestionCompletion, updateQuestionRevision, updateRevisionStatus, updateFollowedSheetTheme, toggleQuestionStar, updateQuestionHighlight, togglePopularSheetFollow, updateQuestionNote } from "@/actions/dsa-sheets";
import { toast } from "sonner";
import { createCustomSheet } from "@/actions/custom-sheets";
import { BulkImportModal } from "./bulk-import-modal";
import { AdminPopularSheetModal } from "./admin-popular-sheet-modal";
import { QuestionDrawer } from "./question-drawer";
import { RevisionPicker } from "./revision-picker";
import { CodingPortfolio } from "./coding-portfolio";
import { PlatformsView } from "./platforms-view";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TABS = [
  "Company Wise", "All", "Popular", "My Sheets", "Revisions", "My Stats"
];

const SHEET_THEMES: Record<string, { bg: string, progressBg: string, progressFill: string, text: string, hover: string, border: string }> = {
  default: { bg: "bg-white dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", progressBg: "bg-[#f0fdfa] dark:bg-slate-900", progressFill: "bg-[#2dd4bf]", text: "text-[#1e293b] dark:text-white", hover: "hover:border-[#2dd4bf] dark:hover:border-[#2dd4bf]" },
  rose: {
    bg: "bg-rose-900/20",
    border: "border-rose-500",
    progressBg: "bg-rose-800/40",
    progressFill: "bg-rose-500",
    text: "text-rose-100",
    hover: "hover:border-rose-400"
  },
  amber: {
    bg: "bg-amber-900/20",
    border: "border-amber-500",
    progressBg: "bg-amber-800/40",
    progressFill: "bg-amber-500",
    text: "text-amber-100",
    hover: "hover:border-amber-400"
  },
  emerald: {
    bg: "bg-emerald-900/20",
    border: "border-emerald-500",
    progressBg: "bg-emerald-800/40",
    progressFill: "bg-emerald-500",
    text: "text-emerald-100",
    hover: "hover:border-emerald-400"
  },
  indigo: {
    bg: "bg-indigo-900/20",
    border: "border-indigo-500",
    progressBg: "bg-indigo-800/40",
    progressFill: "bg-indigo-500",
    text: "text-indigo-100",
    hover: "hover:border-indigo-400"
  },
  purple: {
    bg: "bg-purple-900/20",
    border: "border-purple-500",
    progressBg: "bg-purple-800/40",
    progressFill: "bg-purple-500",
    text: "text-purple-100",
    hover: "hover:border-purple-400"
  }

};

const THEME_OPTIONS = [
  { id: "default", bg: "bg-slate-200" },
  { id: "rose", bg: "bg-rose-500" },
  { id: "amber", bg: "bg-amber-500" },
  { id: "emerald", bg: "bg-emerald-500" },
  { id: "indigo", bg: "bg-indigo-500" },
  { id: "purple", bg: "bg-purple-500" },
];

const COMPANIES = [
  {
    id: "google",
    name: "Google",
    desc: "Get interview-ready for Google with this dedicated sheet of DSA problems.",
  },
  {
    id: "amazon",
    name: "Amazon",
    desc: "Focused on Amazon's interview style, this sheet compiles real DSA questions.",
  },
  {
    id: "meta",
    name: "Meta",
    desc: "Target Meta interviews smartly with this handpicked list of DSA problems.",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    desc: "Boost your Microsoft interview prep with this hand-selected list of DSA problems.",
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    desc: "Crack Bloomberg's challenging interviews with this collection of common problems.",
  },
  {
    id: "apple",
    name: "Apple",
    desc: "Strengthen your coding prep with Apple-specific DSA questions sourced directly.",
  },
];

const CircularProgress = ({ percentage, size = 120, strokeWidth = 10 }: { percentage: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="text-[#2dd4bf] transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-800 leading-none">{Math.round(percentage)}%</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Done</span>
      </div>
    </div>
  );
};

const SheetCard = ({
  company,
  followed,
  solvedCount,
  totalQuestions,
  progress,
  onPaletteClick
}: {
  company: any,
  followed?: any,
  solvedCount: number,
  totalQuestions: number,
  progress: number,
  onPaletteClick: (val: { id: string, name: string }) => void
}) => {
  const curThemeName = followed?.theme || "default";
  const currentTheme = SHEET_THEMES[curThemeName] || SHEET_THEMES.default;

  return (
    <div className="relative group">
      <Link
        href={`/dsa-sheets/${company.company}`}
        className={cn(
          "rounded-[24px] border hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden shadow-sm bg-clip-padding",
          currentTheme.bg,
          currentTheme.border,
          currentTheme.hover
        )}
      >
        {/* Top Progress Bar */}
        <div className={cn("w-full h-8 flex items-center justify-between relative px-4 border-b border-black/5 dark:border-white/5", currentTheme.progressBg)}>
          <div
            className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-out", currentTheme.progressFill)}
            style={{ width: `${progress}%` }}
          />
          <span className="relative z-10 text-[11.5px] font-[800] tracking-wide ml-auto select-none dark:text-white">
            {Math.round(progress)}%
          </span>
        </div>

        <div className={cn("p-5 flex flex-col flex-1", currentTheme.bg)}>
          <div className="flex items-start justify-between mb-2 mt-1">
            <h3 className={cn("text-[17px] font-bold capitalize leading-tight", currentTheme.text)}>
              {company.company} Sheet
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                onPaletteClick({ id: company.company, name: company.company });
              }}
              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
            >
              <Palette className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <p className="text-[13px] text-slate-500 line-clamp-2 flex-1 mb-8 font-medium">
            The DSA sheet by {company.company} is manually designed to cover almost every concept in Data Structures and Algorithms.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-black/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ListTodo className="w-3.5 h-3.5" /> <span className="text-[12px] font-bold">{totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" /> <span className="text-[12px] font-bold">{solvedCount} solved</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const HistoricalActivityGrid = ({ 
  historyStats = {}, 
  totalSolved = 0, 
  totalRevised = 0, 
  currentStreak = 0, 
  maxStreak = 0 
}: { 
  historyStats?: Record<string, { solved: number, revised: number, total: number }>,
  totalSolved?: number,
  totalRevised?: number,
  currentStreak?: number,
  maxStreak?: number
}) => {
  const [hoveredData, setHoveredData] = useState<{ date: Date, solved: number, revised: number } | null>(null);
  const now = new Date();
  const daysToShow = 365; // FULL YEAR
  const dates = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    dates.push(d);
  }

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  dates.forEach(date => {
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-700/40";
    if (count <= 2) return "bg-teal-50 dark:bg-teal-900/40";
    if (count <= 5) return "bg-teal-200 dark:bg-teal-800/60";
    if (count <= 10) return "bg-teal-400 dark:bg-teal-600/80";
    return "bg-teal-600 dark:bg-teal-400/90";
  };

  const monthLabels: { label: string, index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: week[0].toLocaleDateString('en-US', { month: 'short' }), index: i });
      lastMonth = month;
    }
  });

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-y-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Solved</span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{totalSolved}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Revised</span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{totalRevised}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Max Streak</span>
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{maxStreak} <span className="text-[10px] text-slate-400">Days</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Streak</span>
            <span className="text-xl font-black text-teal-500 leading-none">{currentStreak} <span className="text-[10px] text-teal-500/60">Days</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {hoveredData ? (
             <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl animate-in fade-in slide-in-from-right-2 duration-300">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{hoveredData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Solved: {hoveredData.solved}</span>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Revised: {hoveredData.revised}</span>
                </div>
             </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-400">
              Hover for detail • Last 365 Days
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-1.5 select-none">
        <div className="flex gap-1.5 text-[10px] font-black text-slate-400 h-4 relative mb-1">
          {monthLabels.map(m => (
            <span key={m.label + m.index} className="absolute overflow-hidden whitespace-nowrap uppercase tracking-tighter" style={{ left: `${m.index * 19.5}px` }}>{m.label}</span>
          ))}
        </div>
        <div className="flex gap-[5.5px] overflow-x-auto pb-4 scrollbar-none justify-between">
          <div className="flex flex-col gap-[5.5px] pr-2 border-r border-slate-100 dark:border-slate-800 mr-1 text-[8px] font-black text-slate-300 uppercase py-1 text-center">
            <span>M</span><span className="mt-[7px]">W</span><span className="mt-[8px]">F</span>
          </div>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[5.5px] shrink-0">
              {wIdx === 0 && Array.from({ length: week[0].getDay() }).map((_, i) => (
                <div key={`p-${i}`} className="w-3.5 h-3.5 bg-transparent" />
              ))}
              {week.map((date, dIdx) => {
                const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                const dayData = (historyStats as Record<string, { solved: number, revised: number, total: number }>)[key] || { solved: 0, revised: 0, total: 0 };
                const count = dayData.total;
                
                return (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredData({ date, solved: dayData.solved, revised: dayData.revised })}
                    onMouseLeave={() => setHoveredData(null)}
                    className={cn(
                      "w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-150 relative group cursor-pointer hover:z-[110] outline-none border border-black/[0.03] dark:border-white/[0.05]",
                      getColor(count),
                      hoveredData?.date.getTime() === date.getTime() && "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-800 scale-125 z-[110]"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 self-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Less</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-[2.5px] bg-slate-100 dark:bg-slate-700/40 border border-black/[0.03] dark:border-white/[0.05]" />
            <div className="w-3 h-3 rounded-[2.5px] bg-teal-50 dark:bg-teal-900/40 border border-black/[0.03] dark:border-white/[0.05]" />
            <div className="w-3 h-3 rounded-[2.5px] bg-teal-200 dark:bg-teal-800/60 border border-black/[0.03] dark:border-white/[0.05]" />
            <div className="w-3 h-3 rounded-[2.5px] bg-teal-400 dark:bg-teal-600/80 border border-black/[0.03] dark:border-white/[0.05]" />
            <div className="w-3 h-3 rounded-[2.5px] bg-teal-600 dark:bg-teal-400/90 border border-black/[0.03] dark:border-white/[0.05]" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">More</span>
        </div>
      </div>
    </div>
  );
};

export function DSASheetsClient({
  dbCompanies = [],
  followedSheets = [],
  userId,
  completedData = {},
  revisionsData = [],
  initialCompletedIds = [],
  statsData = { totalCompleted: 0, completedToday: 0, completedRevisions: 0 },
  starredData = [],
  popularSheets = [],
  followedPopularIds = [],
  userCustomSheets = [],
  userPortfolio = null,
  initialNotes = [],
  initialTab = "Company Wise",
  isAdmin = false
}: {
  dbCompanies?: any[],
  followedSheets?: any[],
  userId?: string | null,
  completedData?: Record<string, number>,
  revisionsData?: any[],
  initialCompletedIds?: string[],
  statsData?: { 
    totalCompleted: number, 
    completedToday: number, 
    completedRevisions: number,
    dailyStats?: { date: string, completed: number, revised: number }[],
    historyStats?: Record<string, { solved: number, revised: number, total: number }>,
    totalSolvedAllTime?: number,
    totalRevisedAllTime?: number,
    currentStreak?: number,
    maxStreak?: number
  },
  starredData?: any[],
  popularSheets?: any[],
  followedPopularIds?: string[],
  userCustomSheets?: any[],
  userPortfolio?: any,
  initialNotes?: any[],
  initialTab?: string,
  isAdmin?: boolean
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = initialTab || "Company Wise";
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompletedIds || []));
  const [starred, setStarred] = useState<Set<string>>(new Set((starredData || []).map((s: any) => s.questionId)));
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const [followedPopular, setFollowedPopular] = useState<Set<string>>(new Set(followedPopularIds || []));
  const [paletteOpen, setPaletteOpen] = useState<string | null>(null);
  const [revisionModalOpen, setRevisionModalOpen] = useState<{ id: string, title: string, companyId: string } | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<{ id: string, data: any } | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    (initialNotes || []).forEach((note: any) => { acc[note.questionId] = note.content; });
    return acc;
  });

  const handleSaveNote = async (content: string) => {
    if (!selectedQuestion) return;
    const qid = selectedQuestion.id;
    setLocalNotes(prev => ({ ...prev, [qid]: content }));
    try {
      await updateQuestionNote(qid, content);
      toast.success("Note saved!");
    } catch (error) {
      toast.error("Failed to save note.");
    }
  };

  const onTogglePopularFollow = async (sheetId: string) => {
    if (!userId) {
      toast.error("Please sign in to follow sheets");
      return;
    }
    const newFollowed = new Set(followedPopular);
    if (newFollowed.has(sheetId)) {
      newFollowed.delete(sheetId);
      toast.success("Removed from My Sheets");
    } else {
      newFollowed.add(sheetId);
      toast.success("Added to My Sheets");
    }
    setFollowedPopular(newFollowed);
    await togglePopularSheetFollow(sheetId);
  };

  const [customSheets, setCustomSheets] = useState(userCustomSheets || []);

  const handleCreateSheet = async () => {
    if (!userId) {
      toast.error("Sign in to create sheets");
      return;
    }
    try {
      const name = `Untitled Sheet - ${customSheets.length + 1}`;
      const newSheet = await createCustomSheet(name);
      setCustomSheets([newSheet as any, ...customSheets]);
      router.push(`/dsa-sheets/custom/${newSheet.id}`);
      toast.success("Sheet created!");
    } catch (error) {
      toast.error("Failed to create sheet");
    }
  };

  const HIGHLIGHT_THEMES: Record<string, string> = {
    default: "",
    yellow: "bg-yellow-100/80 border-yellow-200",
    blue: "bg-blue-100/80 border-blue-200",
    rose: "bg-rose-100/80 border-rose-200",
    emerald: "bg-emerald-100/80 border-emerald-200",
    purple: "bg-purple-100/80 border-purple-200",
  };

  const toggleStar = async (qId: string, companyId: string) => {
    const isNowStarred = !starred.has(qId);
    setStarred(prev => {
      const next = new Set(prev);
      if (isNowStarred) next.add(qId);
      else next.delete(qId);
      return next;
    });

    try {
      await toggleQuestionStar(qId, companyId, isNowStarred);
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const setQuestionHighlight = async (qId: string, companyId: string, theme: string) => {
    setHighlights(prev => ({ ...prev, [qId]: theme }));
    setPaletteOpen(null);
    try {
      await updateQuestionHighlight(qId, companyId, theme);
    } catch (err) {
      toast.error("Failed to save highlight");
    }
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  const [themePopoverOpen, setThemePopoverOpen] = useState<string | null>(null);
  const [localThemes, setLocalThemes] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    (followedSheets || []).forEach(f => {
      acc[f.companyId] = f.colorTheme || "default";
    });
    return acc;
  });

  const changeTheme = async (e: React.MouseEvent, companyId: string, theme: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalThemes(prev => ({ ...prev, [companyId]: theme }));
    setThemePopoverOpen(null);
    try {
      await updateFollowedSheetTheme(companyId, theme);
    } catch (err) {
      toast.error("Failed to update theme");
    }
  };

  const [localRevisions, setLocalRevisions] = useState<Record<string, { lastRevised: string, nextRevision: string, status?: string }>>(() => {
    const acc: Record<string, any> = {};
    (revisionsData || []).forEach(rev => {
      acc[rev.questionId] = {
        lastRevised: rev.lastRevised ? new Date(rev.lastRevised).toISOString().split('T')[0] : "",
        nextRevision: rev.nextRevision ? new Date(rev.nextRevision).toISOString().split('T')[0] : "",
        status: rev.status || 'Pending'
      };
    });
    return acc;
  });

  const changeRevisionStatus = async (qId: string, newStatus: string) => {
    setLocalRevisions(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || { lastRevised: "", nextRevision: "", status: "Pending" }), status: newStatus }
    }));
    try {
      await updateRevisionStatus(qId, newStatus);
      if (newStatus === 'Completed') {
        toast.success("Revision completed for today!");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleRevisionChange = (qId: string, field: 'lastRevised' | 'nextRevision', val: string) => {
    setLocalRevisions(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || { lastRevised: "", nextRevision: "", status: 'Pending' }), [field]: val }
    }));
  };

  const saveRevision = async (qId: string) => {
    if (!userId) {
      alert("Please sign in to save your revision tracking!");
      return;
    }
    const rev = localRevisions[qId];
    if (!rev) return;
    try {
      await updateQuestionRevision(
        qId,
        revisionModalOpen?.companyId || null,
        rev.lastRevised ? new Date(rev.lastRevised) : null,
        rev.nextRevision ? new Date(rev.nextRevision) : null,
        "Pending"
      );
      router.refresh();
      setRevisionModalOpen(null);
    } catch (e) {
      alert("Error saving revision.");
    }
  };

  const toggleCompletion = async (q: any, companyId: string) => {
    if (!userId) {
      alert("Please sign in to track completions permanently!");
      return;
    }
    const isNowDone = !completed.has(q.id);

    setCompleted(prev => {
      const next = new Set(prev);
      if (isNowDone) next.add(q.id);
      else next.delete(q.id);
      return next;
    });

    try {
      await toggleQuestionCompletion(q.id, companyId, isNowDone);
      router.refresh();
    } catch (err) {
      console.error(err);
      setCompleted(prev => {
        const next = new Set(prev);
        if (isNowDone) next.delete(q.id);
        else next.add(q.id);
        return next;
      });
      alert("Failed to save progress to database");
      return;
    }

    if (isNowDone) {
      const today = new Date().toISOString().split("T")[0];
      setLocalRevisions(prev => ({
        ...prev,
        [q.id]: { ...(prev[q.id] || { lastRevised: "", nextRevision: "" }) }
      }));
      setRevisionModalOpen({ id: q.id, title: q.title, companyId });
    }
  };

  const navigateToTab = (tab: string) => {
    const routeMap: Record<string, string> = {
      "Company Wise": "/dsa-sheets",
      "All": "/dsa-sheets/all",
      "My Sheets": "/dsa-sheets/my-sheets",
      "Revisions": "/dsa-sheets/revisions",
      "My Stats": "/dsa-sheets/stats",
      "Popular": "/dsa-sheets/popular",
      "Complete DSA": "/dsa-sheets/complete"
    };
    const route = routeMap[tab] || "/dsa-sheets";
    router.push(route);
  };

  const filteredData = (dbCompanies || []).filter(c => c.company && String(c.company).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black text-[#1b254b] dark:text-white">Track Coding Sheets in One Place</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Practice with exclusive, previously asked interview questions from top tech companies</p>

          <div className="relative mt-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search any coding sheet"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition-all bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Optional mascot/illustration area if needed, we'll skip the owl for now and use a generic gradient ring */}
        <div className="hidden md:flex shrink-0 w-32 h-32 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] rounded-3xl rotate-12 opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-[#1b254b] to-[#2dd4bf] rounded-3xl -rotate-6 opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">💻</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => navigateToTab(tab)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
              activeTab === tab
                ? "bg-gradient-to-r from-[#1b254b] to-[#243060] text-white border-transparent shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">{activeTab} Sheets</h2>
          <span className="text-xs text-[#2dd4bf] font-semibold cursor-pointer hover:underline">(Learn More)</span>
        </div>

        {activeTab === "Company Wise" || activeTab === "All" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredData.map(company => (
              <Link
                href={`/dsa-sheets/${company.company}`}
                key={company.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-[#2dd4bf] hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden"
              >
                {/* Top decorative line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent group-hover:via-[#2dd4bf] transition-all"></div>

                <h3 className="text-lg font-bold text-[#1b254b] dark:text-white mb-2 capitalize">{company.company}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1 line-clamp-2">
                  Master your interviews with this comprehensive collection of {company.count} previously asked questions at {String(company.company).charAt(0).toUpperCase() + String(company.company).slice(1)}.
                </p>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <ListTodo className="w-4 h-4" /> {company.count} Qs
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="relative inline-block">
                      <span className="text-[11px] font-bold text-slate-400 opacity-80">₹2100</span>
                      <span className="absolute left-[-10%] top-1/2 w-[120%] h-[1.5px] bg-rose-500 -rotate-[15deg] origin-center animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 shadow-sm group-hover:bg-emerald-100 group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-bounce" style={{ animationDuration: '2.5s' }} />
                      ₹0 Forever
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {filteredData.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500">
                No sheets found matching your search.
              </div>
            )}
          </div>
        ) : activeTab === "My Sheets" ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Followed Sheets Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#1b254b] dark:text-white">Followed Sheets</h2>
              {!userId ? (
                <div className="py-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-[32px]">
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">Please sign in to view your followed sheets.</p>
                  <Link href="/sign-in" className="inline-block px-8 py-3 bg-[#1b254b] text-white rounded-2xl font-black shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95">Sign In</Link>
                </div>
              ) : (followedSheets.length === 0 && followedPopular.size === 0) ? (
                <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl shadow-sm mb-4">
                    <Star className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold">You haven't followed any sheets yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dbCompanies.filter(c => followedSheets.some(f => f.companyId.toLowerCase() === c.company.toLowerCase())).map(company => {
                    const followed = followedSheets.find(f => f.companyId.toLowerCase() === company.company.toLowerCase());
                    const solvedCount = completedData[company.company.toLowerCase()] || 0;
                    const totalQuestions = company.count;
                    const progress = (solvedCount / totalQuestions) * 100;

                    return (
                      <SheetCard
                        key={company.id}
                        company={company}
                        followed={followed}
                        solvedCount={solvedCount}
                        totalQuestions={totalQuestions}
                        progress={progress}
                        onPaletteClick={(val) => setPaletteOpen(val.id)}
                      />
                    );
                  })}

                  {/* Followed Popular Sheets */}
                  {popularSheets.filter(ps => followedPopular.has(ps.id)).map(sheet => {
                    const totalQuestions = (sheet.questions || []).length;
                    const solvedCount = (sheet.questions || []).filter((sq: any) => sq.question && completed.has(sq.question.id)).length;
                    const progress = totalQuestions > 0 ? (solvedCount / totalQuestions) * 100 : 0;

                    return (
                      <div key={sheet.id} className="relative group">
                        <Link
                          href={`/dsa-sheets/popular/${sheet.slug}`}
                          className="rounded-[24px] border border-slate-200 dark:border-slate-700 hover:border-[#2dd4bf] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden shadow-sm bg-white dark:bg-slate-800"
                        >
                          <div className="w-full h-8 flex items-center justify-between relative px-4 bg-[#f0fdfa] dark:bg-slate-900 border-b border-black/5 dark:border-white/5">
                            <div className="absolute top-0 left-0 h-full bg-[#2dd4bf] transition-all duration-1000" style={{ width: `${progress}%` }} />
                            <span className="relative z-10 text-[11.5px] font-[800] tracking-wide ml-auto dark:text-white">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-800">
                            <h3 className="text-[17px] font-bold text-[#1e293b] dark:text-white capitalize leading-tight mb-2">{sheet.name}</h3>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 flex-1">{sheet.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <ListTodo className="w-3.5 h-3.5" /> <span className="text-[12px] font-bold">{totalQuestions} Questions</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-500">
                                <CheckCircle2 className="w-3.5 h-3.5" /> <span className="text-[12px] font-bold">{solvedCount} Solved</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Sheets Section */}
            <div className="space-y-6 pt-12 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#1b254b] dark:text-white">Custom Sheets</h2>
                  <p className="text-[13px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Your personal collections</p>
                </div>
                <button
                  onClick={handleCreateSheet}
                  className="px-6 py-2.5 bg-[#1b254b] hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-5 h-5 text-[#2dd4bf]" /> Create New Sheet
                </button>
              </div>

              {!userId ? (
                <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 font-bold italic">Sign in to start creating custom sheets</p>
                </div>
              ) : (customSheets || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customSheets.map(sheet => {
                    const total = (sheet.questions || []).length;
                    const solved = (sheet.questions || []).filter((q: any) => q.question && completed.has(q.question.id)).length;
                    const progress = total > 0 ? (solved / total) * 100 : 0;

                    return (
                      <Link
                        key={sheet.id}
                        href={`/dsa-sheets/custom/${sheet.id}`}
                        className="rounded-[24px] border border-slate-200 dark:border-slate-700 hover:border-[#2dd4bf] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden shadow-sm bg-white dark:bg-slate-800"
                      >
                        <div className="w-full h-8 flex items-center justify-between relative px-4 bg-[#f0fdfa] dark:bg-slate-900 border-b border-black/5 dark:border-white/5">
                          <div className="absolute top-0 left-0 h-full bg-[#2dd4bf] transition-all duration-1000" style={{ width: `${progress}%` }} />
                          <span className="relative z-10 text-[10px] font-bold text-transparent select-none">P</span>
                          <span className={cn(
                            "relative z-10 text-[11.5px] font-[800] tracking-wide shrink-0",
                            progress > 90 ? "text-white dark:text-white" : "text-[#1e293b] dark:text-white"
                          )}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-800">
                          <h3 className="text-[17px] font-bold text-[#1e293b] dark:text-white capitalize leading-tight mb-2 group-hover:text-[#2dd4bf] transition-colors">{sheet.name}</h3>
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 flex-1 font-medium">{sheet.description || "Personal collection of DSA problems."}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <ListTodo className="w-3.5 h-3.5" /> <span className="text-[12px] font-bold">{total} Questions</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500">
                              <CheckCircle2 className="w-3.5 h-3.5" /> <span className="text-[12px] font-bold">{solved} Solved</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700 shadow-sm group">
                  <div className="p-6 bg-slate-50 dark:bg-slate-700 rounded-[24px] transition-all group-hover:bg-orange-50 mb-6">
                    <Plus className="w-10 h-10 text-slate-300 group-hover:text-orange-400 group-hover:rotate-90 transition-all duration-500" />
                  </div>
                  <h3 className="text-xl font-black text-[#1b254b] dark:text-white mb-2 tracking-tight">No custom sheets yet</h3>
                  <p className="text-[14px] font-bold text-slate-400 mb-8 max-w-[280px] text-center">Create your own collection of questions to track your personal goals.</p>
                  <button onClick={handleCreateSheet} className="text-orange-600 font-black hover:scale-105 transition-all active:scale-95 flex items-center gap-2 bg-orange-50 px-8 py-3 rounded-2xl border border-orange-100">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Revisions" ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {!revisionsData || revisionsData.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-[16px] border border-slate-200 dark:border-slate-700 border-dashed">
                <Clock className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-[17px] font-bold text-slate-800 dark:text-white">No Revisions Scheduled</h3>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Mark questions "Next Revision" date inside any active sheet to see them populate here chronologically.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {(() => {
                  const sortedRevisions = [...revisionsData].sort((a, b) => new Date(a.nextRevision).getTime() - new Date(b.nextRevision).getTime());
                  const todayStr = new Date().toDateString();
                  const tomorrowStr = new Date(Date.now() + 86400000).toDateString();

                  const dueToday = sortedRevisions.filter(r => new Date(r.nextRevision).toDateString() === todayStr);
                  const dueTomorrow = sortedRevisions.filter(r => new Date(r.nextRevision).toDateString() === tomorrowStr);
                  const upcoming = sortedRevisions.filter(r => new Date(r.nextRevision) > new Date(tomorrowStr) && new Date(r.nextRevision).toDateString() !== tomorrowStr);

                  const renderList = (title: string, icon: any, list: any[], isOverdueHighlight = false, emptyMsg: string) => {
                    return (
                      <div className="bg-white dark:bg-slate-800 rounded-[16px] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 flex items-center justify-between">
                          <h3 className="text-[16px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {icon} {title}
                          </h3>
                          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-600/50 px-2 py-0.5 rounded-full">{list.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                          {list.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-bold bg-white dark:bg-slate-800 italic border-t border-slate-50 dark:border-slate-700">
                              {emptyMsg}
                            </div>
                          ) : list.map((rev, idx) => {
                            const q = rev.question;
                            const dateObj = new Date(rev.nextRevision);
                            const assignedCompany = q.companies?.split(',')[0]?.trim() || 'google';

                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedQuestion({ id: q.id, data: q })}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                              >
                                <div className="flex-1 min-w-0 pr-4 flex items-start gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCompletion(q, assignedCompany);
                                    }}
                                    className="mt-0.5 relative p-1 rounded-full shrink-0 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                                  >
                                    {completed.has(q.id) ? (
                                      <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 fill-emerald-50" />
                                    ) : (
                                      <Circle className="w-[18px] h-[18px]" />
                                    )}
                                  </button>

                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide inline-flex items-center",
                                        (localRevisions[q.id]?.status === 'Completed') ? "bg-emerald-100 text-emerald-700" :
                                          isOverdueHighlight ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"
                                      )}>
                                        {(localRevisions[q.id]?.status === 'Completed') ? "SOLVED TODAY" : isOverdueHighlight ? "DUE TODAY" : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                      {q.difficulty && (
                                        <span className={cn(
                                          "text-[10px] font-bold uppercase",
                                          q.difficulty === "Easy" ? "text-emerald-500" :
                                            q.difficulty === "Medium" ? "text-orange-400" : "text-rose-500"
                                        )}>
                                          {q.difficulty}
                                        </span>
                                      )}
                                    </div>
                                    <a
                                      href={q.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[15px] font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
                                    >
                                      {q.title}
                                    </a>
                                  </div>
                                </div>

                                <div className="mt-4 sm:mt-0 flex shrink-0 items-center justify-end gap-3 pl-9 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={localRevisions[q.id]?.status || 'Pending'}
                                    onChange={(e) => changeRevisionStatus(q.id, e.target.value)}
                                    className={cn(
                                      "text-[10px] font-bold px-2 py-1.5 rounded-md border outline-none cursor-pointer appearance-none transition-colors",
                                      localRevisions[q.id]?.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                                    )}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                  </select>

                                  <div className="flex items-center gap-1.5 flex-wrap relative group mr-2">
                                    {(q.topics || []).slice(0, 2).map((topic: string) => (
                                      <span key={topic} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                                        {topic}
                                      </span>
                                    ))}
                                    {(q.topics || []).length > 2 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded cursor-help">
                                        +{(q.topics || []).length - 2}
                                      </span>
                                    )}

                                    {(q.topics || []).length > 0 && (
                                      <div className="absolute right-0 top-full mt-1 z-[100] hidden group-hover:block w-fit max-w-[200px] text-wrap text-center bg-slate-800 text-white text-[10px] font-medium px-2.5 py-2 rounded-lg shadow-xl">
                                        {q.topics.join(' • ')}
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => setRevisionModalOpen({ id: q.id, title: q.title, companyId: assignedCompany })}
                                    className="text-slate-300 hover:text-[#1b254b] transition-colors p-2"
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {renderList("Due Today", <CalendarDays className="w-5 h-5 text-rose-500" />, dueToday, true, "No questions marked for today")}
                      {renderList("Due Tomorrow", <CalendarDays className="w-5 h-5 text-amber-500" />, dueTomorrow, false, "No questions marked for tomorrow")}
                      {renderList("Upcoming", <CalendarDays className="w-5 h-5 text-indigo-500" />, upcoming, false, "No upcoming revisions scheduled")}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ) : activeTab === "My Stats" ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] font-[600] text-slate-500 dark:text-slate-400">Total Questions Till Now</span>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-[900] text-slate-800 dark:text-white">{statsData?.totalCompleted || 0}</h3>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] font-[600] text-slate-500 dark:text-slate-400">Questions Solved Today</span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-[900] text-slate-800 dark:text-white">{statsData?.completedToday || 0}</h3>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] font-[600] text-slate-500 dark:text-slate-400">Total Revisions</span>
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-[900] text-slate-800 dark:text-white">{statsData?.completedRevisions || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative">
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Activity History</h3>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Your coding consistency over the past year</p>
              </div>
              <HistoricalActivityGrid 
                historyStats={statsData?.historyStats} 
                totalSolved={statsData?.totalSolvedAllTime}
                totalRevised={statsData?.totalRevisedAllTime}
                currentStreak={statsData?.currentStreak}
                maxStreak={statsData?.maxStreak}
              />
            </div>

            {statsData?.dailyStats && statsData.dailyStats.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Daily Activity</h3>
                    <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Your practice & revision trend for the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#2dd4bf]" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Solved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#1b254b] dark:bg-[#38bdf8]" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Revised</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--chart-axis)' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--chart-axis)' }}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                                <div className="space-y-1.5">
                                  {payload.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between gap-8">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.name === 'completed' ? '#2dd4bf' : (entry.name === 'revised' ? (document.documentElement.classList.contains('dark') ? '#38bdf8' : '#1b254b') : entry.color) }} />
                                        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 capitalize">{entry.name}</span>
                                      </div>
                                      <span className="text-[13px] font-black text-slate-800 dark:text-white">{entry.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        name="completed" 
                        dataKey="completed" 
                        fill="var(--chart-solved)" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                      <Bar 
                        name="revised" 
                        dataKey="revised" 
                        fill="var(--chart-revised)" 
                        radius={[4, 4, 0, 0]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />
                </div>
                <h2 className="text-2xl sm:text-[26px] font-[900] text-slate-800 dark:text-white tracking-tight leading-none">
                  Bookmarked Questions
                </h2>
              </div>

              {!starredData || starredData.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-[16px] border border-slate-200 dark:border-slate-700 border-dashed">
                  <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-[17px] font-bold text-slate-800 dark:text-white">No Bookmarks Yet</h3>
                  <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Star questions inside any active matching sheet to see them populate here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-[16px] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {starredData.map((star, idx) => {
                        const q = star.question;
                        const assignedCompany = star.companyId || q.companies?.split(',')[0]?.trim() || 'google';

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedQuestion({ id: q.id, data: q })}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                          >
                            <div className="flex-1 min-w-0 pr-4 flex items-start gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompletion(q, assignedCompany);
                                }}
                                className="mt-0.5 relative p-1 rounded-full shrink-0 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                              >
                                {completed.has(q.id) ? (
                                  <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 fill-emerald-50" />
                                ) : (
                                  <Circle className="w-[18px] h-[18px]" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  {q.difficulty && (
                                    <span className={cn(
                                      "text-[10px] font-bold uppercase",
                                      q.difficulty === "Easy" ? "text-emerald-500" :
                                        q.difficulty === "Medium" ? "text-orange-400" : "text-rose-500"
                                    )}>
                                      {q.difficulty}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide inline-flex items-center bg-amber-100 text-amber-700">
                                    BOOKMARKED
                                  </span>
                                </div>
                                <a
                                  href={q.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[15px] font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
                                >
                                  {q.title}
                                </a>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-0 flex shrink-0 items-center justify-end gap-3 pl-9 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5 flex-wrap relative group mr-2">
                                {(q.topics || []).slice(0, 2).map((topic: string) => (
                                  <span key={topic} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    {topic}
                                  </span>
                                ))}
                                {(q.topics || []).length > 2 && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded cursor-help">
                                    +{(q.topics || []).length - 2}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={`/dsa-sheets/${assignedCompany}`}
                                className="text-[12px] font-bold px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
                              >
                                Sheet
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Popular" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#1b254b] dark:text-white tracking-tight">Popular Sheets</h2>
                <p className="text-sm text-slate-400 font-bold mt-1">Explore structured paths curated by the community</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="flex items-center gap-2.5 px-6 py-3 bg-[#1b254b] hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-[#1b254b]/20 text-[13px] active:scale-95 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Create Popular Sheet
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
              {popularSheets.map(sheet => {
                const totalQuestions = sheet.questions.length;
                const solvedCount = sheet.questions.filter((sq: any) => sq.question && completed.has(sq.question.id || sq.question._id)).length;
                const progress = totalQuestions > 0 ? (solvedCount / totalQuestions) * 100 : 0;

                return (
                  <div key={sheet.id} className="relative group">
                    <Link
                      href={`/dsa-sheets/popular/${sheet.slug}`}
                      className="rounded-[16px] border border-slate-200 dark:border-slate-700 hover:border-[#2dd4bf] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full relative overflow-hidden shadow-sm bg-white dark:bg-slate-800"
                    >
                      {/* Top Progress Bar */}
                      <div className="w-full h-8 flex items-center justify-between relative px-4 bg-[#f0fdfa] dark:bg-slate-900 border-b border-black/5 dark:border-white/5">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#2dd4bf] transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                        <span className="relative z-10 text-[10px] font-bold text-transparent select-none">P</span>
                        <span className={cn(
                          "relative z-10 text-[11.5px] font-[800] tracking-wide shrink-0",
                          progress > 90 ? "text-white dark:text-white" : "text-[#1e293b] dark:text-white"
                        )}>
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-1 bg-white dark:bg-slate-800">
                        <div className="flex items-start justify-between mb-4 mt-1">
                          <h3 className="text-[17px] font-bold text-[#1e293b] dark:text-white capitalize leading-tight">
                            {sheet.name}
                          </h3>
                          <span className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5 shrink-0">
                            <ListTodo className="w-3.5 h-3.5 text-slate-400" /> {Math.floor(totalQuestions * 3.7 + 124)} Followers
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 mb-8 flex-1">
                          {sheet.description || "The DSA sheet curated to cover almost every concept in Data Structures & Algorithms."}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-600">{totalQuestions} questions</span>
                          </div>
                          <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-black uppercase tracking-tight">{solvedCount} solved</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "Portfolio" ? (
          <div className="py-2">
            <CodingPortfolio initialData={userPortfolio} />
          </div>
        ) : (
          <div className="py-2">
            <PlatformsView initialData={userPortfolio} />
          </div>
        )}
      </div>

      {revisionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setRevisionModalOpen(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-slate-800 mb-1 tracking-tight">Revision Dates</h3>
            <p className="text-xs text-slate-500 mb-5 font-medium line-clamp-2">{revisionModalOpen.title}</p>

            <div className="mt-4">
              <RevisionPicker
                lastRevised={localRevisions[revisionModalOpen.id]?.lastRevised || ""}
                nextRevision={localRevisions[revisionModalOpen.id]?.nextRevision || ""}
                onChange={(field, val) => handleRevisionChange(revisionModalOpen.id, field, val)}
              />
            </div>

            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={() => setRevisionModalOpen(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveRevision(revisionModalOpen.id);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1b254b] hover:bg-[#111836] rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#1b254b]/20"
              >
                <Save className="w-3.5 h-3.5" /> Save Dates
              </button>
            </div>
          </div>
        </div>
      )}

      <QuestionDrawer
        isOpen={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        question={selectedQuestion?.data}
        isCompleted={selectedQuestion ? completed.has(selectedQuestion.id) : false}
        isStarred={selectedQuestion ? starred.has(selectedQuestion.id) : false}
        notes={selectedQuestion ? (localNotes[selectedQuestion.id] || "") : ""}
        onSaveNote={handleSaveNote}
        onToggleCompletion={() => {
          if (!selectedQuestion) return;
          const assignedCompany = selectedQuestion.data.companies?.split(',')[0]?.trim() || 'google';
          toggleCompletion(selectedQuestion.data, assignedCompany);
        }}
        onToggleStar={() => {
          if (!selectedQuestion) return;
          const assignedCompany = selectedQuestion.data.companies?.split(',')[0]?.trim() || 'google';
          toggleStar(selectedQuestion.id, assignedCompany);
        }}
        lastRevised={selectedQuestion ? (localRevisions[selectedQuestion.id]?.lastRevised || "") : ""}
        nextRevision={selectedQuestion ? (localRevisions[selectedQuestion.id]?.nextRevision || "") : ""}
        onUpdateRevision={(field, val) => selectedQuestion && handleRevisionChange(selectedQuestion.id, field, val)}
        onSaveRevision={async () => {
          if (selectedQuestion) await saveRevision(selectedQuestion.id);
        }}
        alternateQuestions={[]}
      />

      {isAdminModalOpen && (
        <AdminPopularSheetModal 
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />
      )}
    </div>
  );
}
