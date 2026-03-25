"use client";

import { useState } from "react";
import { X, Upload, FileText, Info, Loader2, FolderOpen } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { importCustomQuestions } from "@/actions/custom-sheets";
import { cn } from "@/lib/utils";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: string;
}

export function BulkImportModal({ isOpen, onClose, sheetId }: BulkImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 1024 * 1024) {
        toast.error("File size exceeds 1MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      let questions: any[] = [];

      try {
        if (file.name.endsWith(".csv")) {
          const text = data as string;
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
          questions = parsed.data.map((row: any) => ({
            problemUrl: (row.problemUrl || row.Url || row.url)?.trim(),
            topic: (row.topic || row.Topic)?.trim(),
            subTopic: (row.subTopic || row.SubTopic)?.trim()
          })).filter(q => q.problemUrl);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const binaryStr = data as string;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet) as any[];
          
          questions = json.map(row => ({
            problemUrl: (row.problemUrl || row.Url || row.url)?.trim(),
            topic: (row.topic || row.Topic)?.trim(),
            subTopic: (row.subTopic || row.SubTopic)?.trim()
          })).filter(q => q.problemUrl);
        }

        if (questions.length === 0) {
          toast.error("No valid questions found. Ensure 'problemUrl' column exists.");
          setIsUploading(false);
          return;
        }

        const res = await importCustomQuestions(sheetId, questions);
        if (res.success) {
          toast.success(`Successfully imported ${res.count} questions`);
          onClose();
        }
      } catch (err) {
        console.error("Import error:", err);
        toast.error("Failed to parse or import file. Please check the format.");
      } finally {
        setIsUploading(false);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#1b254b]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* Header */}
        <div className="p-8 pb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#1b254b] tracking-tight">Bulk Import to Sheet</h2>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-8">
          {/* Format Guide */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Format :</h3>
            <div className="border border-[#fed7aa] bg-[#fff7ed]/50 rounded-2xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[#ffedd5] border-b border-[#fed7aa]">
                    <th className="px-5 py-3 text-left font-bold text-slate-700">problemUrl</th>
                    <th className="px-5 py-3 text-left font-bold text-slate-700">topic</th>
                    <th className="px-5 py-3 text-left font-bold text-slate-700">subTopic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fed7aa]/50">
                  <tr className="bg-white/50">
                    <td className="px-5 py-3 text-slate-600 font-semibold truncate max-w-[200px]">https://leetcode.com/problems/two-sum</td>
                    <td className="px-5 py-3 text-slate-600 font-semibold italic">topic1</td>
                    <td className="px-5 py-3 text-slate-600 font-semibold italic">subTopic1</td>
                  </tr>
                  <tr className="bg-white/50">
                    <td className="px-5 py-3 text-slate-600 font-semibold truncate max-w-[200px]">https://leetcode.com/problems/three-sum</td>
                    <td className="px-5 py-3 text-slate-600 font-semibold italic">topic2</td>
                    <td className="px-5 py-3 text-slate-600 font-semibold italic">subTopic2</td>
                  </tr>
                  <tr className="bg-white/50">
                    <td className="px-5 py-3 text-slate-600 font-semibold truncate max-w-[200px]">https://www.interviewbit.com/problems/gas-station</td>
                    <td className="px-5 py-3 text-slate-600 font-semibold italic">topic3</td>
                    <td className="px-5 py-3 text-slate-600 font-semibold italic">subTopic3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-black text-slate-700 flex items-center gap-2">
              Note:
            </h3>
            <ul className="text-sm text-slate-500 space-y-2 font-medium ml-1">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">•</span>
                <span>The <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[12px] font-bold text-slate-700">problemUrl</code> field is <strong>mandatory</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">•</span>
                <span>If uploading a <strong>.csv</strong> file, the header must include: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[12px] font-bold text-slate-700">problemUrl, topic, subTopic</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">•</span>
                <span>If uploading a <strong>.xlsx</strong> file, the columns must appear in this exact order: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[12px] font-bold text-slate-700">problemUrl, topic, subTopic</code>.</span>
              </li>
            </ul>
          </div>

          {/* File Picker */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800">Select File</h3>
            <div className={cn(
               "border-2 border-dashed rounded-2xl p-4 transition-all flex items-center justify-between group",
               file ? "border-[#2dd4bf] bg-[#f0fdfa]" : "border-slate-200 hover:border-orange-300 bg-slate-50/50"
            )}>
              <div className="flex items-center gap-4">
                 <div className={cn(
                   "p-3.5 rounded-2xl transition-all",
                   file ? "bg-[#2dd4bf] text-white shadow-lg shadow-[#2dd4bf]/20" : "bg-white text-slate-400 border border-slate-100 group-hover:text-orange-400"
                 )}>
                    {file ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-[280px]">
                      {file ? file.name : "Choose a file to upload"}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supported files: .xlsx or .csv Max: 1 MB"}
                    </p>
                 </div>
              </div>
              <label className="cursor-pointer px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-2xl transition-all border border-slate-200 shadow-sm active:translate-y-0.5 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Browse
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            
            <button 
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full py-4.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
