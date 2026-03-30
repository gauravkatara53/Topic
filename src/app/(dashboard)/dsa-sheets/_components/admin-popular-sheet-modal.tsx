"use client";

import { useState } from "react";
import { X, Upload, FileText, Info, Loader2, FolderOpen, Save, Globe, Type, Tag } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { createPopularSheet, importPopularQuestions } from "@/actions/admin-sheets";
import { cn } from "@/lib/utils";

interface AdminPopularSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPopularSheetModal({ isOpen, onClose }: AdminPopularSheetModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: Import

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleCreateAndUpload = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and Slug are required");
      return;
    }
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Create the sheet
      const sheet = await createPopularSheet(name, description, slug);
      
      // 2. Parse and Import questions
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result;
        let questions: any[] = [];

        try {
          if (file.name.endsWith(".csv")) {
            const text = data as string;
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            questions = parsed.data.map((row: any) => ({
              problemUrl: (row.problemUrl || row.Url || row.url || row.Link || row.link || "#").trim(),
              topic: (row.topic || row.Topic || "Uncategorized").trim(),
              subTopic: (row.subTopic || row.SubTopic || "General").trim(),
              platform: (row.platform || row.Platform || "").trim(),
              topics: (row.topics || row.Tags || "").trim(),
              title: (row.title || row.Title || row.Name || row.Problem || row.Question || "").trim(),
              difficulty: (row.difficulty || row.Difficulty || row.level || row.Level || "").trim()
            })).filter(q => q.problemUrl !== "#" || q.title);
          } else {
            const binaryStr = data as string;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheetData = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheetData) as any[];
            
            questions = json.map(row => ({
              problemUrl: String(row.problemUrl || row.Url || row.url || row.Link || row.link || "#").trim(),
              topic: String(row.topic || row.Topic || "Uncategorized").trim(),
              subTopic: String(row.subTopic || row.SubTopic || "General").trim(),
              platform: String(row.platform || row.Platform || "").trim(),
              topics: String(row.topics || row.Tags || "").trim(),
              title: String(row.title || row.Title || row.Name || row.Problem || row.Question || "").trim(),
              difficulty: String(row.difficulty || row.Difficulty || row.level || row.Level || "").trim()
            })).filter(q => q.problemUrl !== "#" || q.title);
          }

          if (questions.length === 0) {
            toast.error("No valid questions found.");
            setIsUploading(false);
            return;
          }

          const res = await importPopularQuestions(sheet.id, questions);
          if (res.success) {
            toast.success(`Created sheet and imported ${res.count} questions`);
            onClose();
          }
        } catch (err) {
          toast.error("Failed to import questions");
        } finally {
          setIsUploading(false);
        }
      };

      if (file.name.endsWith(".csv")) reader.readAsText(file);
      else reader.readAsBinaryString(file);

    } catch (err) {
      toast.error("Failed to create sheet");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1b254b]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 pb-6 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-[#1b254b] tracking-tight">Create Popular Sheet</h2>
            <p className="text-sm text-slate-400 font-bold mt-1">Admin Only • Global Popular Sheet</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Step 1: Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-indigo-500" /> Sheet Name
              </label>
              <input 
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. Love Babbar 450"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-500" /> URL Slug
              </label>
              <input 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all font-mono"
                placeholder="love-babbar-450"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-500" /> Description
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-amber-500 outline-none transition-all min-h-[100px]"
                placeholder="Tell users what this sheet is about..."
              />
            </div>
          </div>

          {/* Step 2: Excel Import section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Questions Data (Excel/CSV)</h3>
                <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                   <Info className="w-3 h-3" /> multi-column support
                </div>
            </div>

            <div className="border border-[#fed7aa] bg-[#fff7ed]/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-[#ffedd5] border-b border-[#fed7aa]">
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">problemUrl</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">title</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">topic</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">subTopic</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">platform</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">difficulty</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700">topics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fed7aa]/50 bg-white/30">
                  <tr>
                    <td className="px-4 py-2 text-slate-500 truncate max-w-[100px]">https://...</td>
                    <td className="px-4 py-2 text-slate-600 font-bold">Two Sum</td>
                    <td className="px-4 py-2 text-slate-500 italic">Arrays</td>
                    <td className="px-4 py-2 text-slate-500 italic">Basics</td>
                    <td className="px-4 py-2 text-slate-500">LeetCode</td>
                    <td className="px-4 py-2 text-slate-500 text-emerald-600 font-bold">Easy</td>
                    <td className="px-4 py-2 text-slate-500 truncate max-w-[80px]">Array, Hash...</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            <div className={cn(
               "border-2 border-dashed rounded-[24px] p-6 transition-all flex items-center justify-between group",
               file ? "border-[#2dd4bf] bg-[#f0fdfa]" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
            )}>
              <div className="flex items-center gap-5">
                 <div className={cn(
                   "p-4 rounded-2xl transition-all shadow-sm",
                   file ? "bg-[#2dd4bf] text-white" : "bg-white text-slate-300 border border-slate-100"
                 )}>
                    {file ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                 </div>
                 <div>
                    <p className="text-[15px] font-black text-slate-700 truncate max-w-[280px]">
                      {file ? file.name : "Select your Excel data"}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : ".xlsx, .xls, .csv allowed"}
                    </p>
                 </div>
              </div>
              <label className="cursor-pointer px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 text-[13px] font-black rounded-2xl transition-all border border-slate-200 shadow-sm active:translate-y-0.5 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Browse
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            
            <button 
              onClick={handleCreateAndUpload}
              disabled={isUploading || !file || !name}
              className="w-full py-5 bg-[#1b254b] hover:bg-slate-800 text-white font-black rounded-[24px] transition-all shadow-xl shadow-[#1b254b]/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] text-[15px]"
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Data...</>
              ) : (
                <><Save className="w-5 h-5" /> Finalize & Create Sheet</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
