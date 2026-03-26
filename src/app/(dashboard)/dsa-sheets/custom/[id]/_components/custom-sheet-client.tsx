"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronDown, CheckCircle2, Circle,
  Star, Share2, Search, Clock, Save, Palette, RotateCcw,
  Plus, FileSpreadsheet, Trash2, LayoutGrid, Bookmark, Edit3, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_COLOR,
  HIGHLIGHT_THEMES,
  THEME_OPTIONS,
  CircularProgress,
  ProgressTopBar
} from "../../../_components/shared-ui";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BulkImportModal } from "../../../_components/bulk-import-modal";
import { QuestionDrawer } from "../../../_components/question-drawer";
import { RevisionPicker } from "../../../_components/revision-picker";
import { deleteCustomSheet, removeQuestionFromCustomSheet, updateCustomSheet } from "@/actions/custom-sheets";
import {
  toggleQuestionCompletion,
  toggleQuestionStar,
  updateQuestionHighlight,
  updateQuestionRevision,
  updateQuestionNote
} from "@/actions/dsa-sheets";

export function CustomSheetClient({
  sheet,
  userId,
  initialCompletedIds = [],
  initialStarredIds = [],
  initialHighlights = [],
  initialRevisions = [],
  initialNotes = []
}: {
  sheet: any,
  userId: string,
  initialCompletedIds?: string[],
  initialStarredIds?: string[],
  initialHighlights?: any[],
  initialRevisions?: any[],
  initialNotes?: { questionId: string, content: string }[]
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompletedIds));
  const [starred, setStarred] = useState<Set<string>>(new Set(initialStarredIds));
  const [localNotes, setLocalNotes] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    (initialNotes || []).forEach(note => { acc[note.questionId] = note.content; });
    return acc;
  });
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

  const [selectedQuestion, setSelectedQuestion] = useState<{ id: string, data: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState<string | null>(null);
  const [revisionModalOpen, setRevisionModalOpen] = useState<{ id: string, title: string } | null>(null);
  const [showRevisionModalPref, setShowRevisionModalPref] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Metadata Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(sheet.name);
  const [tempDescription, setTempDescription] = useState(sheet.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const totalQuestions = sheet.questions.length;
  const solvedCount = sheet.questions.filter((q: any) => completed.has(q.question.id)).length;
  const progressPercent = totalQuestions > 0 ? (solvedCount / totalQuestions) * 100 : 0;

  const difficultyCounts = sheet.questions.reduce((acc: any, qLink: any) => {
    const q = qLink.question;
    if (!completed.has(q.id)) return acc;
    const diff = q.difficulty || "Medium";
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, { Basic: 0, Easy: 0, Medium: 0, Hard: 0 });

  const groupedData = sheet.questions.reduce((acc: any, sq: any) => {
    const topic = sq.topic || "Uncategorized";
    const subtopic = sq.subTopic || "General";
    if (!acc[topic]) acc[topic] = { subtopics: {} };
    if (!acc[topic].subtopics[subtopic]) acc[topic].subtopics[subtopic] = [];
    acc[topic].subtopics[subtopic].push(sq);
    return acc;
  }, {});

  const handleSaveMetadata = async () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      await updateCustomSheet(sheet.id, {
        name: tempName,
        description: tempDescription
      });
      setIsEditing(false);
      toast.success("Sheet updated successfully");
      router.refresh();
    } catch (e) {
      toast.error("Failed to update sheet");
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleComplete = async (qid: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isDone = completed.has(qid);
    const next = new Set(completed);
    if (isDone) next.delete(qid);
    else next.add(qid);
    setCompleted(next);
    await toggleQuestionCompletion(qid, sheet.id, !isDone);

    if (!isDone && showRevisionModalPref) {
      const q = sheet.questions.find((sq: any) => sq.question.id === qid)?.question;
      if (q) openRevisionModal(qid, q.name);
    }
  };

  const onToggleStar = async (qid: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isStarred = starred.has(qid);
    const next = new Set(starred);
    if (isStarred) next.delete(qid);
    else next.add(qid);
    setStarred(next);
    await toggleQuestionStar(qid, sheet.id, !isStarred);
  };

  const onSetHighlight = async (qid: string, theme: string) => {
    setHighlights(prev => ({ ...prev, [qid]: theme }));
    setPaletteOpen(null);
    await updateQuestionHighlight(qid, sheet.id, theme);
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
    const rev = localRevisions[qId];
    if (!rev) return;
    try {
      await updateQuestionRevision(
        qId,
        sheet.id,
        rev.lastRevised ? new Date(rev.lastRevised) : null,
        rev.nextRevision ? new Date(rev.nextRevision) : null,
        "Scheduled"
      );
      toast.success("Revision dates updated");
    } catch (e) {
      toast.error("Failed to save revision");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] font-bold text-slate-400">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 hover:text-[#1b254b] dark:hover:text-white transition-colors outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Sheets
        </button>
        <span className="text-slate-200 dark:text-slate-600">/</span>
        <span className="text-[#1b254b] dark:text-white">{sheet.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-10 items-start justify-between">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4 max-w-3xl animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full text-3xl md:text-4xl font-black text-[#1b254b] dark:text-white tracking-tight leading-tight bg-slate-50 dark:bg-slate-800/50 border-b-2 border-teal-500 outline-none px-2 py-1 rounded-t-lg"
                  placeholder="Sheet Name"
                />
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="w-full text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 border-b-2 border-teal-200 dark:border-teal-800 outline-none px-2 py-2 rounded-t-lg min-h-[80px]"
                  placeholder="Describe your sheet..."
                />
                <div className="flex items-center gap-3">
                  <button
                    disabled={isSaving}
                    onClick={handleSaveMetadata}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1b254b] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Details</>}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setTempName(sheet.name); setTempDescription(sheet.description); }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-[#1b254b] dark:text-white tracking-tight leading-tight">
                    {sheet.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl whitespace-pre-line mt-4">
                  {sheet.description || "The DSA sheet designed to cover almost every concept in Data Structures and Algorithms. Master technical interviews with this comprehensive collection."}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] text-[10px] font-black tracking-tight transition-all shadow-md border-2 bg-[#ecfdf5] text-[#059669] border-[#6ee7b7] shadow-emerald-50"
            >
              <Bookmark className="w-4 h-4 fill-[#059669]" />
              Owned Sheet
            </button>

            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-[#1b254b] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-2 py-2 text-slate-400 hover:text-[#1b254b] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs font-black uppercase tracking-widest">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 p-8 flex flex-col items-center">
          <CircularProgress
            difficultyCounts={difficultyCounts}
            total={totalQuestions}
            size={140}
            strokeWidth={12}
          />
          <div className="mt-4 text-[13px] font-black text-slate-800 dark:text-white tracking-tight">
            Overall Progress
          </div>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" />
          <input
            type="text"
            placeholder="Find a problem..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-11 py-2.5 text-[13px] font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-[#2dd4bf] dark:focus:border-[#2dd4bf] focus:ring-4 focus:ring-[#2dd4bf]/5 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/add">
            <button
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1b254b] hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-xl shadow-[#1b254b]/10 text-[13px]"
            >
              <Plus className="w-4 h-4" /> Manage Sheet <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60" />
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <button
                  onClick={() => { setIsEditing(true); setAddMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1b254b] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  <Edit3 className="w-4 h-4" /> Edit Sheet Details
                </button>
                <button
                  onClick={() => { setImportModalOpen(true); setAddMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all mt-1"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Import Excel/CSV
                </button>
                <div className="h-px bg-slate-50 dark:bg-slate-700 my-2" />
                <button
                  onClick={() => {
                    if (confirm("Delete this sheet?")) {
                      deleteCustomSheet(sheet.id).then(() => router.push("/dsa-sheets/my-sheets"));
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete Sheet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-12">
        {totalQuestions === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm">
            <LayoutGrid className="w-12 h-12 text-slate-100 dark:text-slate-700 mb-6" />
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[13px]">No questions added yet.</p>
          </div>
        ) : (
          Object.entries(groupedData).map(([topic, topicData]: [string, any]) => {
            const isExpanded = expandedTopics[topic] !== false;
            const topicQuestions = Object.values(topicData.subtopics).flat() as any[];
            const topicCompletedCount = topicQuestions.filter(sq => completed.has(sq.question.id)).length;

            return (
              <div key={topic} className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <ProgressTopBar current={topicCompletedCount} total={topicQuestions.length} />
                <button
                  onClick={() => setExpandedTopics(prev => ({ ...prev, [topic]: !isExpanded }))}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[17px] font-black text-slate-800 dark:text-white tracking-tight uppercase flex items-center gap-3">
                      {topic === "Uncategorized" ? "All Questions" : topic}
                      <span className="text-slate-400 dark:text-slate-500 font-bold ml-2">{topicCompletedCount} / {topicQuestions.length}</span>
                    </h3>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-slate-300 transition-transform duration-300", !isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                  <div className="px-8 pb-8 space-y-10">
                    {Object.entries(topicData.subtopics).map(([subtopic, questions]: [string, any]) => {
                      const filteredQs = questions.filter((sq: any) =>
                        (sq.question.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      if (filteredQs.length === 0 && searchQuery) return null;
                      const subtopicCompletedCount = filteredQs.filter((sq: any) => completed.has(sq.question.id)).length;

                      return (
                        <div key={subtopic} className="space-y-0 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden mb-6 last:mb-0 flex flex-col">
                          <ProgressTopBar current={subtopicCompletedCount} total={filteredQs.length} className="h-[3px] bg-orange-100/20" />
                          {subtopic !== "General" && (
                            <div className="px-8 py-3 bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                                {subtopic}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {filteredQs.length} questions
                              </span>
                            </div>
                          )}

                          <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredQs.map((qLink: any) => {
                              const q = qLink.question;
                              const qId = q.id;
                              const isDone = completed.has(qId);
                              const isStarred = starred.has(qId);
                              const curHighlight = highlights[qId] || "default";
                              const highlightClass = HIGHLIGHT_THEMES[curHighlight];

                              return (
                                <div
                                  key={qLink.id}
                                  onClick={() => setSelectedQuestion({ id: qId, data: q })}
                                  className={cn(
                                    "group/row grid grid-cols-12 gap-4 px-8 py-3 items-center bg-white dark:bg-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all cursor-pointer",
                                    highlightClass
                                  )}
                                >
                                  <div className="col-span-1">
                                    <button onClick={(e) => { e.stopPropagation(); onToggleComplete(qId); }} className="focus:outline-none">
                                      {isDone ? (
                                        <CheckCircle2 className="w-[22px] h-[22px] text-[#22c55e] stroke-[2px]" />
                                      ) : (
                                        <Circle className="w-[22px] h-[22px] text-slate-200 dark:text-slate-600 group-hover/row:text-slate-300 dark:group-hover/row:text-slate-500 stroke-[2px] transition-colors" />
                                      )}
                                    </button>
                                  </div>

                                  <div className="col-span-11 md:col-span-4 flex items-center gap-3 min-w-0">
                                    <span className={cn(
                                      "text-sm font-bold ml-1 transition-colors leading-tight",
                                      isDone ? "text-slate-400 dark:text-slate-500 opacity-70 dark:opacity-100" : "text-slate-700 dark:text-white"
                                    )}>
                                      {q.name}
                                    </span>
                                  </div>

                                  <div className="hidden md:flex md:col-span-1 justify-center">
                                    <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", DIFFICULTY_COLOR[q.difficulty] || "text-slate-400")}>
                                      {q.difficulty || "Medium"}
                                    </span>
                                  </div>

                                  <div className="hidden md:flex md:col-span-4 items-center gap-1.5 px-4 justify-center">
                                    {q.topics?.slice(0, 3).map((t: string, i: number) => (
                                      <span key={i} className="px-2 py-0.5 bg-white/5 text-slate-500 dark:text-slate-400 border border-[#1b254b]/10 dark:border-white/10 rounded-md text-[10px] font-bold tracking-tighter whitespace-nowrap">
                                        {t}
                                      </span>
                                    ))}
                                    {q.topics?.length > 3 && <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 rounded-md text-[9px] font-black tracking-tighter shrink-0">+{q.topics.length - 3}</span>}
                                  </div>

                                  <div className="col-span-11 md:col-span-2 flex items-center justify-end gap-1.5 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => onToggleStar(qId)} className={cn("p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-500", isStarred ? "text-amber-400" : "text-slate-400 hover:text-amber-400")}>
                                      <Star className={cn("w-4 h-4", isStarred && "fill-amber-400")} />
                                    </button>
                                    <div className="relative">
                                      <button onClick={() => setPaletteOpen(paletteOpen === qId ? null : qId)} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-500 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <Palette className="w-4 h-4" />
                                      </button>
                                      {paletteOpen === qId && (
                                        <div className="absolute right-0 bottom-full mb-3 z-[110] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in zoom-in-95 origin-bottom-right">
                                          {THEME_OPTIONS.map(opt => (
                                            <button
                                              key={opt.id}
                                              onClick={() => onSetHighlight(qId, opt.id)}
                                              className={cn(
                                                "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                                opt.bg,
                                                curHighlight === opt.id ? "border-slate-800 dark:border-slate-300" : "border-transparent"
                                              )}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => openRevisionModal(qId, q.name)}
                                      className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-500 text-slate-400 hover:text-[#1b254b] dark:hover:text-slate-200"
                                    >
                                      <Clock className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Remove from sheet?")) removeQuestionFromCustomSheet(qLink.id);
                                      }}
                                      className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-500 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
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
          })
        )}
      </div>

      {importModalOpen && (
        <BulkImportModal
          isOpen={importModalOpen}
          sheetId={sheet.id}
          onClose={() => setImportModalOpen(false)}
        />
      )}

      {selectedQuestion && (
        <QuestionDrawer
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          question={selectedQuestion.data}
          isCompleted={completed.has(selectedQuestion.id)}
          isStarred={starred.has(selectedQuestion.id)}
          notes={localNotes[selectedQuestion.id] || ""}
          onSaveNote={async (content) => {
            const qid = selectedQuestion.id;
            setLocalNotes(prev => ({ ...prev, [qid]: content }));
            await updateQuestionNote(qid, content);
            toast.success("Note saved!");
          }}
          onToggleCompletion={() => onToggleComplete(selectedQuestion.id)}
          onToggleStar={() => onToggleStar(selectedQuestion.id)}
          lastRevised={selectedQuestion ? localRevisions[selectedQuestion.id]?.lastRevised : ""}
          nextRevision={selectedQuestion ? localRevisions[selectedQuestion.id]?.nextRevision : ""}
          onUpdateRevision={(field, val) => selectedQuestion && handleRevisionChange(selectedQuestion.id, field, val)}
          onSaveRevision={async () => {
            if (selectedQuestion) await saveRevision(selectedQuestion.id);
          }}
        />
      )}

      {revisionModalOpen && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setRevisionModalOpen(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-[#1b254b] dark:text-white mb-1 tracking-tight">Revision Schedule</h3>
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
                <input
                  type="checkbox"
                  checked={!showRevisionModalPref}
                  onChange={(e) => setShowRevisionModalPref(!e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-slate-200 dark:border-slate-600 checked:bg-[#1b254b] dark:checked:bg-[#2dd4bf] dark:bg-slate-700 transition-all"
                />
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
                  className="px-5 py-2 text-xs font-black text-white bg-[#1b254b] hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-[#1b254b]/20"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
