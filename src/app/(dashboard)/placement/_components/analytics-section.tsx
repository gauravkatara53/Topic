"use client";

import { PlacementAnalytics } from "@/types/placement";
import { STATUS_COLORS } from "@/types/placement";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from "recharts";

interface AnalyticsSectionProps {
  analytics: PlacementAnalytics;
}

const CAMPUS_COLORS = ["#6366f1", "#2dd4bf"];
const PIE_PALETTE = [
  "#6366f1", "#2dd4bf", "#f59e0b", "#ef4444", "#10b981",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-sm">
        <p className="font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.fill || p.color }} className="font-medium">
            {p.name}: <span className="font-black">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsSection({ analytics }: AnalyticsSectionProps) {
  const successRate =
    analytics.totalApplications > 0
      ? Math.round((analytics.offersReceived / analytics.totalApplications) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Row 1: Monthly Trend + Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Applications */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-1">Monthly Applications</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.monthlyTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Applications" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate radial */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-1">Offer Rate</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Applications → Offers</p>
          <div className="relative">
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={75}
                startAngle={90} endAngle={-270}
                data={[{ name: "Rate", value: successRate, fill: "#2dd4bf" }]}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{successRate}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Success</span>
            </div>
          </div>
          <div className="mt-4 space-y-1 w-full">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total</span><span className="font-bold">{analytics.totalApplications}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Offers</span><span className="font-bold text-emerald-500">{analytics.offersReceived}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Selected</span><span className="font-bold text-teal-500">{analytics.selectedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Status Distribution + Campus Split + Top Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Status Distribution Pie */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Status Distribution</h3>
          {analytics.statusDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%" cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={2}
                  >
                    {analytics.statusDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
                {analytics.statusDistribution.map((s, i) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_PALETTE[i % PIE_PALETTE.length] }} />
                      {s.status}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-white">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
          )}
        </div>

        {/* On-Campus vs Off-Campus */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Campus Split</h3>
          {analytics.totalApplications > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={analytics.campusSplit}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={70}
                    innerRadius={0}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {analytics.campusSplit.map((_, i) => (
                      <Cell key={i} fill={CAMPUS_COLORS[i % CAMPUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {analytics.campusSplit.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: CAMPUS_COLORS[i] }} />
                    {s.name}: <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
          )}
        </div>

        {/* Top Roles */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Top Applied Roles</h3>
          {analytics.topRoles.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={analytics.topRoles}
                layout="vertical"
                margin={{ top: 0, right: 8, bottom: 0, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="role"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  width={90}
                  tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
