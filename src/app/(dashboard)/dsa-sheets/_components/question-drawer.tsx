"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, ExternalLink, FileText, CheckCircle2, Circle, Save, BookOpen, Tags, Star, Clock, Layout, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateQuestionNote } from "@/actions/dsa-sheets";

interface QuestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  isCompleted: boolean;
  isStarred: boolean;
  notes: string;
  onSaveNote: (note: string) => void;
  onToggleCompletion: () => void;
  onToggleStar: () => void;
  alternateQuestions?: any[];
  popularSheets?: string[];
}

export function QuestionDrawer({
  isOpen,
  onClose,
  question,
  isCompleted,
  isStarred,
  notes: initialNotes,
  onSaveNote,
  onToggleCompletion,
  onToggleStar,
  alternateQuestions = [],
  popularSheets = []
}: QuestionDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "notes">("overview");
  const [localNote, setLocalNote] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalNote(initialNotes);
  }, [initialNotes, question?.id]);

  if (!question) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveNote(localNote);
      toast.success("Notes saved successfully");
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-transparent z-[200] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[201] transition-transform duration-500 ease-in-out transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-600 border border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">Question Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleStar}
              className={cn(
                "p-2 rounded-lg transition-all border",
                isStarred 
                  ? "bg-amber-50 border-amber-200 text-amber-500" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-amber-500"
              )}
            >
              <Star className={cn("w-5 h-5", isStarred && "fill-amber-500")} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#2dd4bf] hover:bg-[#25bca8] text-white text-sm font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>

        {/* Question Banner */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-start gap-4 mb-6">
            <button 
              onClick={onToggleCompletion}
              className={cn(
                "mt-0.5 transition-all duration-300",
                isCompleted ? "text-[#2dd4bf]" : "text-slate-200 hover:text-[#2dd4bf]/40"
              )}
            >
              {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
            </button>
            <div>
              <a 
                href={question.problemUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xl font-bold text-[#1b254b] leading-tight hover:text-[#2dd4bf] transition-colors flex items-center gap-2 group"
              >
                {question.name || question.title}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <div className="flex items-center gap-3 mt-2.5">
                <span className={cn(
                  "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  question.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  question.difficulty === "Medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                  "bg-rose-50 text-rose-600 border border-rose-100"
                )}>
                  {question.difficulty}
                </span>
                <div className="flex items-center gap-1.5">
                  {(question.topics || []).slice(0, 3).map((topic: string, i: number) => (
                    <span key={i} className="text-[10px] font-medium text-slate-400">
                      • {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("overview")}
              className={cn(
                "pb-3 text-sm font-semibold transition-all border-b-2 relative",
                activeTab === "overview" 
                  ? "text-[#2dd4bf] border-[#2dd4bf]" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={cn(
                "pb-3 text-sm font-semibold transition-all border-b-2 relative",
                activeTab === "notes" 
                  ? "text-[#2dd4bf] border-[#2dd4bf]" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              Notes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {activeTab === "overview" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Question Details Section */}
              <section>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Question Details</h3>
                <div className="grid grid-cols-2 gap-8 bg-slate-50/50 rounded-xl p-6 border border-slate-100/50">
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1.5">Difficulty</span>
                      <span className={cn(
                        "text-sm font-semibold",
                        question.difficulty === "Easy" ? "text-emerald-500" :
                        question.difficulty === "Medium" ? "text-amber-500" :
                        "text-rose-500"
                      )}>{question.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1.5">Topics</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(question.topics || []).map((t: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-1.5">Popular Sheets</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {popularSheets.length > 0 ? popularSheets.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-slate-100 rounded text-[10px] font-medium text-slate-500">
                            {s}
                          </span>
                        )) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">Not in popular sheets</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Custom Details Section */}
              <section>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Custom Details</h3>
                <div className="space-y-4 bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Additional Tags</span>
                    <button className="text-[10px] font-bold text-[#2dd4bf] hover:text-[#25bca8] transition-colors uppercase tracking-tight">Add Tags</button>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className="text-sm font-medium text-slate-600">Custom Sheets</span>
                    <button className="text-[10px] font-bold text-[#2dd4bf] hover:text-[#25bca8] transition-colors uppercase tracking-tight">Add to Sheet</button>
                  </div>
                </div>
              </section>

              {/* Alternate Questions Section */}
              {alternateQuestions.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Alternate Questions</h3>
                  <div className="space-y-2">
                    {alternateQuestions.map((alt, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <Circle className="w-4 h-4 text-slate-200" />
                          <span className="text-sm font-bold text-slate-700 group-hover:text-[#2dd4bf] transition-colors">{alt.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold uppercase",
                            alt.difficulty === "Easy" ? "text-emerald-500" :
                            alt.difficulty === "Medium" ? "text-amber-500" :
                            "text-rose-500"
                          )}>{alt.difficulty}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex-1 flex flex-col bg-slate-50/50 border border-slate-100 rounded-xl overflow-hidden focus-within:border-[#2dd4bf]/30 transition-all">
                  <textarea 
                    value={localNote}
                    onChange={(e) => setLocalNote(e.target.value)}
                    placeholder="Capture your thoughts or optimized approaches here..."
                    className="w-full flex-1 p-6 bg-transparent text-sm font-medium text-slate-600 outline-none resize-none leading-relaxed placeholder:text-slate-400 min-h-[450px]"
                  />
                  <div className="p-3 bg-white/50 border-t border-slate-100/50 flex justify-end">
                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">{localNote.length} characters</span>
                  </div>
                </div>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <p className="text-[11px] font-medium text-slate-400 italic">Your notes are private and encrypted.</p>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-[#1b254b] hover:bg-[#111836] text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#1b254b]/10 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save solution
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
