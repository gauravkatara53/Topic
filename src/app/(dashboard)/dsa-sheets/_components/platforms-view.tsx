"use client";

import React, { useState } from "react";
import { 
  Github, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  ChevronRight,
  Info,
  Globe,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { linkPlatformHandle } from "@/actions/portfolio";

const PLATFORMS_CONFIG = [
  { id: "github", name: "GitHub", category: "Development", icon: Github, placeholder: "https://github.com/username" },
  { id: "leetcode", name: "LeetCode", category: "Problem Solving", icon: Globe, placeholder: "https://leetcode.com/u/username" },
  { id: "codestudio", name: "CodeStudio", category: "Problem Solving", icon: Globe, placeholder: "https://www.naukri.com/code360/profile/username" },
  { id: "geeksforgeeks", name: "GeeksForGeeks", category: "Problem Solving", icon: Globe, placeholder: "https://www.geeksforgeeks.org/user/username" },
  { id: "interviewbit", name: "InterviewBit", category: "Problem Solving", icon: Globe, placeholder: "https://www.interviewbit.com/profile/username" },
  { id: "codechef", name: "CodeChef", category: "Problem Solving", icon: Globe, placeholder: "https://www.codechef.com/users/username" },
  { id: "codeforces", name: "CodeForces", category: "Problem Solving", icon: Globe, placeholder: "https://codeforces.com/profile/username" },
  { id: "hackerrank", name: "HackerRank", category: "Problem Solving", icon: Globe, placeholder: "https://www.hackerrank.com/profile/username" },
  { id: "atcoder", name: "AtCoder", category: "Problem Solving", icon: Globe, placeholder: "https://atcoder.jp/users/username" },
];

export function PlatformsView({ initialData = null }: { initialData?: any }) {
  const [handles, setHandles] = useState<Record<string, string>>({
    github: initialData?.github || "",
    leetcode: initialData?.leetcode || "",
    codestudio: initialData?.codestudio || "",
    geeksforgeeks: initialData?.geeksforgeeks || "",
    interviewbit: initialData?.interviewbit || "",
    codechef: initialData?.codechef || "",
    codeforces: initialData?.codeforces || "",
    hackerrank: initialData?.hackerrank || "",
    atcoder: initialData?.atcoder || "",
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSave = async (id: string) => {
    const url = handles[id];
    if (!url) return;
    
    setLoadingId(id);
    const res = await linkPlatformHandle(id, url);
    setLoadingId(null);

    if (res.success) {
      toast.success(`${id} profile linked!`);
    } else {
      toast.error(res.error || "Failed to link");
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    const res = await linkPlatformHandle(id, ""); // Empty URL to remove
    setLoadingId(null);
    
    if (res.success) {
      const newHandles = { ...handles };
      delete newHandles[id];
      setHandles(newHandles);
      toast.info(`${id} profile removed.`);
    }
  };

  const renderSection = (category: string) => {
    const items = PLATFORMS_CONFIG.filter(p => p.category === category);
    
    return (
      <div key={category} className="space-y-6">
        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-widest pl-1">{category}</h3>
        <div className="space-y-4">
          {items.map(p => {
            const hasValue = !!handles[p.id];
            
            return (
              <div key={p.id} className="group flex flex-col md:flex-row md:items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <p.icon className={cn("w-5 h-5", hasValue ? "text-indigo-600" : "text-slate-400")} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
                      {p.name}
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="text" 
                    value={handles[p.id] || ""}
                    onChange={(e) => setHandles({ ...handles, [p.id]: e.target.value })}
                    placeholder={p.placeholder}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                  
                  {hasValue ? (
                    <div className="flex items-center gap-2">
                       <div className="p-2 text-emerald-500 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                       </div>
                       <button 
                         onClick={() => handleDelete(p.id)}
                         className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSave(p.id)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                    >
                      Link Profile
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Platforms</h2>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">You can update and verify your platform details here.</p>
      </div>

      <div className="space-y-12 pb-20">
        {renderSection("Development")}
        <div className="h-[1px] bg-slate-100" />
        {renderSection("Problem Solving")}
      </div>

      <div className="fixed bottom-8 right-8">
         <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 max-w-sm border border-indigo-800 animate-in slide-in-from-right-4">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex flex-col">
               <p className="text-xs font-bold leading-relaxed">
                  If you are getting a warning, please check the <span className="underline cursor-pointer">FAQ</span> to know why this happens and how to fix it.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
