"use client";

import Link from "next/link";

const FEATURES = [
  {
    icon: "🔍",
    title: "Keyword Match Analysis",
    desc: "Instantly see which JD keywords appear in your resume — and which critical ones are missing.",
  },
  {
    icon: "📊",
    title: "6-Criteria Score Breakdown",
    desc: "Scored across keywords, experience, skills, education, formatting, and quantified impact.",
  },
  {
    icon: "💡",
    title: "AI-Powered Quick Fixes",
    desc: "Get specific, actionable tips to improve your resume for the exact role you're targeting.",
  },
  {
    icon: "📄",
    title: "PDF Resume Upload",
    desc: "Upload your resume as a PDF — no copy-pasting. Text is extracted automatically page by page.",
  },
  {
    icon: "🕒",
    title: "Evaluation History",
    desc: "Every score you run is saved to your profile so you can track improvement over time.",
  },
  {
    icon: "⚡",
    title: "Instant Results",
    desc: "Topic AI — Smart Resume & ATS Checker for Students",
  },
];

const STEPS = [
  { step: "01", label: "Upload your resume PDF" },
  { step: "02", label: "Paste the Job Description" },
  { step: "03", label: "Hit Evaluate & get your score" },
];

export function ATSPromoPage() {
  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-10 font-sans">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1b254b] via-[#243060] to-[#2dd4bf] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-8 -bottom-12 w-40 h-40 bg-[#2dd4bf]/20 rounded-full pointer-events-none" />
        <div className="absolute -left-10 bottom-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          {/* Text */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-widest text-white/70 uppercase bg-white/10 px-3 py-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              ATS Resume Evaluator · Powered by AI
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight">
              Know exactly how your<br />resume scores <span className="text-[#2dd4bf]">before</span> applying
            </h1>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              Our AI evaluator reads your resume like a real ATS system — scoring it across 6 criteria and showing you exactly what to fix to land more interviews.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2dd4bf] hover:bg-[#26c0ac] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-100 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                Sign In to Check Your Score
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 text-sm border border-white/20"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Fake score card preview */}
          <div className="shrink-0 w-full max-w-[240px] bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 space-y-4 shadow-2xl">
            {/* Ring */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#2dd4bf" strokeWidth="7"
                    strokeDasharray="140 201" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">7.8</span>
                  <span className="text-[10px] text-white/50">/ 10</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200">Grade B · Good</span>
            </div>

            {/* Mini bars */}
            {[
              { label: "Keywords", pct: 78, color: "#10b981" },
              { label: "Experience", pct: 60, color: "#3b82f6" },
              { label: "Skills", pct: 85, color: "#10b981" },
              { label: "Formatting", pct: 45, color: "#f59e0b" },
            ].map(b => (
              <div key={b.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/70">{b.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: b.color }}>{b.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
              </div>
            ))}

            <p className="text-[10px] text-white/40 text-center italic">Sample report preview</p>
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#1b254b] text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map(({ step, label }) => (
            <div key={step} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center text-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] flex items-center justify-center shadow-md">
                <span className="text-white font-black text-sm">{step}</span>
              </div>
              <p className="text-sm font-semibold text-[#1b254b]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#1b254b] text-center">Everything You Need to Land the Interview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-2xl">{icon}</span>
              <h3 className="font-bold text-[#1b254b] text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="bg-gradient-to-r from-[#1b254b] to-[#2dd4bf] rounded-2xl p-8 text-white text-center space-y-4 relative overflow-hidden shadow-lg">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black">Ready to check your resume?</h2>
          <p className="text-white/70 text-sm max-w-md mx-auto">
            Sign in with your Topic account to get your free ATS score in under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 px-7 py-3 bg-white text-[#1b254b] font-bold rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-[1.02] active:scale-100 text-sm shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 px-7 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-all duration-200 text-sm border border-white/30"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
