"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Palette, ChevronLeft, ChevronDown, ChevronRight, CheckCircle2, Circle, Star, ExternalLink, Share2, Target, Bookmark, RotateCcw, FileText, Search, Filter, ArrowUpDown, Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFollowSheet, updateQuestionRevision, toggleQuestionCompletion, toggleQuestionStar, updateQuestionHighlight, updateQuestionNote } from "@/actions/dsa-sheets";
import { toast } from "sonner";
import { QuestionDrawer } from "../../_components/question-drawer";
import { RevisionPicker } from "../../_components/revision-picker";

// Dummy Data
const SHEET_DATA = {
  id: "google",
  company: "Google",
  title: "Google Master DSA Sheet",
  description: "This Google prep sheet, curated from top algorithm patterns, focuses on helping users practice in-depth. It addresses the challenge of recognizing complex problem patterns, preparing you to tackle even the hardest questions in interviews.",
  tags: ["top-specific", "google-prep"],
  categories: [
    {
      id: "basic",
      title: "Basic / Must Do",
      questions: [
        { id: "q1", url: "https://leetcode.com/problems/two-sum", title: "Two Sum", difficulty: "Easy", acceptance: "50.1%", frequency: "100.0%", topics: ["Arrays", "Hash Table"] },
        { id: "q2", url: "https://leetcode.com/problems/valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", acceptance: "40.2%", frequency: "96.5%", topics: ["Stack", "String"] },
        { id: "q3", url: "https://leetcode.com/problems/merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "Easy", acceptance: "63.0%", frequency: "88.2%", topics: ["Linked List", "Recursion"] },
      ],
    },
    {
      id: "advanced",
      title: "Advanced / Harder Concepts",
      questions: [
        { id: "q4", url: "https://leetcode.com/problems/lru-cache", title: "LRU Cache", difficulty: "Medium", acceptance: "41.6%", frequency: "98.0%", topics: ["Design", "Hash Table", "+1"] },
        { id: "q5", url: "https://leetcode.com/problems/trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", acceptance: "59.8%", frequency: "92.4%", topics: ["Array", "Two Pointers"] },
        { id: "q6", url: "https://leetcode.com/problems/median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "Hard", acceptance: "38.5%", frequency: "85.1%", topics: ["Array", "Binary Search"] },
        { id: "q7", url: "https://leetcode.com/problems/word-ladder", title: "Word Ladder", difficulty: "Hard", acceptance: "37.5%", frequency: "72.4%", topics: ["BFS", "Graph"] },
      ],
    }
  ]
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-emerald-500",
  Medium: "text-orange-400",
  Hard: "text-rose-500",
};

const HIGHLIGHT_THEMES: Record<string, string> = {
  default: "",
  yellow: "bg-yellow-100/80 border-yellow-200",
  blue: "bg-blue-100/80 border-blue-200",
  rose: "bg-rose-100/80 border-rose-200",
  emerald: "bg-emerald-100/80 border-emerald-200",
  purple: "bg-purple-100/80 border-purple-200",
};

const THEME_OPTIONS = [
  { id: "default", bg: "bg-slate-200" },
  { id: "yellow", bg: "bg-yellow-400" },
  { id: "blue", bg: "bg-blue-400" },
  { id: "rose", bg: "bg-rose-400" },
  { id: "emerald", bg: "bg-emerald-400" },
  { id: "purple", bg: "bg-purple-400" },
];

const ALL_TOPICS = [
  "All Topics", "array", "backtracking", "biconnected component", "binary indexed tree", "binary search", "binary search tree", "binary tree", "bit manipulation", "bitmask", "brainteaser", "breadth-first search", "bucket sort", "combinatorics", "concurrency", "counting", "counting sort", "data stream", "database", "depth-first search", "design", "divide and conquer", "doubly-linked list", "dynamic programming", "enumeration", "eulerian circuit", "game theory", "geometry", "graph theory", "greedy", "hash function", "hash table", "heap (priority queue)", "interactive", "iterator", "linked list", "math", "matrix", "memoization", "merge sort", "minimum spanning tree", "monotonic queue", "monotonic stack", "number theory", "ordered set", "prefix sum", "probability and statistics", "queue", "quickselect", "radix sort", "randomized", "recursion", "rejection sampling", "reservoir sampling", "rolling hash", "segment tree", "shell", "shortest path", "simulation", "sliding window", "sort", "sorting", "stack", "string", "string matching", "strongly connected component", "suffix array", "sweep line", "topological sort", "tree", "trie", "two pointers", "union-find"
];

export function CompanySheetClient({
  companyId,
  dbQuestions,
  isFollowing = false,
  userId = null,
  initialCompleted = [],
  dbRevisions = [],
  initialStarredIds = [],
  initialHighlights = [],
  initialNotes = []
}: {
  companyId: string,
  dbQuestions: any[],
  isFollowing?: boolean,
  userId?: string | null,
  initialCompleted?: string[],
  dbRevisions?: any[],
  initialStarredIds?: string[],
  initialHighlights?: { questionId: string, colorTheme: string }[],
  initialNotes?: { questionId: string, content: string }[]
}) {
  const [localNotes, setLocalNotes] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    (initialNotes || []).forEach(note => { acc[note.questionId] = note.content; });
    return acc;
  });
  const [selectedQuestion, setSelectedQuestion] = useState<{ id: string, data: any } | null>(null);
  const [tempNote, setTempNote] = useState("");
  const niceName = companyId.charAt(0).toUpperCase() + companyId.slice(1);
  const realTitle = `${niceName} Master DSA Sheet`;

  const extractTimeframe = (str: string | undefined, company: string) => {
    if (!str) return "none";
    const regex = new RegExp(`${company}\\s*\\(([^)]+)\\)`, "i");
    const match = str.match(regex);
    return match ? match[1].toLowerCase() : "none";
  };

  const sheet = {
    id: companyId,
    company: niceName,
    title: realTitle,
    description: `This compilation contains exclusive, previously asked data structure and algorithm questions from real ${niceName} interviews. Focus on these core problem patterns to confidently tackle even the hardest interview challenges.`,
    tags: ["top-specific", `${companyId}-prep`],
    categories: [
      {
        id: "all",
        title: "All Questions",
        questions: (dbQuestions || []).map((q) => ({
          id: q.id,
          url: q.url || "#",
          title: String(q.title || `Problem ${q.questionId}`),
          difficulty: q.difficulty || "Medium",
          acceptance: q.acceptance ? `${q.acceptance}%` : "N/A",
          frequency: q.frequency ? `${q.frequency}%` : "N/A",
          topics: q.tags ? String(q.tags).split(',').map((t: string) => t.trim()) : [],
          timeframe: extractTimeframe(q.companies_with_timeframe, companyId)
        }))
      }
    ]
  };

  // State for toggling categories and tracking completed problems
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    all: true,
  });
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted || []));

  const [starred, setStarred] = useState<Set<string>>(new Set(initialStarredIds || []));

  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("All Difficulties");
  const [topicFilter, setTopicFilter] = useState("All Topics");
  const [timeFilter, setTimeFilter] = useState("All Time");

  const [following, setFollowing] = useState(isFollowing);
  const [revisionModalOpen, setRevisionModalOpen] = useState<{ id: string, title: string } | null>(null);
  const [showRevisionModalPref, setShowRevisionModalPref] = useState(true);

  useEffect(() => {
    const pref = localStorage.getItem("showRevisionOnComplete");
    if (pref === "false") setShowRevisionModalPref(false);
  }, []);

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

  const [highlightPopoverOpen, setHighlightPopoverOpen] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    (initialHighlights || []).forEach(h => {
      acc[h.questionId] = h.colorTheme;
    });
    return acc;
  });

  const toggleHighlight = async (qId: string, theme: string) => {
    if (!userId) {
      toast.error("Please sign in to highlight questions");
      return;
    }
    setHighlights(prev => ({ ...prev, [qId]: theme }));
    setHighlightPopoverOpen(null);
    try {
      await updateQuestionHighlight(qId, companyId, theme);
    } catch (e) {
      toast.error("Failed to save highlight");
    }
  };

  const formatTimeframe = (str: string) => {
    if (str === 'thirty-days') return '30 Days';
    if (str === 'three-months') return '3 Months';
    if (str === 'six-months') return '6 Months';
    if (str === 'one-year') return '1 Year';
    if (str === 'two-years') return '2 Years';
    return str.replace('-', ' ');
  };

  const [localRevisions, setLocalRevisions] = useState<Record<string, { lastRevised: string, nextRevision: string }>>(() => {
    const acc: Record<string, any> = {};
    (dbRevisions || []).forEach(rev => {
      acc[rev.questionId] = {
        lastRevised: rev.lastRevised ? new Date(rev.lastRevised).toISOString().split('T')[0] : "",
        nextRevision: rev.nextRevision ? new Date(rev.nextRevision).toISOString().split('T')[0] : ""
      };
    });
    return acc;
  });

  const handleFollow = async () => {
    if (!userId) {
      alert("Please sign in to follow sheets and track your progress!");
      return;
    }
    const currentStatus = following;
    setFollowing(!currentStatus);
    try {
      await toggleFollowSheet(companyId, currentStatus);
    } catch (err) {
      setFollowing(currentStatus);
      alert("Failed to update follow status");
    }
  };

  const handleRevisionChange = (qId: string, field: 'lastRevised' | 'nextRevision', val: string) => {
    setLocalRevisions(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || { lastRevised: "", nextRevision: "" }), [field]: val }
    }));
  };

  const openRevisionModal = (qId: string, qTitle: string) => {
    if (!localRevisions[qId]) {
      const today = new Date().toISOString().split('T')[0];
      setLocalRevisions(prev => ({
        ...prev,
        [qId]: { lastRevised: today, nextRevision: "" }
      }));
    }
    setRevisionModalOpen({ id: qId, title: qTitle });
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
        companyId,
        rev.lastRevised ? new Date(rev.lastRevised) : null,
        rev.nextRevision ? new Date(rev.nextRevision) : null,
        "Scheduled"
      );
    } catch (e) {
      alert("Error saving revision.");
    }
  };

  const toggleCategory = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCompletion = async (q: any) => {
    if (!userId) {
      alert("Please sign in to save your completions permanently!");
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

    if (following && isNowDone && showRevisionModalPref) {
      openRevisionModal(q.id, q.title);
    }
  };

  const toggleStar = async (qId: string) => {
    if (!userId) {
      alert("Please sign in to bookmark questions!");
      return;
    }
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
      console.error(err);
      setStarred(prev => {
        const next = new Set(prev);
        if (isNowStarred) next.delete(qId);
        else next.add(qId);
        return next;
      });
      alert("Failed to save bookmark to database");
    }
  };

  // Apply all filters first so stats and counts reflect the currently active view
  const filteredCategories = sheet.categories.map(cat => {
    const questions = cat.questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = diffFilter === "All Difficulties" || (q.difficulty && q.difficulty.toLowerCase() === diffFilter.toLowerCase());
      const matchesTopic = topicFilter === "All Topics" || q.topics.some((t: string) => t.toLowerCase() === topicFilter.toLowerCase());
      const matchesTime = timeFilter === "All Time" || (q.timeframe && q.timeframe === timeFilter);
      return matchesSearch && matchesDiff && matchesTopic && matchesTime;
    });
    return { ...cat, questions };
  });

  // Stats
  const totalQuestions = filteredCategories.reduce((acc, cat) => acc + cat.questions.length, 0);

  let easyCompleted = 0;
  let medCompleted = 0;
  let hardCompleted = 0;

  // We count completions only for currently visible (filtered) questions
  filteredCategories.forEach(cat => {
    cat.questions.forEach(q => {
      if (completed.has(q.id)) {
        if (q.difficulty === "Easy") easyCompleted++;
        else if (q.difficulty === "Medium") medCompleted++;
        else hardCompleted++;
      }
    });
  });

  // Total completed visible
  const totalCompleted = easyCompleted + medCompleted + hardCompleted;



  // Ring styling
  const r = 38, circ = 2 * Math.PI * r;
  const easyPct = totalQuestions === 0 ? 0 : easyCompleted / totalQuestions;
  const medPct = totalQuestions === 0 ? 0 : medCompleted / totalQuestions;
  const hardPct = totalQuestions === 0 ? 0 : hardCompleted / totalQuestions;

  const easyDash = easyPct * circ;
  const medDash = medPct * circ;
  const hardDash = hardPct * circ;

  const medRot = easyPct * 360;
  const hardRot = (easyPct + medPct) * 360;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">

      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/dsa-sheets" className="hover:text-[#1b254b] transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Sheets
          </Link>
          <span>/</span>
          <span className="font-medium text-[#1b254b] dark:text-white">{realTitle}</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">{realTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl pt-1">
            {sheet.description}
          </p>
          <div className="flex items-center gap-2 pt-2">
            {sheet.tags.map(tag => (
              <span key={tag} className="text-[11px] font-bold px-2 py-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 uppercase flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={handleFollow}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded transition-colors border shadow-sm",
                following
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
                  : "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-100"
              )}
            >
              <Bookmark className={cn("w-3 h-3", following ? "fill-emerald-600" : "fill-orange-600")} />
              {following ? "Following Sheet" : "Follow Sheet"}
            </button>
          </div>
        </div>

        {/* Circular Progress & Actions widget */}
        <div className="shrink-0 flex flex-col items-end gap-6 pt-2">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded shadow-sm transition-all">
              Share
            </button>
          </div>
          <div className="relative w-28 h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-700 rounded-full">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={38} fill="none" strokeWidth="8" className="stroke-slate-200 dark:stroke-slate-600" />
              {/* Easy - Green */}
              <circle cx="50" cy="50" r={38} fill="none" stroke="#22c55e" strokeWidth="8"
                strokeDasharray={`${easyDash} ${circ}`} strokeLinecap="butt"
                style={{ transition: "stroke-dasharray 1s ease" }} />
              {/* Medium - Orange */}
              <circle cx="50" cy="50" r={38} fill="none" stroke="#f97316" strokeWidth="8"
                strokeDasharray={`${medDash} ${circ}`} strokeLinecap="butt"
                transform={`rotate(${medRot} 50 50)`}
                style={{ transition: "stroke-dasharray 1s ease, transform 1s ease" }} />
              {/* Hard - Red */}
              <circle cx="50" cy="50" r={38} fill="none" stroke="#ef4444" strokeWidth="8"
                strokeDasharray={`${hardDash} ${circ}`} strokeLinecap="butt"
                transform={`rotate(${hardRot} 50 50)`}
                style={{ transition: "stroke-dasharray 1s ease, transform 1s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className="text-[22px] font-black text-slate-900 dark:text-white leading-none">{totalCompleted}</span>
              <div className="w-8 h-[1.5px] bg-slate-900 dark:bg-white my-1"></div>
              <span className="text-[17px] font-black text-slate-900 dark:text-white leading-none">{totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
        <div className="relative flex-1 w-full xl:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#2dd4bf] overflow-hidden">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full sm:w-36 bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-sm focus:outline-none text-slate-600 appearance-none cursor-pointer capitalize outline-none border-none ring-0 shadow-none"
            >
              <option value="All Time">All Time</option>
              <option value="thirty-days">Last 30 Days</option>
              <option value="three-months">Last 3 Months</option>
              <option value="six-months">Last 6 Months</option>
              <option value="none">Older / Unknown</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#2dd4bf] overflow-hidden">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="w-full sm:w-36 bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-sm focus:outline-none text-slate-600 appearance-none cursor-pointer outline-none border-none ring-0 shadow-none"
            >
              <option value="All Difficulties">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#2dd4bf] overflow-hidden">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full sm:w-44 bg-slate-50 dark:bg-slate-700 dark:text-slate-300 text-sm focus:outline-none text-slate-600 appearance-none cursor-pointer capitalize outline-none border-none ring-0 shadow-none"
            >
              {ALL_TOPICS.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-6 pt-4">
        {filteredCategories.map(cat => {
          if (cat.questions.length === 0) return null; // Hide empty categories when filtered
          const isExpanded = expanded[cat.id] ?? true;
          const catCompleted = cat.questions.filter(q => completed.has(q.id)).length;

          return (
            <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Category Progress Bar */}
              <div className="w-full h-2.5 bg-[#f0fdfa] border-b border-teal-100/30">
                <div className="h-full bg-[#2dd4bf] transition-all duration-700 ease-in-out" style={{ width: `${(catCompleted / Math.max(1, cat.questions.length)) * 100}%` }}></div>
              </div>

              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-transparent data-[state=open]:border-slate-100"
                data-state={isExpanded ? "open" : "closed"}
              >
                <div className="flex items-end gap-3 px-2">
                  <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">{cat.title.split('/')[0].trim()}</h2>
                  <span className="text-[13px] font-bold text-slate-600 dark:text-slate-400 leading-none translate-y-[-2px]">
                    {catCompleted} / {cat.questions.length}
                  </span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Questions List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700">
                  {/* Rows */}
                  {cat.questions.map(q => {
                    const isDone = completed.has(q.id);
                    const isStarred = starred.has(q.id);
                    const curHighlight = highlights[q.id] || "default";
                    const themeClasses = HIGHLIGHT_THEMES[curHighlight] || "";

                    return (
                      <div 
                        key={q.id} 
                        onClick={() => setSelectedQuestion({ id: q.id, data: q })}
                        className={cn(
                          "grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 relative group/row cursor-pointer",
                          themeClasses ? themeClasses : (isDone ? "bg-emerald-50/30 dark:bg-emerald-900/10" : "bg-white dark:bg-slate-800")
                        )}
                      >

                        {/* Status Checkbox */}
                        <div className="md:col-span-1 flex items-center shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); toggleCompletion(q); }} className="focus:outline-none rounded-full transition-transform active:scale-90">
                            {isDone
                              ? <CheckCircle2 className="w-5 h-5 text-[#22c55e] stroke-[2px]" />
                              : <Circle className="w-5 h-5 text-[#22c55e] stroke-[2px]" />
                            }
                          </button>
                        </div>

                        {/* Title & Timeframe */}
                        <div className="md:col-span-5 flex-1 min-w-0 pr-2">
                          <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                            <a href={q.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={cn(
                              "text-sm font-bold truncate leading-tight transition-colors hover:underline underline-offset-2 decoration-slate-300",
                              isDone ? "text-slate-500 dark:text-slate-500 opacity-70 dark:opacity-100" : "text-slate-800 dark:text-white"
                            )}>
                              {q.title}
                            </a>
                            {q.timeframe && q.timeframe !== "none" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-orange-50/80 text-orange-600 border border-orange-200/60 rounded whitespace-nowrap truncate w-fit tracking-tight">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTimeframe(q.timeframe)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Difficulty */}
                        <div className="md:col-span-2 flex justify-center items-center text-[10px] font-black tracking-wide uppercase mt-2 md:mt-0">
                          <span className={cn(
                            q.difficulty === "Easy" ? "text-emerald-500" :
                              q.difficulty === "Medium" ? "text-orange-400" :
                                "text-rose-500"
                          )}>
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Topics */}
                        <div className="md:col-span-3 hidden lg:flex items-center gap-1.5 justify-start pl-8 relative group">
                          <div className="flex flex-wrap items-center gap-1.5 px-4 justify-center">
                            {(q.topics || []).slice(0, 3).map((topic: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-white/5 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-[#1b254b]/10 dark:border-white/10 rounded-md text-[10px] font-bold tracking-tighter whitespace-nowrap uppercase">
                                {topic}
                              </span>
                            ))}
                          </div>{q.topics.length > 2 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded cursor-help">
                              +{q.topics.length - 2}
                            </span>
                          )}

                          {/* Hover Pop-up for all topics */}
                          {q.topics.length > 0 && (
                            <div className="absolute right-3 top-full mt-1 z-[100] hidden group-hover:block w-fit max-w-[200px] text-wrap text-center bg-slate-800 text-white text-[10px] font-medium px-2.5 py-2 rounded-lg shadow-xl">
                              {q.topics.join(' • ')}
                            </div>
                          )}
                        </div>                        {/* Actions */}
                        <div className="md:col-span-1 flex items-center justify-end gap-3 shrink-0 mt-3 md:mt-0" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setSelectedQuestion({ id: q.id, data: q });
                            }}
                            className={cn(
                              "transition-all duration-300 flex shrink-0", 
                              localNotes[q.id] ? "text-orange-500" : "text-slate-300 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400"
                            )}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleStar(q.id)} className={cn("transition-colors flex shrink-0", isStarred ? "text-orange-400" : "text-slate-300 dark:text-slate-500 hover:text-orange-400 dark:hover:text-orange-300")}>
                            <Star className={cn("w-4 h-4", isStarred && "fill-orange-400")} />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setHighlightPopoverOpen(highlightPopoverOpen === q.id ? null : q.id)}
                              className={cn(
                                "transition-colors flex shrink-0 hover:text-slate-900 dark:hover:text-white",
                                curHighlight !== "default" ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-500"
                              )}
                            >
                              <Palette className="w-4 h-4" />
                            </button>

                            {highlightPopoverOpen === q.id && (
                              <div className="absolute right-0 bottom-full mb-2 z-[110] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2 flex gap-1.5 animate-in zoom-in-95 fade-in duration-200">
                                {THEME_OPTIONS.map(opt => (
                                  <button
                                    key={opt.id}
                                    onClick={() => toggleHighlight(q.id, opt.id)}
                                    className={cn(
                                      "w-5 h-5 rounded-full hover:scale-110 transition-transform shadow-inner ring-2 ring-offset-1 outline-none",
                                      opt.bg,
                                      curHighlight === opt.id ? "ring-slate-400 dark:ring-slate-300 scale-110" : "ring-transparent"
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <button onClick={() => openRevisionModal(q.id, q.title)} className="text-slate-300 dark:text-slate-500 hover:text-[#1b254b] dark:hover:text-white transition-colors flex shrink-0">
                            <Clock className="w-4 h-4" />
                          </button>
                          <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-orange-400 transition-colors flex shrink-0">
                            <FileText className="w-4 h-4" />
                          </a>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Revision Modal Popup */}
      {revisionModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setRevisionModalOpen(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">Revision Schedule</h3>
            <p className="text-xs text-slate-500 mb-5 font-medium line-clamp-2">{revisionModalOpen.title}</p>

            <div className="mt-4 text-left">
               <RevisionPicker 
                  lastRevised={(() => {
                    const rev = localRevisions[revisionModalOpen.id];
                    if (!rev?.lastRevised) return "";
                    const d = new Date(rev.lastRevised);
                    return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
                  })()}
                  nextRevision={(() => {
                    const rev = localRevisions[revisionModalOpen.id];
                    if (!rev?.nextRevision) return "";
                    const d = new Date(rev.nextRevision);
                    return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
                  })()}
                  onChange={(field, val) => handleRevisionChange(revisionModalOpen.id, field, val)}
               />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={!showRevisionModalPref}
                    onChange={(e) => {
                      const disable = e.target.checked;
                      setShowRevisionModalPref(!disable);
                      localStorage.setItem("showRevisionOnComplete", disable ? "false" : "true");
                    }}
                    className="peer appearance-none w-4 h-4 rounded border-2 border-slate-200 dark:border-slate-600 checked:bg-[#1b254b] dark:checked:bg-[#2dd4bf] dark:bg-slate-700 transition-all"
                  />
                  <CheckCircle2 className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest">
                  Don't show again
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRevisionModalOpen(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveRevision(revisionModalOpen.id);
                    setRevisionModalOpen(null);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1b254b] hover:bg-[#111836] dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#1b254b]/20"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar Drawer */}
      <QuestionDrawer 
        isOpen={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        question={selectedQuestion?.data}
        isCompleted={selectedQuestion ? completed.has(selectedQuestion.id) : false}
        isStarred={selectedQuestion ? starred.has(selectedQuestion.id) : false}
        notes={selectedQuestion ? (localNotes[selectedQuestion.id] || "") : ""}
        onSaveNote={handleSaveNote}
        onToggleCompletion={() => selectedQuestion && toggleCompletion(selectedQuestion.data)}
        onToggleStar={() => selectedQuestion && toggleStar(selectedQuestion.id)}
        lastRevised={selectedQuestion ? localRevisions[selectedQuestion.id]?.lastRevised : ""}
        nextRevision={selectedQuestion ? localRevisions[selectedQuestion.id]?.nextRevision : ""}
        onUpdateRevision={(field, val) => selectedQuestion && handleRevisionChange(selectedQuestion.id, field, val)}
        onSaveRevision={async () => {
          if (selectedQuestion) await saveRevision(selectedQuestion.id);
        }}
        alternateQuestions={(() => {
          if (!selectedQuestion) return [];
          const qId = selectedQuestion.id;
          const category = sheet.categories.find((cat: any) => 
            cat.questions.some((q: any) => q.id === qId)
          );
          if (!category) return [];
          return category.questions
            .filter((q: any) => q.id !== qId)
            .map((q: any) => ({ ...q, name: q.title }))
            .slice(0, 5);
        })()}
      />
    </div>
  );
}
