"use client";

import { PlacementAnalytics } from "@/types/placement";
import {
  Briefcase, Calendar, Clock, TrendingUp, CheckCircle2, XCircle,
  Building2, Users, GraduationCap, Globe, Trophy,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
}

function StatCard({ title, value, icon, gradient, iconBg, change, changeType }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 border border-white/20 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-default ${gradient}`}
    >
      {/* Background glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white group-hover:opacity-20 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${iconBg} shadow-sm`}>
          {icon}
        </div>
        {change && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              changeType === "up" ? "bg-white/20 text-white/90" :
              changeType === "down" ? "bg-white/10 text-white/70" :
              "bg-white/10 text-white/70"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <p className="text-2xl font-black text-white leading-none mb-1 tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] font-semibold text-white/75 leading-tight">{title}</p>
    </div>
  );
}

interface StatsCardsProps {
  analytics: PlacementAnalytics;
}

export function StatsCards({ analytics }: StatsCardsProps) {
  const cards: StatCardProps[] = [
    {
      title: "Total Applications",
      value: analytics.totalApplications,
      icon: <Briefcase className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-[#1b254b] to-[#2b3a7a]",
      iconBg: "bg-white/20",
    },
    {
      title: "Applied This Month",
      value: analytics.applicationsThisMonth,
      icon: <Calendar className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-violet-600 to-purple-700",
      iconBg: "bg-white/20",
    },
    {
      title: "Pending",
      value: analytics.pendingApplications,
      icon: <Clock className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconBg: "bg-white/20",
    },
    {
      title: "Interviews Scheduled",
      value: analytics.interviewsScheduled,
      icon: <TrendingUp className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-sky-500 to-blue-600",
      iconBg: "bg-white/20",
    },
    {
      title: "Offers Received",
      value: analytics.offersReceived,
      icon: <CheckCircle2 className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconBg: "bg-white/20",
    },
    {
      title: "Rejected",
      value: analytics.rejectedApplications,
      icon: <XCircle className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-red-500 to-rose-600",
      iconBg: "bg-white/20",
    },
    {
      title: "Selected",
      value: analytics.selectedCount,
      icon: <Trophy className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-[#2dd4bf] to-teal-600",
      iconBg: "bg-white/20",
    },
    {
      title: "With Referral",
      value: analytics.referralApplications,
      icon: <Users className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
      iconBg: "bg-white/20",
    },
    {
      title: "On-Campus",
      value: analytics.onCampusApplications,
      icon: <GraduationCap className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-700",
      iconBg: "bg-white/20",
    },
    {
      title: "Off-Campus",
      value: analytics.offCampusApplications,
      icon: <Globe className="w-4 h-4 text-white" />,
      gradient: "bg-gradient-to-br from-slate-600 to-slate-800",
      iconBg: "bg-white/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
