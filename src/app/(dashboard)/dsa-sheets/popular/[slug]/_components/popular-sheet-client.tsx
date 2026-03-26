"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronDown, ChevronRight, CheckCircle2, Circle,
  Star, Share2, Search, Clock, Save, Palette, RotateCcw, FileText, Bookmark, ExternalLink, Target, Filter, ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  togglePopularSheetFollow,
  toggleQuestionCompletion,
  toggleQuestionStar,
  updateQuestionHighlight,
  updateQuestionRevision,
  updateQuestionNote
} from "@/actions/dsa-sheets";
import {
  DIFFICULTY_COLOR,
  HIGHLIGHT_THEMES,
  THEME_OPTIONS,
  CircularProgress,
  ProgressTopBar
} from "../../../_components/shared-ui";
import { toast } from "sonner";
import { QuestionDrawer } from "../../../_components/question-drawer";
import { RevisionPicker } from "../../../_components/revision-picker";


export function PopularSheetClient({
  sheet,
  userId,
  isFollowing,
  initialCompletedIds = [],
  initialStarredIds = [],
  initialHighlights = [],
  initialRevisions = [],
  initialNotes = []
}: {
  sheet: any,
  userId: string | null,
  isFollowing: boolean,
  initialCompletedIds?: string[],
  initialStarredIds?: string[],
  initialHighlights?: any[],
  initialRevisions?: any[],
  initialNotes?: { questionId: string, content: string }[]
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompletedIds));
  const [starred, setStarred] = useState<Set<string>>(new Set(initialStarredIds));
  const [localNotes, setLocalNotes] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    (initialNotes || []).forEach(note => { acc[note.questionId] = note.content; });
    return acc;
  });
  const [selectedQuestion, setSelectedQuestion] = useState<{ id: string, data: any } | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("All Difficulties");
  const [topicFilter, setTopicFilter] = useState("All Topics");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState<string | null>(null);
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
      console.error("Failed to save note:", error);
    }
  };

  const [highlights, setHighlights] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    initialHighlights.forEach(h => { acc[h.questionId] = h.colorTheme; });
    return acc;
  });

  const [localRevisions, setLocalRevisions] = useState<Record<string, any>>(() => {
    const acc: Record<string, any> = {};
    initialRevisions.forEach(r => { acc[r.questionId] = r; });
    return acc;
  });

  const onToggleFollow = async () => {
    if (!userId) {
      toast.error("Please sign in to follow sheets");
      return;
    }
    const next = !following;
    setFollowing(next);
    toast.success(next ? "Added to My Sheets" : "Removed from My Sheets");
    await togglePopularSheetFollow(sheet.id);
  };

  const onToggleCompletion = async (qId: string) => {
    if (!userId) {
      toast.error("Please sign in to track progress");
      return;
    }
    const isDone = completed.has(qId);
    const next = new Set(completed);
    if (isDone) next.delete(qId);
    else next.add(qId);
    setCompleted(next);
    await toggleQuestionCompletion(qId, sheet.slug, !isDone);

    // Auto-open revision modal if completing for the first time and preference is enabled
    if (!isDone && showRevisionModalPref && following) {
      const sq = sheet.questions.find((s: any) => String(s.question.questionId || s.question.id || s.question._id) === qId);
      if (sq) openRevisionModal(qId, sq.question.name);
    }
  };

  const onToggleStar = async (qId: string) => {
    if (!userId) {
      toast.error("Please sign in to bookmark questions");
      return;
    }
    const isStarred = starred.has(qId);
    const next = new Set(starred);
    if (isStarred) next.delete(qId);
    else next.add(qId);
    setStarred(next);
    await toggleQuestionStar(qId, sheet.slug, !isStarred);
  };

  const onSetHighlight = async (qId: string, theme: string) => {
    setHighlights(prev => ({ ...prev, [qId]: theme }));
    setPaletteOpen(null);
    await updateQuestionHighlight(qId, sheet.slug, theme);
  };

  const handleRevisionChange = (qId: string, field: 'lastRevised' | 'nextRevision', val: string) => {
    setLocalRevisions(prev => ({
      ...prev,
      [qId]: { ...(prev[qId] || { lastRevised: "", nextRevision: "" }), [field]: val }
    }));
  };

  const openRevisionModal = (qId: string, qName: string) => {
    if (!localRevisions[qId]) {
      const today = new Date().toISOString().split('T')[0];
      setLocalRevisions(prev => ({
        ...prev,
        [qId]: { lastRevised: today, nextRevision: "" }
      }));
    }
    setRevisionModalOpen({ id: qId, title: qName });
  };

  const saveRevision = async (qId: string) => {
    if (!userId) return;
    const rev = localRevisions[qId];
    if (!rev) return;
    try {
      // Corrected arguments: Convert strings to Date objects and add mandatory "Scheduled" status
      await updateQuestionRevision(
        qId,
        sheet.id,
        rev.lastRevised ? new Date(rev.lastRevised) : null,
        rev.nextRevision ? new Date(rev.nextRevision) : null,
        "Scheduled"
      );
      router.refresh();
      toast.success("Revision dates updated");
    } catch (e) {
      toast.error("Failed to save revision");
    }
  };

  // Grouping logic (Topic -> Subtopic -> Questions)
  const groupedData = sheet.questions.reduce((acc: any, sq: any) => {
    const topic = sq.topic || "Uncategorized";
    const subtopic = sq.subTopic || "General";
    if (!acc[topic]) acc[topic] = { subtopics: {} };
    if (!acc[topic].subtopics[subtopic]) acc[topic].subtopics[subtopic] = [];
    acc[topic].subtopics[subtopic].push(sq.question);
    return acc;
  }, {});

  const totalQuestions = sheet.questions.length;
  const solvedCount = completed.size; // This matches global, but for this sheet it might be different if we filter
  // Actually, we should filter solvedCount to only questions in THIS sheet
  const sheetQuestionIds = new Set(sheet.questions.map((sq: any) => String(sq.question.questionId || sq.question.id || sq.question._id)));
  const sheetSolvedCount = Array.from(completed).filter(id => sheetQuestionIds.has(String(id))).length;
  const progressPercent = totalQuestions > 0 ? (sheetSolvedCount / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] font-bold text-slate-400">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 hover:text-[#1b254b] transition-colors outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Sheets
        </button>
        <span className="text-slate-200">/</span>
        <span className="text-[#1b254b]">{sheet.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-[#1b254b] tracking-tight leading-tight">
              {sheet.name}
            </h1>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl whitespace-pre-line">
              {sheet.description}
            </p>
          </div>

          {/* <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-100">
              <Star className="w-3.5 h-3.5" /> TOP-SPECIFIC
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-100">
              <Search className="w-3.5 h-3.5" /> CURATED-PREP
            </div>
          </div> */}

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={onToggleFollow}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] text-[10px] font-black tracking-tight transition-all shadow-md border-2",
                following
                  ? "bg-[#ecfdf5] text-[#059669] border-[#6ee7b7] shadow-emerald-50"
                  : "bg-[#fff7ed] text-[#ea580c] border-[#fdba74] shadow-orange-50"
              )}
            >
              <Bookmark className={cn("w-4 h-4", following ? "fill-[#059669]" : "fill-[#ea580c]")} />
              {following ? "Following Sheet" : "Follow Sheet"}
            </button>

            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-[#1b254b] hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-2 py-2 text-slate-400 hover:text-[#1b254b] hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-xs font-black uppercase tracking-widest">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 p-8  flex flex-col items-center">
          {(() => {
            const counts = { Basic: 0, Easy: 0, Medium: 0, Hard: 0 };
            Object.values(groupedData).forEach((topicData: any) => {
              Object.values(topicData.subtopics).flat().forEach((q: any) => {
                const qId = String(q.questionId || q.id || q._id);
                if (completed.has(qId)) {
                  const diff = (q.difficulty || "Basic").charAt(0).toUpperCase() + (q.difficulty || "Basic").slice(1).toLowerCase();
                  if (diff in counts) {
                    counts[diff as keyof typeof counts]++;
                  }
                }
              });
            });
            return (
              <CircularProgress
                difficultyCounts={counts}
                total={totalQuestions}
                size={140}
                strokeWidth={12}
              />
            );
          })()}
          <div className="mt-4 text-[13px] font-black text-slate-800 tracking-tight">
            Overall Progress
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-12">
        {Object.entries(groupedData).map(([topic, topicData]: [string, any]) => {
          const isExpanded = expandedTopics[topic] !== false;
          const topicQuestions = Object.values(topicData.subtopics).flat() as any[];
          const topicCompletedCount = topicQuestions.filter(q => completed.has(String(q.questionId || q.id || q._id))).length;

          return (
            <div key={topic} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <ProgressTopBar current={topicCompletedCount} total={topicQuestions.length} />
              <button
                onClick={() => setExpandedTopics(prev => ({ ...prev, [topic]: !isExpanded }))}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-[17px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                    {topic === "Uncategorized" ? "All Questions" : topic}
                    <span className="text-slate-400 font-bold ml-2">{topicCompletedCount} / {topicQuestions.length}</span>
                  </h3>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-slate-300 transition-transform duration-300", !isExpanded && "rotate-180")} />
              </button>

              {isExpanded && (
                <div className="px-8 pb-8 space-y-10">
                  {Object.entries(topicData.subtopics).map(([subtopic, questions]: [string, any]) => {
                    const filteredQs = questions.filter((q: any) => {
                      const matchesSearch = q.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesDiff = diffFilter === "All Difficulties" || q.difficulty === diffFilter;
                      return matchesSearch && matchesDiff;
                    });

                    if (filteredQs.length === 0 && searchQuery) return null;
                    const subtopicCompletedCount = filteredQs.filter((q: any) => completed.has(String(q.questionId || q.id || q._id))).length;

                    return (
                      <div key={subtopic} className="space-y-0 border border-slate-100 rounded-2xl overflow-hidden mb-6 last:mb-0 flex flex-col">
                        <ProgressTopBar current={subtopicCompletedCount} total={filteredQs.length} className="h-[3px] bg-orange-100/20" />
                        {subtopic !== "General" && (
                          <div className="px-8 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase">
                              {subtopic}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-500">
                              {filteredQs.length} questions
                            </span>
                          </div>
                        )}

                        <div className="divide-y divide-slate-100">
                          {filteredQs.map((q: any) => {
                            const qId = String(q.questionId || q.id || q._id);
                            const isDone = completed.has(qId);
                            const isStarred = starred.has(qId);
                            const curHighlight = highlights[qId] || "default";
                            const highlightClass = HIGHLIGHT_THEMES[curHighlight];

                            return (
                              <div
                                key={qId}
                                onClick={() => setSelectedQuestion({ id: qId, data: q })}
                                className={cn(
                                  "group/row grid grid-cols-12 gap-4 px-8 py-3 items-center bg-white hover:bg-slate-50/50 transition-all cursor-pointer",
                                  highlightClass
                                )}
                              >
                                <div className="col-span-1">
                                  <button onClick={(e) => { e.stopPropagation(); onToggleCompletion(qId); }} className="focus:outline-none">
                                    {isDone ? (
                                      <CheckCircle2 className="w-[22px] h-[22px] text-[#22c55e] stroke-[2px]" />
                                    ) : (
                                      <Circle className="w-[22px] h-[22px] text-slate-200 group-hover/row:text-slate-300 stroke-[2px] transition-colors" />
                                    )}
                                  </button>
                                </div>

                                <div className="col-span-11 md:col-span-4 flex items-center gap-3 min-w-0">
                                  <a
                                    href={q.problemUrl || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                      "text-[13px] font-bold truncate hover:text-[#1b254b] transition-colors",
                                      isDone ? "text-slate-400 opacity-80" : "text-slate-700"
                                    )}
                                  >
                                    {q.name}
                                  </a>
                                </div>

                                <div className="hidden md:flex md:col-span-1 justify-center">
                                  <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", DIFFICULTY_COLOR[q.difficulty] || DIFFICULTY_COLOR[q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1).toLowerCase()] || "text-slate-400")}>
                                    {q.difficulty || "Medium"}
                                  </span>
                                </div>

                                <div className="hidden md:flex md:col-span-4 items-center gap-1.5 px-4 justify-center relative group/topics">
                                  {/* Hover Tooltip */}
                                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max max-w-[300px] bg-[#1b254b] text-white text-[11px] font-bold px-5 py-3.5 rounded-[18px] shadow-2xl opacity-0 invisible group-hover/topics:opacity-100 group-hover/topics:visible transition-all duration-300 z-[120] pointer-events-none origin-bottom scale-95 group-hover/topics:scale-100">
                                    <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1.5 text-center leading-relaxed">
                                      {q.topics?.map((topic: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                          <span className="whitespace-nowrap">{topic}</span>
                                          {i < q.topics.length - 1 && <div className="w-1 h-1 rounded-full bg-white/30" />}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-[8px] border-transparent border-t-[#1b254b]" />
                                  </div>

                                  {q.topics?.slice(0, 3).map((topic: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-500 border border-[#1b254b]/10 rounded-md text-[10px] font-bold tracking-tighter whitespace-nowrap">
                                      {topic}
                                    </span>
                                  ))}
                                  {q.topics?.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md text-[9px] font-black tracking-tighter shrink-0">
                                      +{q.topics.length - 3}
                                    </span>
                                  )}
                                </div>

                                <div className="col-span-11 md:col-span-2 flex items-center justify-end gap-1.5 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => onToggleStar(qId)} className={cn("p-1.5 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100", isStarred ? "text-amber-400" : "text-slate-400 hover:text-amber-400")}>
                                    <Star className={cn("w-4 h-4", isStarred && "fill-amber-400")} />
                                  </button>
                                  <div className="relative">
                                    <button onClick={() => setPaletteOpen(paletteOpen === qId ? null : qId)} className="p-1.5 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 text-slate-400 hover:text-indigo-600">
                                      <Palette className="w-4 h-4" />
                                    </button>
                                    {paletteOpen === qId && (
                                      <div className="absolute right-0 bottom-full mb-3 z-[110] bg-white border border-slate-200 p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in zoom-in-95 origin-bottom-right">
                                        {THEME_OPTIONS.map(opt => (
                                          <button
                                            key={opt.id}
                                            onClick={() => onSetHighlight(qId, opt.id)}
                                            className={cn(
                                              "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                              opt.bg,
                                              curHighlight === opt.id ? "border-slate-800" : "border-transparent"
                                            )}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => openRevisionModal(qId, q.name)}
                                    className="p-1.5 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 text-slate-400 hover:text-[#1b254b]"
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
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setRevisionModalOpen(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-[#1b254b] mb-1 tracking-tight">Revision Schedule</h3>
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
                    className="peer appearance-none w-4 h-4 rounded border-2 border-slate-200 checked:bg-[#1b254b] checked:border-[#1b254b] transition-all"
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
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveRevision(revisionModalOpen.id);
                    setRevisionModalOpen(null);
                  }}
                  className="px-5 py-2 text-xs font-black text-white bg-[#1b254b] hover:bg-[#111836] rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#1b254b]/20"
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
        onToggleCompletion={() => selectedQuestion && onToggleCompletion(selectedQuestion.id)}
        onToggleStar={() => selectedQuestion && onToggleStar(selectedQuestion.id)}
        popularSheets={selectedQuestion?.data?.sheets || []}
        lastRevised={selectedQuestion ? localRevisions[selectedQuestion.id]?.lastRevised : ""}
        nextRevision={selectedQuestion ? localRevisions[selectedQuestion.id]?.nextRevision : ""}
        onUpdateRevision={(field, val) => selectedQuestion && handleRevisionChange(selectedQuestion.id, field, val)}
        onSaveRevision={async () => {
          if (selectedQuestion) await saveRevision(selectedQuestion.id);
        }}
        alternateQuestions={(() => {
          if (!selectedQuestion) return [];
          const qId = selectedQuestion.id;
          const topic = selectedQuestion.data.topic || "General";
          const subtopic = selectedQuestion.data.subtopic || "General";
          const allQs = sheet?.questions || [];
          return allQs
            .filter((q: any) => {
              const curQId = String(q.questionId || q.id || q._id);
              return curQId !== qId && q.topic === topic && q.subtopic === subtopic;
            })
            .map((q: any) => ({ ...q, name: q.name || q.title }))
            .slice(0, 5);
        })()}
      />
    </div>
  );
}
