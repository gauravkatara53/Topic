"use client";

import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  ExternalLink, 
  ChevronRight,
  Github,
  Globe,
  Activity,
  Mail,
  Linkedin,
  Twitter,
  MapPin,
  GraduationCap,
  FileText,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  Plus,
  Info,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, Area, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, Bar,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { refreshPortfolioStats, linkPlatformHandle } from "@/actions/portfolio";

// --- Sub-components (Point to Point accuracy) ---

const CircularProgress = ({ 
  size = 120, 
  strokeWidth = 12, 
  percentage = 0, 
  color = "#2dd4bf", 
  label = "", 
  value = 0 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-[#1b254b] leading-none">{value ?? 0}</span>
        {label && <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{label}</span>}
      </div>
    </div>
  );
};

const Heatmap = ({ submissionCalendar = null }: { submissionCalendar?: any }) => {
  // Process real submission calendar (timestamps: count)
  let processedData: { level: number }[] = [];
  
  try {
    const calendar = typeof submissionCalendar === 'string' ? JSON.parse(submissionCalendar) : submissionCalendar;
    const now = Math.floor(Date.now() / 1000);
    const daySeconds = 86400;
    
    // Generate last 182 days (26 weeks)
    for (let i = 181; i >= 0; i--) {
      const ts = Math.floor((now - i * daySeconds) / daySeconds) * daySeconds;
      const count = calendar?.[ts] || 0;
      processedData.push({
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3
      });
    }
  } catch (e) {
    // Fill with empty if error
    processedData = Array.from({ length: 182 }, () => ({ level: 0 }));
  }

  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
           <span>Submissions <b className="text-[#1b254b]">{processedData.filter(d => d.level > 0).length}</b></span>
           <span>Max.Streak <b className="text-[#1b254b]">90</b></span>
           <span>Current.Streak <b className="text-[#1b254b]">8</b></span>
        </div>
        <div className="flex items-center gap-2">
           <select className="text-[10px] font-black border-none bg-slate-50 px-2 py-1 rounded-lg focus:ring-0">
              <option value="current">Current</option>
           </select>
           <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
      
      <div className="flex gap-1.5 h-32">
        <div className="grid grid-rows-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <span key={d} className="text-[8px] font-bold text-slate-300 h-2.5 w-2 flex items-center">{d}</span>
          ))}
        </div>
        <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1 overflow-hidden">
          {processedData.map((d, i) => (
            <div 
              key={i} 
              className={cn(
                "w-2.5 h-2.5 rounded-sm transition-colors duration-500",
                d.level === 0 ? "bg-slate-50" :
                d.level === 1 ? "bg-emerald-200" :
                d.level === 2 ? "bg-emerald-400" : "bg-emerald-600"
              )}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2 px-6">
         {months.map(m => <span key={m} className="text-[9px] font-bold text-slate-400">{m}</span>)}
      </div>
    </div>
  );
};

// --- Platform Link Input ---
const PlatformLinkAction = ({ platform, onLink }: { platform: any, onLink: (handle: string) => void }) => {
  const [handle, setHandle] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async () => {
    if (!handle) return;
    setIsLinking(true);
    await onLink(handle);
    setIsLinking(false);
    setShowInput(false);
  };

  if (showInput) {
    return (
      <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-300">
        <input 
          autoFocus
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder={`Enter ${platform.label} handle`}
          className="flex-1 text-[11px] font-bold p-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        <button 
          onClick={handleSubmit}
          disabled={isLinking}
          className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setShowInput(false)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
          <XCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowInput(true)}
      className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all flex items-center gap-1.5 border border-indigo-100"
    >
      <LinkIcon className="w-3 h-3" /> Link 
    </button>
  );
};

// --- Main View ---

export function CodingPortfolio({ initialData = null }: { initialData?: any }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portfolio, setPortfolio] = useState(initialData);
  const [stats, setStats] = useState(initialData?.statsCache || {});

  // Refresh stats handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const res = await refreshPortfolioStats();
    if (res.success) {
      setStats(res.stats);
      setPortfolio((prev: any) => ({ ...prev, statsCache: res.stats }));
      toast.success("Portfolio analytics updated!");
    } else {
      toast.error(res.error || "Sync failed");
    }
    setIsRefreshing(false);
  };

  // Link handle handler
  const handleLinkPlatform = async (platformId: string, handle: string) => {
    const res = await linkPlatformHandle(platformId, handle);
    if (res.success) {
      setPortfolio((prev: any) => ({ ...prev, [platformId]: handle }));
      toast.success(`${platformId} linked! Syncing data...`);
      // Trigger a refresh to get the new stats immediately
      setTimeout(() => handleRefresh(), 500);
    } else {
      toast.error(res.error || "Link failed");
    }
  };

  const platforms = [
    { id: "leetcode", label: "LeetCode", color: "text-orange-500", icon: Globe },
    { id: "codestudio", label: "CodeStudio", color: "text-[#1b254b]", icon: Globe },
    { id: "geeksforgeeks", label: "GeeksForGeeks", color: "text-emerald-600", icon: Globe },
    { id: "codechef", label: "CodeChef", color: "text-amber-800", icon: Globe },
    { id: "codeforces", label: "CodeForces", color: "text-blue-500", icon: Globe },
    { id: "hackerrank", label: "HackerRank", color: "text-emerald-500", icon: Globe },
    { id: "atcoder", label: "AtCoder", color: "text-slate-800", icon: Globe },
  ];

  const chartData = stats?.history || [
    { rating: 1410 }, { rating: 1415 }, { rating: 1412 }, { rating: 1414 }, { rating: 1515 }, { rating: 1533 }
  ];

  const topicAnalysis = stats?.topicAnalysis || [
    { name: "Arrays", val: 250 }, { name: "Algorithms", val: 154 }, { name: "DP", val: 102 },
    { name: "Trees", val: 93 }, { name: "Hash", val: 87 }, { name: "String", val: 83 },
    { name: "Sorting", val: 68 }, { name: "DFS", val: 65 }, { name: "Lists", val: 49 }, { name: "Binary", val: 48 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-5 py-6 font-sans bg-[#f8fafc]/50 min-h-screen p-4 select-none">
      
      {/* Sidebar (Left Column) */}
      <div className="col-span-12 lg:col-span-3 space-y-5">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm text-center relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
                <div className="w-10 h-5 bg-[#2dd4bf] rounded-full flex items-center px-0.5 shadow-inner"><div className="w-4 h-4 bg-white rounded-full shadow-sm ml-auto" /></div>
                <span className="text-[10px] font-bold text-slate-400">Public Profile</span>
             </div>
             <div 
               onClick={handleRefresh}
               className={cn("p-2 bg-orange-50 rounded-xl cursor-pointer transition-all active:scale-90 flex items-center", isRefreshing && "bg-orange-100")}
             >
                <RefreshCw className={cn("w-4 h-4 text-orange-500", isRefreshing && "animate-spin")} />
             </div>
          </div>

          <div className="relative inline-block mt-4 mb-4 group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-5xl font-black shadow-xl border-4 border-white transition-transform group-hover:scale-105">
               {portfolio?.name?.charAt(0) || "G"}
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-xl shadow-lg border border-slate-50 cursor-pointer hover:bg-slate-50">
               <FileText className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>

          <h2 className="text-xl font-black text-[#1b254b] uppercase tracking-tight">{portfolio?.name || "GAURAV KATARA"}</h2>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 mt-1 cursor-pointer hover:underline">
             <span>@{portfolio?.handle || "codewithme"}</span>
             <BadgeCheck className="w-4 h-4 fill-indigo-600 text-white" />
          </div>

          <button className="w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-black rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]">
             Get your {portfolio?.handle ? "Portfolio" : "Codollo"} Card
          </button>

          <div className="flex justify-center gap-4 mt-8">
             {[Mail, Linkedin, Twitter, Globe, FileText].map((Icon, i) => (
                <Icon key={i} className="w-5 h-5 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer" />
             ))}
          </div>

          <div className="mt-8 space-y-3 text-left">
             <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500">
                <MapPin className="w-4 h-4 text-slate-300" />
                <span>India</span>
             </div>
             <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 truncate">
                <GraduationCap className="w-4 h-4 text-slate-300" />
                <span>National Institute of Technology</span>
             </div>
          </div>
        </div>

        {/* Platforms List */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-[#1b254b] uppercase tracking-wider">About</h3>
           </div>

           <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                 <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Problem Solving Stats</span>
                 <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all" />
              </div>
              
              <div className="space-y-4 pl-1">
                {platforms.map(p => {
                  const isLinked = portfolio?.[p.id];
                  return (
                    <div key={p.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-1.5 h-1.5 rounded-full", isLinked ? p.color : "bg-slate-200")} />
                          <span className={cn("text-[11px] font-bold", isLinked ? "text-slate-600" : "text-slate-300")}>{p.label}</span>
                       </div>
                       <div className="flex gap-2">
                          {isLinked ? (
                             <>
                                <BadgeCheck className="w-4 h-4 fill-emerald-500 text-white" />
                                <ExternalLink className="w-3.5 h-3.5 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer" />
                             </>
                          ) : (
                             <PlatformLinkAction platform={p} onLink={(h) => handleLinkPlatform(p.id, h)} />
                          )}
                       </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-50">
                 <div className="flex items-center justify-between mb-4 group cursor-pointer">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Development Stats</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Github className={cn("w-4 h-4", portfolio?.github ? "text-slate-900" : "text-slate-300")} />
                       <span className={cn("text-[11px] font-bold", portfolio?.github ? "text-slate-600" : "text-slate-300")}>GitHub</span>
                    </div>
                    {portfolio?.github ? (
                       <BadgeCheck className="w-4 h-4 fill-emerald-500 text-white" />
                    ) : (
                       <PlatformLinkAction platform={{ id: "github", label: "GitHub" }} onLink={(h) => handleLinkPlatform("github", h)} />
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1b254b]">Leaderboard</h4>
              <Link href="#" className="text-[10px] font-bold text-indigo-600 hover:underline">How it works?</Link>
           </div>
           
           <div className="space-y-1 mb-6">
              <div className="flex items-center gap-2">
                 <span className="text-[13px] font-black text-slate-800">Global Rank</span>
                 <div className="flex gap-1 ml-auto">
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all shadow-sm"><ChevronLeft className="w-3 h-3 text-slate-400" /></div>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all shadow-sm"><ChevronRight className="w-3 h-3 text-slate-400" /></div>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Based on Activity</p>
           </div>

           <div className="flex items-center gap-4 mb-8">
              <Activity className="w-10 h-10 text-[#1b254b]" />
              <span className="text-5xl font-black text-[#1b254b] tracking-tighter">{portfolio?.globalRank || "598"}</span>
           </div>

           <button className="w-full py-3.5 bg-orange-500 text-white text-[12px] font-black rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest">
              View Leaderboard
           </button>
        </div>

        {/* Sidebar Footer */}
        <div className="px-6 space-y-2 text-[10px] font-bold text-slate-400 pb-10">
           <div className="flex justify-between">
              <span>Profile Views:</span>
              <span className="text-orange-500">2</span>
           </div>
           <div className="flex justify-between">
              <span>Last Refresh:</span>
              <span className="text-slate-600">{isRefreshing ? "Syncing..." : "Updated recently"}</span>
           </div>
           <div className="flex justify-between">
              <span>Profile Visibility:</span>
              <span className="text-slate-600">Public</span>
           </div>
        </div>

      </div>

      {/* Main Content (Middle + Right Column) */}
      <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-5">
         
         {/* Top Stats Cards */}
         <div className="md:col-span-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative hover:shadow-md transition-all">
            <Info className="absolute top-4 right-4 w-4 h-4 text-slate-200 cursor-pointer" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Questions</h4>
            <span className="text-6xl font-black text-[#1b254b] tracking-tighter">{portfolio?.totalSolved || 0}</span>
         </div>

         <div className="md:col-span-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative hover:shadow-md transition-all">
            <Info className="absolute top-4 right-4 w-4 h-4 text-slate-200 cursor-pointer" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Active Days</h4>
            <span className="text-6xl font-black text-[#1b254b] tracking-tighter">{portfolio?.activeDays || 0}</span>
         </div>

         <div className="md:col-span-1">
            <Heatmap submissionCalendar={stats?.leetcode?.submissionCalendar} />
         </div>

         {/* Center Column (Middle Cards) */}
         <div className="md:col-span-2 space-y-5">
            
            {/* Contests Summary */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm grid grid-cols-2 gap-8 items-center">
               <div className="text-center">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Contests</h4>
                  <span className="text-7xl font-black text-[#1b254b]">{stats?.leetcode?.contestsCount || 0}</span>
               </div>
               <div className="space-y-4">
                  {platforms.slice(0, 4).map(c => {
                    const Icon = c.icon;
                    return (
                      <div key={c.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Icon className={cn("w-5 h-5", portfolio?.[c.id] ? "text-indigo-400" : "text-slate-200")} />
                            <span className={cn("text-[11px] font-bold", portfolio?.[c.id] ? "text-slate-800" : "text-slate-300")}>{c.label}</span>
                         </div>
                         <span className="text-[12px] font-black text-[#1b254b]">{portfolio?.[c.id] ? "3" : "0"}</span>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Rating Main Chart */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex gap-10">
                     <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Rating</h4>
                        <span className="text-2xl font-black text-[#1b254b]">{stats?.leetcode?.rating || "Link Account"}</span>
                     </div>
                     <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-1">Latest Contest</h4>
                        <p className="text-[13px] font-black text-[#1b254b]">{stats?.leetcode?.latestContest || "No dynamic history"}</p>
                        <p className="text-[10px] font-bold text-slate-400">Rank: {stats?.leetcode?.rank || "---"}</p>
                     </div>
                  </div>
               </div>

               <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis hide />
                        <YAxis 
                          domain={['dataMin - 50', 'dataMax + 20']} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="rating" 
                          stroke="#f97316" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorMain)" 
                          animationDuration={2000}
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Topic Analysis BarChart */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-black text-[#1b254b]">DSA Topic Analysis</h4>
                  <Info className="w-4 h-4 text-slate-200 cursor-pointer" />
               </div>

               <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart 
                        layout="vertical" 
                        data={topicAnalysis} 
                        margin={{ left: 60, right: 40 }}
                     >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          width={140}
                        />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="val" fill="#4f75ff" radius={[0, 4, 4, 0]} barSize={16}>
                           {topicAnalysis.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#4f75ff" : "#818cf8"} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <button className="mt-8 mx-auto block text-indigo-600 font-extrabold text-xs hover:underline uppercase tracking-widest">show more</button>
            </div>

         </div>

         {/* Right Sidebar Column */}
         <div className="md:col-span-1 space-y-5">
            
            {/* Problems Solved Progress Rings */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
               <h3 className="text-md font-black text-[#1b254b] mb-6">Problems Solved</h3>
               
               <div className="space-y-12">
                  <div className="flex flex-col items-center">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-6">
                        Fundamentals <Info className="w-3.5 h-3.5 text-slate-200" />
                     </h4>
                     <div className="relative">
                        <CircularProgress size={160} strokeWidth={14} percentage={65} color="#2dd4bf" value={stats?.leetcode?.fundamentals || 0} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                           <CircularProgress size={110} strokeWidth={14} percentage={40} color="#facc15" label="" value={undefined} />
                        </div>
                     </div>
                     <div className="w-full mt-8 space-y-3">
                        <div className="bg-slate-50 p-2 px-4 rounded-xl flex justify-between items-center">
                           <span className="text-[11px] font-black text-emerald-600">GFG</span>
                           <span className="text-[11px] font-black text-[#1b254b]">{portfolio?.geeksforgeeks ? "9" : "0"}</span>
                        </div>
                        <div className="bg-slate-50 p-2 px-4 rounded-xl flex justify-between items-center border border-orange-100">
                           <span className="text-[11px] font-black text-orange-500">HackerRank</span>
                           <span className="text-[11px] font-black text-[#1b254b]">{portfolio?.hackerrank ? "4" : "0"}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col items-center">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">DSA</h4>
                     <CircularProgress 
                        size={160} 
                        strokeWidth={14} 
                        percentage={(stats?.leetcode?.difficultyCounts?.[0]?.count / 1000) * 100} 
                        color="#facc15" 
                        value={portfolio?.totalSolved || 0} 
                     />
                     <div className="w-full mt-8 space-y-3">
                        {[{ l: "Easy", k: "Easy", c: "text-emerald-500" }, { l: "Medium", k: "Medium", c: "text-orange-500" }, { l: "Hard", k: "Hard", c: "text-rose-500" }].map(t => {
                          const val = stats?.leetcode?.difficultyCounts?.find((d: any) => d.difficulty === t.k)?.count || 0;
                          return (
                           <div key={t.l} className="bg-slate-50 p-2 px-4 rounded-xl flex justify-between items-center">
                              <span className={cn("text-[11px] font-black", t.c)}>{t.l}</span>
                              <span className="text-[11px] font-black text-[#1b254b]">{val}</span>
                           </div>
                          );
                        })}
                     </div>
                  </div>

                  <div className="flex flex-col items-center pb-4">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Competitive Programming</h4>
                     <CircularProgress size={160} strokeWidth={14} percentage={30} color="#2dd4bf" value={stats?.codechef?.rating || 0} />
                     <div className="w-full mt-8 flex justify-between items-center bg-slate-50 p-2 px-4 rounded-xl">
                        <span className="text-[11px] font-black text-emerald-600">Codechef</span>
                        <span className="text-[11px] font-black text-[#1b254b]">{stats?.codechef?.rating || 0}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Contest Rankings */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
               <h3 className="text-md font-black text-[#1b254b] mb-10 text-center uppercase tracking-widest">Contest Rankings</h3>
               
               <div className="space-y-12">
                  {[
                    { p: "LEETCODE", k: "leetcode", r: stats?.leetcode?.rating, icon: Globe },
                    { p: "CODECHEF", k: "codechef", r: stats?.codechef?.rating, icon: Globe },
                    { p: "CODEFORCES", k: "codeforces", r: stats?.codeforces?.rating, label: "Newbie", icon: Globe },
                    { p: "CODESTUDIO", r: 1680, label: "Achiever", icon: Globe },
                  ].map(p => {
                    const Icon = p.icon;
                    const isLinked = portfolio?.[p.k as any] || p.r;
                    return (
                      <div key={p.p} className="flex items-center gap-6 group">
                         <div className={cn("w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-2 transition-transform group-hover:scale-110", isLinked ? "bg-indigo-50" : "bg-slate-50 opacity-50")}>
                            <Icon className={cn("w-full h-full", isLinked ? "text-indigo-400" : "text-slate-300")} />
                         </div>
                         <div className="flex-1">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.p}</h5>
                            <div className="flex items-baseline gap-2">
                               {isLinked ? (
                                  <>
                                     {p.label && <span className="text-sm font-black text-slate-500">{p.label}</span>}
                                     <span className="text-3xl font-black text-[#1b254b] tracking-tighter">{p.r || "Linked"}</span>
                                  </>
                               ) : (
                                  <span className="text-sm font-bold text-slate-300">Not Linked</span>
                               )}
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

         </div>

      </div>

      <style jsx>{`
        .clip-hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
