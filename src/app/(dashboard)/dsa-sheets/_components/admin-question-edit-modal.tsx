"use client";

import { useState, useEffect } from "react";
import { X, Save, Edit3 } from "lucide-react";
import { updateDSASheetQuestion, updatePopularQuestion } from "@/actions/admin-questions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminQuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  type: "DSASheet" | "Popular";
  onSaveSuccess: (updatedQuestion: any) => void;
}

export function AdminQuestionEditModal({ isOpen, onClose, question, type, onSaveSuccess }: AdminQuestionEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    difficulty: "Medium",
    topics: "",
  });

  useEffect(() => {
    if (question) {
      setFormData({
        title: type === "DSASheet" ? question.title || "" : question.name || "",
        url: type === "DSASheet" ? question.url || "" : question.problemUrl || "",
        difficulty: question.difficulty || "Medium",
        topics: type === "DSASheet" ? (question.tags || "") : (question.topics ? question.topics.join(", ") : ""),
      });
    }
  }, [question, type]);

  if (!isOpen || !question) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "DSASheet") {
        const updated = await updateDSASheetQuestion(question.id, {
          title: formData.title,
          url: formData.url,
          difficulty: formData.difficulty,
          tags: formData.topics,
        });
        toast.success("Question updated successfully!");
        onSaveSuccess({
          ...question,
          title: updated.title,
          url: updated.url,
          difficulty: updated.difficulty,
          tags: updated.tags,
        });
      } else {
        const topicsArray = formData.topics.split(",").map((t) => t.trim()).filter(Boolean);
        const updated = await updatePopularQuestion(question.id, {
          name: formData.title,
          problemUrl: formData.url,
          difficulty: formData.difficulty,
          topics: topicsArray,
        });
        toast.success("Question updated successfully!");
        onSaveSuccess({
          ...question,
          name: updated.name,
          problemUrl: updated.problemUrl,
          difficulty: updated.difficulty,
          topics: updated.topics,
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to update question", error);
      toast.error("Failed to update question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Edit Question</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Only</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Question Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              URL Link
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Topics / Tags
            </label>
            <input
              type="text"
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              placeholder="e.g. Array, Two Pointers, Hash Table"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">Comma separated list of topics.</p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
