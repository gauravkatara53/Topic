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
  breakdown: {
    keyword_match: ScoreItem;
    experience_relevance: ScoreItem;
    skills_alignment: ScoreItem;
    education_certifications: ScoreItem;
    ats_formatting: ScoreItem;
    impact_quantification: ScoreItem;
  };
  missing_keywords: string[];
  matched_keywords: string[];
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

const GEMINI_API_KEYS = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
  .split(",")
  .map(k => k.trim())
  .filter(Boolean);
const GEMINI_MODEL   = "gemini-2.5-flash";
const MAX_HISTORY    = 10;

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) evaluator with 10+ years of experience in HR tech and recruitment automation. Your job is to deeply analyze a candidate's resume against a provided Job Description (JD) and return a precise, honest, and actionable ATS compatibility report.

EVALUATION CRITERIA (each scored individually, total = 10):
1. Keyword Match (2.5 pts) — Hard skills, tools, technologies, role-specific keywords. Exact + semantic equivalents.
2. Experience Relevance (2.0 pts) — Duration and domain alignment.
3. Skills Alignment (2.0 pts) — Technical + soft skills match.
4. Education & Certifications (1.0 pt) — Degree, field, certifications.
5. Resume Formatting & ATS Readability (1.5 pts) — Standard sections, no heavy formatting/tables/graphics.
6. Impact & Quantification (1.0 pt) — Measurable achievements vs vague responsibilities.

RESPOND ONLY with this exact JSON (no markdown fences, no extra text):
{
  "overall_score": <number out of 10, one decimal>,
  "grade": "<A / B / C / D / F>",
  "verdict": "<one line summary>",
  "breakdown": {
    "keyword_match": { "score": <x out of 2.5>, "comment": "<short insight>" },
    "experience_relevance": { "score": <x out of 2.0>, "comment": "<short insight>" },
    "skills_alignment": { "score": <x out of 2.0>, "comment": "<short insight>" },
    "education_certifications": { "score": <x out of 1.0>, "comment": "<short insight>" },
    "ats_formatting": { "score": <x out of 1.5>, "comment": "<short insight>" },
    "impact_quantification": { "score": <x out of 1.0>, "comment": "<short insight>" }
  },
  "missing_keywords": ["<keyword1>", "..."],
  "matched_keywords": ["<keyword1>", "..."],
  "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "critical_gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "quick_fixes": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}`;

const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  A: { color: "#10b981", bg: "#d1fae5", label: "Excellent" },
  B: { color: "#3b82f6", bg: "#dbeafe", label: "Good" },
  C: { color: "#f59e0b", bg: "#fef3c7", label: "Average" },
  D: { color: "#f97316", bg: "#ffedd5", label: "Below Avg" },
  F: { color: "#ef4444", bg: "#fee2e2", label: "Poor" },
};

const BREAKDOWN_META = [
  { key: "keyword_match",          label: "Keyword Match",         max: 2.5, icon: "🔍" },
  { key: "experience_relevance",   label: "Experience Relevance",  max: 2.0, icon: "💼" },
  { key: "skills_alignment",       label: "Skills Alignment",      max: 2.0, icon: "⚡" },
  { key: "education_certifications", label: "Education & Certs",   max: 1.0, icon: "🎓" },
  { key: "ats_formatting",         label: "ATS Formatting",        max: 1.5, icon: "📄" },
  { key: "impact_quantification",  label: "Impact & Quantification",max: 1.0, icon: "📊" },
] as const;

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
  const dash = ((score / 10) * 100 / 100) * circ;
  const grade = score >= 8.5 ? "A" : score >= 7 ? "B" : score >= 5.5 ? "C" : score >= 4 ? "D" : "F";
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
          <span className="text-3xl font-black text-[#1b254b]">{score.toFixed(1)}</span>
          <span className="text-xs text-slate-400 font-medium">/ 10</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
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
        <span className="text-sm font-semibold text-[#1b254b] flex items-center gap-1.5"><span>{icon}</span> {label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score} / {max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{comment}</p>
    </div>
  );
}

function KeywordPill({ word, type }: { word: string; type: "match" | "miss" }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
      type === "match" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"}`}>
      {type === "match" ? "✓" : "✗"} {word}
    </span>
  );
}

function ListSection({ title, items, icon, color }: { title: string; items: string[]; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
      <h3 className="font-bold text-[#1b254b] flex items-center gap-2"><span>{icon}</span> {title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
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
        <div className="flex-1 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/>
              <line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-emerald-800 text-sm truncate max-w-[220px]">{fileName}</p>
            <p className="text-emerald-600 text-xs mt-0.5">{pageCount} page{pageCount !== 1 ? "s" : ""} · {wordCount.toLocaleString()} words extracted</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Text extracted successfully
          </div>
        </div>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 transition-colors text-center py-1">
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
          ${dragging ? "border-[#2dd4bf] bg-teal-50 scale-[1.01]" : "border-slate-300 bg-slate-50 hover:border-[#2dd4bf] hover:bg-teal-50/40"}`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        {extracting ? (
          <>
            <svg className="w-10 h-10 animate-spin text-[#2dd4bf]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#1b254b]">Extracting text from PDF…</p>
              <p className="text-xs text-slate-400 mt-0.5">Parsing all pages, hang tight</p>
            </div>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-teal-100" : "bg-slate-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={dragging ? "#2dd4bf" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1b254b]">{dragging ? "Drop your PDF here" : "Upload Resume PDF"}</p>
              <p className="text-xs text-slate-400 mt-1">Drag & drop or <span className="text-[#2dd4bf] font-semibold">browse files</span></p>
              <p className="text-xs text-slate-300 mt-0.5">PDF only · Max 10 MB</p>
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
  const dash = (score / 10) * circ;
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
        <span className="text-sm font-black leading-none" style={{ color }}>{score.toFixed(1)}</span>
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
        <h2 className="font-black text-[#1b254b] text-lg flex items-center gap-2">
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
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              {/* Top: arc + grade chip + date */}
              <div className="flex items-center gap-3 p-4 pb-3">
                <MiniScoreArc score={entry.score} grade={entry.grade} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>
                      Grade {entry.grade}
                    </span>
                    {isRecent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1b254b] text-white">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{entry.date}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100 mx-4" />

              {/* File + JD + verdict */}
              <div className="p-4 pt-3 space-y-1.5 flex-1">
                <p className="text-sm font-semibold text-[#1b254b] truncate flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {entry.fileName || "Resume.pdf"}
                </p>
                <p className="text-xs text-slate-400 truncate">{entry.jdSnippet}</p>
                {entry.verdict && (
                  <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2">"{entry.verdict}"</p>
                )}
              </div>

              {/* Score bar */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">ATS Score</span>
                  <span className="text-[10px] font-bold" style={{ color }}>{entry.score.toFixed(1)} / 10</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(entry.score / 10) * 100}%`, background: color }} />
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

  // Ref for auto-scroll to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory(userId));
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

    if (GEMINI_API_KEYS.length === 0) {
      setError("Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.");
      return;
    }

    const rateCheck = canEvaluateRate(userId);
    if (!rateCheck.allowed) {
      setError(`Rate limit reached. You can only evaluate 5 resumes per 30 minutes. Please wait ${rateCheck.waitMinutes} minutes.`);
      return;
    }

    if (!overrideDuplicate) {
      const isDuplicate = history.some(h => h.fileName === (fileName || "Resume.pdf"));
      if (isDuplicate) {
        setDuplicateWarning(true);
        return;
      }
    }

    setDuplicateWarning(false);
    setLoading(true);
    setError(null);
    setResult(null);

    let startIndex = getActiveKeyIndex();
    let attempts = 0;
    let finalError = "Evaluation failed.";

    while (attempts < GEMINI_API_KEYS.length) {
      const currentIndex = (startIndex + attempts) % GEMINI_API_KEYS.length;
      const currentKey = GEMINI_API_KEYS[currentIndex];

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${currentKey}`,
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

        if (!res.ok) {
          const isQuotaError = res.status === 429 || res.status === 403;
          if (isQuotaError && GEMINI_API_KEYS.length > 1) {
            console.warn(`[ATS Checker] API Key at index ${currentIndex} hit rate limit / quota (${res.status}). Switching to next key...`);
            attempts++;
            continue;
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `API error ${res.status}`);
        }

        // Success! Track the active key so future requests skip directly to this one
        setActiveKeyIndex(currentIndex);

        const data = await res.json();
        const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
        const raw: string = parts.filter((p: any) => !p.thought).map((p: any) => p.text ?? "").join("");

        if (!raw.trim()) throw new Error("Empty response from Gemini. Try again.");

        const start = raw.indexOf("{");
        const end   = raw.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("Could not find JSON in response. Try again.");
        const parsed: ATSResult = JSON.parse(raw.slice(start, end + 1));

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

        // ── Auto-scroll to results ──
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);

        // ── Record Rate Limit Use ──
        recordEvaluation(userId);

        setLoading(false);
        return; // Exit the function entirely on success

      } catch (e: any) {
        const msg = e.message || "";
        if ((msg.includes("429") || msg.includes("quota")) && GEMINI_API_KEYS.length > 1) {
          console.warn(`[ATS Checker] Key ${currentIndex} failed with quota string. Switching to next...`);
          attempts++;
          continue;
        }
        
        finalError = msg || "Something went wrong. Please try again.";
        break; // Break the loop on a critical/network error so we don't spam 5 times
      }
    }

    // If we exited the loop without returning, it means we failed either due to exhaustion or a critical error
    setLoading(false);
    if (attempts >= GEMINI_API_KEYS.length) {
      setError("All available AI API keys have exhausted their quota. Please try again later.");
    } else {
      setError(finalError);
    }
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
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job Description */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
          <label className="text-sm font-bold text-[#1b254b] flex items-center gap-2">
            <span className="w-6 h-6 bg-[#1b254b] text-white rounded-lg flex items-center justify-center text-[11px] font-black">JD</span>
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here…"
            className="flex-1 min-h-[240px] resize-none text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2dd4bf] placeholder:text-slate-400 text-slate-700"
          />
          <p className="text-xs text-slate-400">{jd.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>

        {/* Resume PDF */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
          <label className="text-sm font-bold text-[#1b254b] flex items-center gap-2">
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">Evaluation Failed</p>
            <p className="text-sm text-red-600 opacity-80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-amber-800">Duplicate Resume Detected</p>
              <p className="text-sm text-amber-700 opacity-90 mt-0.5 max-w-lg">
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

          {/* Hero score */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={result.overall_score} />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-black text-[#1b254b]">ATS Score Report</h2>
              {fileName && (
                <p className="text-xs text-slate-400 flex items-center gap-1 justify-center sm:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {fileName}
                </p>
              )}
              <p className="text-slate-600 text-sm leading-relaxed">{result.verdict}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">{result.matched_keywords.length} Matched Keywords</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-600">{result.missing_keywords.length} Missing Keywords</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">{result.top_strengths.length} Key Strengths</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="font-black text-[#1b254b] text-lg">📋 Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {BREAKDOWN_META.map(({ key, label, max, icon }) => {
                const item = result.breakdown[key as keyof typeof result.breakdown];
                return <BreakdownBar key={key} label={label} score={item.score} max={max} comment={item.comment} icon={icon} />;
              })}
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-[#1b254b]">✅ Matched Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_keywords.length > 0
                  ? result.matched_keywords.map(w => <KeywordPill key={w} word={w} type="match" />)
                  : <p className="text-xs text-slate-400">None detected</p>}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-[#1b254b]">❌ Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.length > 0
                  ? result.missing_keywords.map(w => <KeywordPill key={w} word={w} type="miss" />)
                  : <p className="text-xs text-slate-400">None — great coverage!</p>}
              </div>
            </div>
          </div>

          {/* Strengths / Gaps / Fixes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ListSection title="Top Strengths" items={result.top_strengths} icon="💪" color="#10b981" />
            <ListSection title="Critical Gaps"  items={result.critical_gaps}  icon="🚨" color="#ef4444" />
            <ListSection title="Quick Fixes"    items={result.quick_fixes}    icon="⚡" color="#2dd4bf" />
          </div>

          {/* New evaluation */}
          <div className="flex justify-center">
            <button
              onClick={() => { setResult(null); handleClear(); setJd(""); setError(null); }}
              className="text-sm text-slate-500 hover:text-[#1b254b] underline underline-offset-2 transition-colors"
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
