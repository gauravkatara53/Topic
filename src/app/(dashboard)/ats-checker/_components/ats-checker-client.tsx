"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoreItem {
  score: number;
  comment: string;
}

interface ATSResult {
  overall_score: number;
  grade: string;
  verdict: string;
  word_count: number;
  bullet_point_count: number;
  quantified_bullets_percent: number;
  jd_overlap_percent: number;
  over_optimized_warning: boolean;
  breakdown: {
    ats_parse_rate: ScoreItem;
    contact_details: ScoreItem;
    sections: ScoreItem;
    dates: ScoreItem;
    repetition: ScoreItem;
    quantifying_impact: ScoreItem;
    leadership_keywords: ScoreItem;
    drive_action_verbs: ScoreItem;
    communication_keywords: ScoreItem;
    analytical_keywords: ScoreItem;
    spelling_grammar: ScoreItem;
    resume_density: ScoreItem;
    formatting_flags: ScoreItem;
    hard_skills_match: ScoreItem & { matched: string[]; missing: string[] };
    job_title_relevance: ScoreItem;
    education_match: ScoreItem;
    soft_skills_match: ScoreItem;
    keyword_density: ScoreItem & { missing_domain_terms: string[] };
  };
  matched_keywords: string[];
  missing_keywords: string[];
  passive_language_detected: string[];
  repeated_verbs: string[];
  typos_found: string[];
  bonus_skills: string[];
  top_strengths: string[];
  critical_gaps: string[];
  quick_fixes: string[];
}

interface HistoryEntry {
  id: string;
  date: string;
  fileName: string;
  jdSnippet: string;
  score: number;
  grade: string;
  verdict: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY_2 || "";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
const GROK_API_KEY   = process.env.NEXT_PUBLIC_GROK_API_KEY || "";

const GEMINI_MODEL   = "gemini-2.5-flash"; // Reverting to the 2.5 series recommended for 2026
const MAX_HISTORY    = 10;

type ProviderOption = "GEMINI" | "GROK";

interface ProviderConfig {
  name: string;
  baseUrl: string;
  model: string;
  key: string;
  type: "google" | "openai-compatible";
}

const PROVIDER_CONFIGS: Record<ProviderOption, ProviderConfig> = {
  GEMINI: {
    name: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: GEMINI_MODEL,
    key: GEMINI_API_KEY,
    type: "google"
  },
  GROK: {
    name: "Groq (Llama 3.3)",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    key: GROK_API_KEY,
    type: "openai-compatible"
  }
};

const SYSTEM_PROMPT = `
# ATS Evaluation System (114 Points)
Analyze Resume vs JD. Output JSON only.

## Part A: Quality (85 pts)
1. Parse (15): Email(-3), Phone(-2), Tables(-5), Boxes(-5), <150 words(-3), Encoding(-3), Symbols(-2), All-caps(-2), Buried Headers(-2).
2. Contact (10): No email(-4), No phone(-3), No LinkedIn(-2), No Portfolio(-1), Unpro-domain(-1), No country code(-1).
3. Sections (15): Missing Edu(-3), Exp(-3), Skills(-3), Proj(-3). Hobbies(-1), References(-1), Objective(-1), Uncategorized Skills(-1).
4. Dates (5): No Year(-5), No Month(-2), Inconsistent(-2), Future dates(-2).
5. Repetition (8): Word 4x used(-4), Generic verbs(-3).
6. Impact (12): <3 nums(-6), 3-5 nums(-3), <30% quantified(-3), Vague(-2).
7. Leadership (8): 0 verbs(-8), <3 verbs(-3). (Target: led, managed, spearheaded...)
8. Drive (7): <4 action verbs(-4), Passive(-2 each). (Target: built, designed, optimized...)
9. Comm (5): 0 verbs(-3), <2 found(-1). (Target: collaborated, presented...)
10. Analytical (5): 0 verbs(-3), <2 found(-1). (Target: analyzed, tested...)
11. Grammar (8): -2 per typo. Flag Pronouns(I/me/my), long sentences.
12. Density (5): <300 words(-4), >800 student(-3), <5 bullets(-3).
13. Format (4): Photo(-2), Multi-column(-2), Custom headers(-2).

## Part B: JD Match (30 pts)
1. Hard Skills (40% weight): Extract & Compare.
2. Title (20%): Relevance to JD.
3. Edu (15%): Match degree requirements.
4. Soft Skills (15%): Infer from bullets.
5. Density (10%): Methodologies (Agile, Scrum).

OUTPUT ONLY VALID JSON:
{
  "overall_score": <0-100>,
  "grade": "<A/B/C/D/F>",
  "verdict": "<one line summary>",
  "word_count": <number>,
  "bullet_point_count": <number>,
  "quantified_bullets_percent": <number>,
  "jd_overlap_percent": <number>,
  "over_optimized_warning": <boolean>,
  "breakdown": {
    "ats_parse_rate": { "score": <x/15>, "comment": "" },
    "contact_details": { "score": <x/10>, "comment": "" },
    "sections": { "score": <x/15>, "comment": "" },
    "dates": { "score": <x/5>, "comment": "" },
    "repetition": { "score": <x/8>, "comment": "" },
    "quantifying_impact": { "score": <x/12>, "comment": "" },
    "leadership_keywords": { "score": <x/8>, "comment": "" },
    "drive_action_verbs": { "score": <x/7>, "comment": "" },
    "communication_keywords": { "score": <x/5>, "comment": "" },
    "analytical_keywords": { "score": <x/5>, "comment": "" },
    "spelling_grammar": { "score": <x/8>, "comment": "" },
    "resume_density": { "score": <x/5>, "comment": "" },
    "formatting_flags": { "score": <x/4>, "comment": "" },
    "hard_skills_match": { "score": <x/12>, "comment": "", "matched": [], "missing": [] },
    "job_title_relevance": { "score": <x/6>, "comment": "" },
    "education_match": { "score": <x/4>, "comment": "" },
    "soft_skills_match": { "score": <x/4>, "comment": "" },
    "keyword_density": { "score": <x/4>, "comment": "", "missing_domain_terms": [] }
  },
  "matched_keywords": [],
  "missing_keywords": [],
  "passive_language_detected": [],
  "repeated_verbs": [],
  "typos_found": [],
  "bonus_skills": [],
  "top_strengths": [],
  "critical_gaps": [],
  "quick_fixes": []
}
`;

const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  A: { color: "#10b981", bg: "#d1fae5", label: "Excellent" },
  B: { color: "#3b82f6", bg: "#dbeafe", label: "Good" },
  C: { color: "#f59e0b", bg: "#fef3c7", label: "Average" },
  D: { color: "#f97316", bg: "#ffedd5", label: "Below Avg" },
  F: { color: "#ef4444", bg: "#fee2e2", label: "Poor" },
};

const BREAKDOWN_META = [
  { key: "ats_parse_rate",         label: "ATS Parse Rate",        max: 15, icon: "📄" },
  { key: "contact_details",        label: "Contact Details",       max: 10, icon: "📞" },
  { key: "sections",               label: "Sections",              max: 15, icon: "📑" },
  { key: "dates",                  label: "Dates",                 max: 5,  icon: "📅" },
  { key: "repetition",             label: "Repetition",            max: 8,  icon: "🔁" },
  { key: "quantifying_impact",     label: "Quantifying Impact",    max: 12, icon: "📊" },
  { key: "leadership_keywords",    label: "Leadership Keywords",   max: 8,  icon: "👑" },
  { key: "drive_action_verbs",     label: "Drive / Action Verbs",  max: 7,  icon: "⚡" },
  { key: "communication_keywords", label: "Communication Keywords",max: 5,  icon: "💬" },
  { key: "analytical_keywords",    label: "Analytical Keywords",   max: 5,  icon: "🔍" },
  { key: "spelling_grammar",       label: "Spelling & Grammar",    max: 8,  icon: "✍️" },
  { key: "resume_density",         label: "Resume Density",        max: 5,  icon: "📏" },
  { key: "formatting_flags",       label: "Formatting Red Flags",  max: 4,  icon: "🚩" },
  { key: "hard_skills_match",      label: "Hard Skills Match",     max: 12, icon: "🛠️" },
  { key: "job_title_relevance",    label: "Job Title Relevance",   max: 6,  icon: "👔" },
  { key: "education_match",        label: "Education Match",       max: 4,  icon: "🎓" },
  { key: "soft_skills_match",      label: "Soft Skills Match",     max: 4,  icon: "👥" },
  { key: "keyword_density",        label: "Keyword Density",       max: 4,  icon: "📈" },
] as const;

const DEFAULT_RESULT: ATSResult = {
  overall_score: 0,
  grade: "F",
  verdict: "Awaiting analysis...",
  word_count: 0,
  bullet_point_count: 0,
  quantified_bullets_percent: 0,
  jd_overlap_percent: 0,
  over_optimized_warning: false,
  breakdown: BREAKDOWN_META.reduce((acc, { key }) => ({
    ...acc,
    [key]: { score: 0, comment: "Not evaluated" }
  }), {} as any),
  matched_keywords: [],
  missing_keywords: [],
  passive_language_detected: [],
  repeated_verbs: [],
  typos_found: [],
  bonus_skills: [],
  top_strengths: [],
  critical_gaps: [],
  quick_fixes: []
};

// ─── Robust JSON Parser ───────────────────────────────────────────────────────

function safeParseJSON<T>(raw: string): T {
  let cleaned = raw.trim();

  // 1. Remove markdown code fences if present
  if (cleaned.includes("```")) {
    const parts = cleaned.split(/```(?:json)?/);
    if (parts.length >= 2) {
      cleaned = parts[1].split("```")[0].trim();
    }
  }

  // 2. Identify strictly the JSON boundaries if possible
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  // 3. Structural Repairs
  // a) Single quotes to double quotes (if wrapping keys/values)
  // This is a rough fix: 'key' -> "key", 'value' -> "value"
  cleaned = cleaned.replace(/'([^']+)':/g, '"$1":');
  cleaned = cleaned.replace(/:\s*'([^']*)'/g, ': "$1"');
  
  // b) Strip trailing commas: "key": "val", } -> "key": "val" } and [1, 2, ] -> [1, 2]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // c) Fix missing commas between properties (e.g., "val" "key": -> "val", "key":)
  cleaned = cleaned.replace(/"\s+"([^"]+)"\s*:/g, '", "$1":');
  cleaned = cleaned.replace(/([0-9]|true|false|null)\s+"([^"]+)"\s*:/g, '$1, "$2":');

  // d) Handle common unescaped quotes inside strings (e.g. "it is "good"")
  // This looks for a quote followed by non-separator characters
  // cleaned = cleaned.replace(/(?<=: )"(.+)"(?=[,\n}])/g, (match, p1) => `"${p1.replace(/"/g, '\\"')}"`);
  
  // e) Handle invisible control characters that break JSON.parse
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  const tryParse = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      // Merge with defaults to prevent missing fields
      return {
        ...DEFAULT_RESULT,
        ...parsed,
        breakdown: {
          ...DEFAULT_RESULT.breakdown,
          ...(parsed.breakdown || {})
        }
      } as T;
    } catch {
      return null;
    }
  };

  const firstTry = tryParse(cleaned);
  if (firstTry) return firstTry;

  try {
    // Stage 1: Attempt to fix truncation
    let repair = cleaned;
    const stack: ("{" | "[")[] = [];
    const quotes = { double: false };
    
    for (let i = 0; i < repair.length; i++) {
      const char = repair[i];
      if (char === '"' && repair[i-1] !== '\\') quotes.double = !quotes.double;
      if (quotes.double) continue;
      
      if (char === "{") stack.push("{");
      else if (char === "[") stack.push("[");
      else if (char === "}") stack.pop();
      else if (char === "]") stack.pop();
    }
    
    if (quotes.double) repair += '"';
    while (stack.length > 0) {
      const char = stack.pop();
      repair += char === "{" ? "}" : "]";
    }

    const secondTry = tryParse(repair);
    if (secondTry) return secondTry;

    throw new Error("Invalid format");
  } catch (err) {
    console.error("[ATS Checker] JSON Parse failed. Original length:", raw.length, "Cleaned length:", cleaned.length);
    console.log("[ATS Checker] Failing string:", cleaned);
    throw err;
  }
}

// ─── History helpers ──────────────────────────────────────────────────────────

function historyKey(userId: string) {
  return `ats-history-${userId}`;
}

function loadHistory(userId: string): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(historyKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(userId: string, entries: HistoryEntry[]) {
  try {
    localStorage.setItem(historyKey(userId), JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch {}
}

function getRateLimit(userId: string): number[] {
  try {
    const raw = localStorage.getItem(`ats-rate-${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getActiveKeyIndex() {
  if (typeof window !== "undefined") {
    return parseInt(localStorage.getItem("ats-gemini-key") || "0", 10);
  }
  return 0;
}

function setActiveKeyIndex(idx: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ats-gemini-key", idx.toString());
  }
}

function recordEvaluation(userId: string) {
  const now = Date.now();
  const limits = getRateLimit(userId).filter(t => now - t < 30 * 60 * 1000);
  limits.push(now);
  try { localStorage.setItem(`ats-rate-${userId}`, JSON.stringify(limits)); } catch {}
}

function canEvaluateRate(userId: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const limits = getRateLimit(userId).filter(t => now - t < 30 * 60 * 1000);
  if (limits.length >= 5) {
    const oldest = limits[0];
    const waitMs = (30 * 60 * 1000) - (now - oldest);
    return { allowed: false, waitMinutes: Math.ceil(waitMs / 60000) };
  }
  return { allowed: true };
}

function gradeColor(grade: string) {
  return GRADE_CONFIG[grade]?.color ?? "#64748b";
}
function gradeBg(grade: string) {
  return GRADE_CONFIG[grade]?.bg ?? "#f1f5f9";
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
  const cfg = GRADE_CONFIG[grade];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={cfg.color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[#1b254b] dark:text-slate-100">{score.toFixed(0)}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full dark:bg-opacity-10 dark:!bg-slate-800 dark:border dark:border-current" style={{ color: cfg.color, background: cfg.bg }}>
        Grade {grade} · {cfg.label}
      </span>
    </div>
  );
}

function BreakdownBar({ label, score, max, comment, icon }: {
  label: string; score: number; max: number; comment: string; icon: string;
}) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#3b82f6" : pct >= 30 ? "#f59e0b" : "#ef4444";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1b254b] dark:text-slate-100 flex items-center gap-1.5"><span>{icon}</span> {label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score} / {max}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{comment}</p>
    </div>
  );
}

function KeywordPill({ word, type }: { word: string; type: "match" | "miss" }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
      type === "match" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"}`}>
      {type === "match" ? "✓" : "✗"} {word}
    </span>
  );
}

function MetricBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
    emerald: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-transparent hover:border-current transition-all ${colors[color] || colors.blue}`}>
      <span className="text-[10px] uppercase font-black opacity-60 tracking-tighter">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

function ListSection({ title, items, icon, color }: { title: string; items: string[]; icon: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-5 space-y-3">
      <h3 className="font-bold text-[#1b254b] dark:text-slate-100 flex items-center gap-2"><span>{icon}</span> {title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: color }}>{i + 1}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PDF Upload Zone ──────────────────────────────────────────────────────────

interface PDFUploadProps {
  resumeText: string; fileName: string; pageCount: number; extracting: boolean;
  onTextExtracted: (text: string, fileName: string, pages: number) => void;
  onClear: () => void; onExtracting: (v: boolean) => void;
}

function PDFUploadZone({ resumeText, fileName, pageCount, extracting, onTextExtracted, onClear, onExtracting }: PDFUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setExtractError("Please upload a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setExtractError("File must be under 10 MB."); return; }
    setExtractError(null);
    onExtracting(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const totalPages = pdf.numPages;
      let fullText = "";
      for (let p = 1; p <= totalPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => ("str" in item ? (item.str as string) : "")).join(" ") + "\n";
      }
      const extracted = fullText.trim();
      if (!extracted) { setExtractError("No readable text found. The PDF may be image-based or scanned."); onExtracting(false); return; }
      onTextExtracted(extracted, file.name, totalPages);
    } catch (err: any) {
      console.error("[PDF extract error]", err);
      setExtractError("Failed to read PDF. Try a different file.");
    } finally {
      onExtracting(false);
    }
  }, [onTextExtracted, onExtracting]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (resumeText && fileName) {
    const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
    return (
      <div className="flex flex-col gap-3 h-full">
        <div className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-300 dark:border-emerald-500/30 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/>
              <line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm truncate max-w-[220px]">{fileName}</p>
            <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-0.5">{pageCount} page{pageCount !== 1 ? "s" : ""} · {wordCount.toLocaleString()} words extracted</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Text extracted successfully
          </div>
        </div>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-center py-1">
          ✕ Remove and upload a different file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        onClick={() => !extracting && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex-1 min-h-[220px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 p-6 text-center select-none
          ${extracting ? "cursor-default" : ""}
          ${dragging ? "border-[#2dd4bf] bg-teal-50 dark:bg-teal-500/10 scale-[1.01]" : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:border-[#2dd4bf] hover:bg-teal-50/40 dark:hover:bg-teal-500/10"}`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        {extracting ? (
          <>
            <svg className="w-10 h-10 animate-spin text-[#2dd4bf]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#1b254b] dark:text-slate-100">Extracting text from PDF…</p>
              <p className="text-xs text-slate-400 mt-0.5">Parsing all pages, hang tight</p>
            </div>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-teal-100 dark:bg-teal-500/20" : "bg-slate-100 dark:bg-slate-800"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={dragging ? "#2dd4bf" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1b254b] dark:text-slate-100">{dragging ? "Drop your PDF here" : "Upload Resume PDF"}</p>
              <p className="text-xs text-slate-400 mt-1">Drag & drop or <span className="text-[#2dd4bf] font-semibold">browse files</span></p>
              <p className="text-xs text-slate-300 dark:text-slate-500 mt-0.5">PDF only · Max 10 MB</p>
            </div>
          </>
        )}
      </div>
      {extractError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <span className="text-base">⚠️</span>
          <p className="text-xs text-red-600 font-medium">{extractError}</p>
        </div>
      )}
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function MiniScoreArc({ score, grade }: { score: number; grade: string }) {
  const r = 26, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = gradeColor(grade);
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black leading-none" style={{ color }}>{score.toFixed(0)}</span>
      </div>
    </div>
  );
}

function HistoryPanel({ entries, onClear }: { entries: HistoryEntry[]; onClear: () => void }) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-black text-[#1b254b] dark:text-slate-100 text-lg flex items-center gap-2">
          <span>🕒</span> Previous Evaluations
        </h2>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
          Clear all
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {entries.map((entry, idx) => {
          const color  = gradeColor(entry.grade);
          const bg     = gradeBg(entry.grade);
          const isRecent = idx === 0;
          return (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              {/* Top: arc + grade chip + date */}
              <div className="flex items-center gap-3 p-4 pb-3">
                <MiniScoreArc score={entry.score} grade={entry.grade} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full dark:bg-opacity-10 dark:!bg-slate-800 dark:border dark:border-current" style={{ color, background: bg }}>
                      Grade {entry.grade}
                    </span>
                    {isRecent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1b254b] dark:bg-slate-700 text-white dark:text-slate-100">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{entry.date}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />

              {/* File + JD + verdict */}
              <div className="p-4 pt-3 space-y-1.5 flex-1">
                <p className="text-sm font-semibold text-[#1b254b] dark:text-slate-100 truncate flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {entry.fileName || "Resume.pdf"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{entry.jdSnippet}</p>
                {entry.verdict && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-2">
                    &quot;{entry.verdict}&quot;
                  </p>
                )}
              </div>

              {/* Score bar */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">ATS Score</span>
                  <span className="text-[10px] font-bold" style={{ color }}>{entry.score.toFixed(0)} / 100</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(entry.score / 100) * 100}%`, background: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ATSCheckerClient({ userId }: { userId: string }) {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption>("GEMINI");
  const [availableProviders, setAvailableProviders] = useState<ProviderOption[]>([]);

  // Ref for auto-scroll to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load history + Check available providers
  useEffect(() => {
    setHistory(loadHistory(userId));
    
    const available = (Object.keys(PROVIDER_CONFIGS) as ProviderOption[]).filter(
      p => PROVIDER_CONFIGS[p].key !== ""
    );
    setAvailableProviders(available);
    if (available.length > 0 && !available.includes("GEMINI")) {
      setSelectedProvider(available[0]);
    }
  }, [userId]);

  const canEvaluate = jd.trim() && resumeText.trim() && !extracting && !loading;

  function handleTextExtracted(text: string, name: string, pages: number) {
    setResumeText(text); setFileName(name); setPageCount(pages);
  }

  function handleClear() {
    setResumeText(""); setFileName(""); setPageCount(0); setDuplicateWarning(false);
  }

  function handleClearHistory() {
    saveHistory(userId, []);
    setHistory([]);
  }

  async function evaluate(overrideDuplicate = false) {
    if (!canEvaluate) return;

    if (availableProviders.length === 0) {
      setError("No AI providers are configured. Please check your .env file.");
      return;
    }

    const rateCheck = canEvaluateRate(userId);
    if (!rateCheck.allowed) {
      setError(`Rate limit reached. Please wait ${rateCheck.waitMinutes} minutes.`);
      return;
    }

    if (!overrideDuplicate) {
      const isDuplicate = history.some(h => h.fileName === (fileName || "Resume.pdf"));
      if (isDuplicate) {
        setDuplicateWarning(true);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Filter available providers to prioritize the selected one
    const providersToTry = availableProviders.includes(selectedProvider)
      ? [selectedProvider, ...availableProviders.filter(p => p !== selectedProvider)]
      : availableProviders;

    let finalError = "Evaluation failed.";

    for (let i = 0; i < providersToTry.length; i++) {
      const provider = providersToTry[i];
      const config = PROVIDER_CONFIGS[provider];
      
      try {
        console.log(`[ATS Checker] Attempting evaluation with ${config.name}...`);
        let res;
        
        if (config.type === "google") {
          res = await fetch(
            `${config.baseUrl}/models/${config.model}:generateContent?key=${config.key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nJD_TEXT:\n${jd}\n\nRESUME_TEXT:\n${resumeText}` }] }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 8192,
                  responseMimeType: "application/json",
                }
              })
            }
          );
        } else {
          res = await fetch(`${config.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${config.key}`
            },
            body: JSON.stringify({
              model: config.model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `JD_TEXT:\n${jd}\n\nRESUME_TEXT:\n${resumeText}` }
              ],
              temperature: 0.2,
              response_format: { type: "json_object" }
            })
          });
        }

        if (!res.ok) {
          const isRetryable = res.status === 429 || res.status === 403 || res.status >= 500;
          if (isRetryable && i < providersToTry.length - 1) {
            console.warn(`[ATS Checker] ${config.name} failed (${res.status}). Failing over to next provider...`);
            continue;
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `API error ${res.status}`);
        }

        const data = await res.json();
        let raw = "";

        if (config.type === "google") {
          const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
          raw = parts.filter((p: any) => !(p as any).thought).map((p: any) => p.text ?? "").join("");
        } else {
          raw = data?.choices?.[0]?.message?.content ?? "";
        }

        if (!raw.trim()) throw new Error("Empty response from AI.");

        const parsed = safeParseJSON<ATSResult>(raw);
        
        // Normalize 114 points to 100 if LLM didn't already
        // (Actually the template score is 114, so we expect raw to reflecting that)
        // We'll trust the AI for now, but UI shows /max anyway.

        setResult(parsed);

        // ── Save to history ──
        const entry: HistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          fileName: fileName || "Resume.pdf",
          jdSnippet: jd.trim().slice(0, 65) + (jd.trim().length > 65 ? "…" : ""),
          score: parsed.overall_score,
          grade: parsed.grade,
          verdict: parsed.verdict,
        };
        const updated = [entry, ...history].slice(0, MAX_HISTORY);
        setHistory(updated);
        saveHistory(userId, updated);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);

        recordEvaluation(userId);
        setLoading(false);
        return; // Success!

      } catch (e: any) {
        console.error(`[ATS Checker] ${config.name} critical error:`, e.message);
        if (i < providersToTry.length - 1) {
          console.warn("[ATS Checker] Failing over due to exception...");
          continue;
        }
        finalError = e.message || "Something went wrong.";
      }
    }

    setError(finalError);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6 font-sans">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1b254b] to-[#2dd4bf] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-white/80 uppercase flex items-center gap-1.5 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            ATS RESUME EVALUATOR
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Check Your Resume Score</h1>
          <p className="text-white/75 text-sm sm:text-base mt-1">
            Upload your resume PDF + paste the Job Description for an instant AI-powered ATS compatibility report.
          </p>
          
          {/* Model Selector */}
          <div className="mt-5 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 w-fit">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Selected Model:</span>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as ProviderOption)}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer hover:text-teal-200 transition-colors"
            >
              {availableProviders.map(p => (
                <option key={p} value={p} className="bg-[#1b254b] text-white">
                  {PROVIDER_CONFIGS[p].name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job Description */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-5 flex flex-col gap-3">
          <label className="text-sm font-bold text-[#1b254b] dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#1b254b] dark:bg-slate-700 text-white rounded-lg flex items-center justify-center text-[11px] font-black">JD</span>
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here…"
            className="flex-1 min-h-[240px] resize-none text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2dd4bf] placeholder:text-slate-400 text-slate-700 dark:text-slate-300 transition-colors"
          />
          <p className="text-xs text-slate-400">{jd.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>

        {/* Resume PDF */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-5 flex flex-col gap-3">
          <label className="text-sm font-bold text-[#1b254b] dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#2dd4bf] text-white rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            Resume PDF
          </label>
          <div className="flex-1">
            <PDFUploadZone
              resumeText={resumeText} fileName={fileName} pageCount={pageCount}
              extracting={extracting} onTextExtracted={handleTextExtracted}
              onClear={handleClear} onExtracting={setExtracting}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => evaluate(false)}
          disabled={!canEvaluate}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1b254b] to-[#2dd4bf] text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Analyzing Resume…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              Evaluate ATS Score
            </>
          )}
        </button>
        {(!resumeText || !jd) && !loading && (
          <p className="text-xs text-slate-400">
            {!resumeText && !jd ? "Upload a resume PDF and paste the job description to begin"
              : !resumeText ? "Upload your resume PDF to enable evaluation"
              : "Paste the job description to enable evaluation"}
          </p>
        )}
      </div>

      {/* Eval Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Evaluation Failed</p>
            <p className="text-sm text-red-600 dark:text-red-500 opacity-80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Duplicate Resume Detected</p>
              <p className="text-sm text-amber-700 dark:text-amber-500 opacity-90 mt-0.5 max-w-lg">
                You have already analyzed <strong>{fileName || "this resume"}</strong> previously. Evaluating it again will consume one of your 5 available evaluations per 30 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={() => evaluate(true)}
            className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            Analyze Anyway
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div ref={resultsRef} className="space-y-5 scroll-mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Over-optimization Warning */}
          {result.over_optimized_warning && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
              <span className="text-xl shrink-0">🚩</span>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Over-Optimization Warning</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 opacity-90 mt-0.5">
                  Your resume matches more than 85% of JD keywords. This might be flagged as "keyword stuffing" by some ATS systems. Consider making your language more natural.
                </p>
              </div>
            </div>
          )}

          {/* Hero score */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={result.overall_score ?? 0} />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-black text-[#1b254b] dark:text-slate-100">ATS Score Report</h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  GRADE_CONFIG[result.grade]?.bg || "bg-slate-100"
                } ${
                  GRADE_CONFIG[result.grade]?.color || "text-slate-600"
                }`}>Grade {result.grade || "F"}</span>
              </div>
              {fileName && (
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {fileName}
                </p>
              )}
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{result.verdict || "No verdict."}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <MetricBadge label="Words" value={result.word_count ?? 0} color="blue" />
                <MetricBadge label="Bullets" value={result.bullet_point_count ?? 0} color="purple" />
                <MetricBadge label="Quantified" value={`${result.quantified_bullets_percent ?? 0}%`} color="emerald" />
                <MetricBadge label="JD Overlap" value={`${result.jd_overlap_percent ?? 0}%`} color="amber" />
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-[#1b254b] dark:text-slate-100 text-lg">📋 Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {BREAKDOWN_META.map(({ key, label, max, icon }) => {
                const item = result.breakdown?.[key as keyof typeof result.breakdown] || { score: 0, comment: "N/A" };
                return <BreakdownBar key={key} label={label} score={item.score ?? 0} max={max} comment={item.comment || "N/A"} icon={icon} />;
              })}
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-[#1b254b] dark:text-slate-100">✅ Matched Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {(result.matched_keywords?.length ?? 0) > 0
                  ? result.matched_keywords?.map(w => <KeywordPill key={w} word={w} type="match" />)
                  : <p className="text-xs text-slate-400 dark:text-slate-500">None detected</p>}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-[#1b254b] dark:text-slate-100">❌ Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {(result.missing_keywords?.length ?? 0) > 0
                  ? result.missing_keywords?.map(w => <KeywordPill key={w} word={w} type="miss" />)
                  : <p className="text-xs text-slate-400">None — great coverage!</p>}
              </div>
            </div>
          </div>

          {/* Strengths / Gaps / Fixes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ListSection title="Top Strengths" items={result.top_strengths ?? []} icon="💪" color="#10b981" />
            <ListSection title="Critical Gaps"  items={result.critical_gaps ?? []}  icon="🚨" color="#ef4444" />
            <ListSection title="Quick Fixes"    items={result.quick_fixes ?? []}    icon="⚡" color="#2dd4bf" />
          </div>

          {/* Detailed Language Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-[#1b254b] dark:text-slate-100 text-lg">🔍 Deep Content Analysis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ListSection title="Passively Phrased" items={result.passive_language_detected ?? []} icon="🛑" color="#94a3b8" />
              <ListSection title="Repeated Verbs"    items={result.repeated_verbs ?? []}           icon="🔁" color="#f59e0b" />
              <ListSection title="Typos Flagged"     items={result.typos_found ?? []}              icon="✍️" color="#ef4444" />
              <ListSection title="Bonus Skills"      items={result.bonus_skills ?? []}             icon="✨" color="#8b5cf6" />
            </div>
          </div>

          {/* New evaluation */}
          <div className="flex justify-center">
            <button
              onClick={() => { setResult(null); handleClear(); setJd(""); setError(null); }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#1b254b] dark:hover:text-slate-100 underline underline-offset-2 transition-colors"
            >
              ← Start a new evaluation
            </button>
          </div>
        </div>
      )}

      {/* ── Previous Evaluations (History) ── */}
      <HistoryPanel entries={history} onClear={handleClearHistory} />
    </div>
  );
}
