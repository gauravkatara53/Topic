"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, LayoutGrid, Table2, GitBranch, BarChart3, Bell, Loader2, Users } from "lucide-react";
import { PlacementApplication, PlacementAnalytics, PlacementReminder, PlacementFilters } from "@/types/placement";
import { StatsCards } from "./stats-cards";
import { StatsCardsSkeleton, ApplicationsTableSkeleton } from "./skeleton-cards";
import { ApplicationsTable } from "./applications-table";
import { ApplicationsGrid } from "./applications-grid";
import { TimelineView } from "./timeline-view";
import { AnalyticsSection } from "./analytics-section";
import { RemindersSection } from "./reminders-section";
import { OutreachSection } from "./outreach-section";
import { ApplicationModal } from "./application-modal";
import { ApplicationDetail } from "./application-detail";
import { FiltersBar } from "./filters-bar";
import { ExportButton } from "./export-button";
import { EmptyState } from "./empty-state";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "grid" | "timeline";
type TabMode = "applications" | "analytics" | "reminders" | "outreach";

const EMPTY_ANALYTICS: PlacementAnalytics = {
  totalApplications: 0,
  applicationsThisMonth: 0,
  pendingApplications: 0,
  interviewsScheduled: 0,
  offersReceived: 0,
  rejectedApplications: 0,
  selectedCount: 0,
  referralApplications: 0,
  onCampusApplications: 0,
  offCampusApplications: 0,
  statusDistribution: [],
  monthlyTrend: [],
  topRoles: [],
  campusSplit: [],
};

export function PlacementClient() {
  // ── Data state ────────────────────────────────────────────────────────────
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [analytics, setAnalytics] = useState<PlacementAnalytics>(EMPTY_ANALYTICS);
  const [reminders, setReminders] = useState<PlacementReminder[]>([]);

  // ── Loading ───────────────────────────────────────────────────────────────
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabMode>("applications");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filters, setFilters] = useState<PlacementFilters>({
    search: "",
    status: "",
    type: "",
    referral: "",
    sort: "latest",
  });

  // ── Modal/drawer state ────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<PlacementApplication | null>(null);
  const [selectedApp, setSelectedApp] = useState<PlacementApplication | null>(null);

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.type) params.set("type", filters.type);
      if (filters.referral) params.set("referral", filters.referral);
      params.set("sort", filters.sort);
      params.set("limit", "100");
      const res = await fetch(`/api/placement?${params}`);
      if (!res.ok) { setApplications([]); return; }
      const data = await res.json();
      setApplications(Array.isArray(data.applications) ? data.applications : []);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  }, [filters]);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/placement/analytics");
      if (!res.ok) return;
      const data = await res.json();
      setAnalytics(data);
    } catch {
      // silently fail
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    setLoadingReminders(true);
    try {
      const res = await fetch("/api/placement/reminders");
      if (!res.ok) return;
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { fetchAnalytics(); fetchReminders(); }, [fetchAnalytics, fetchReminders]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaved = (saved: PlacementApplication) => {
    setApplications((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    fetchAnalytics();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      await fetch(`/api/placement/${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp?.id === id) setSelectedApp(null);
      fetchAnalytics();
      toast.success("Application deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    setApplications((prev) =>
      prev.map((a) => a.id === id ? { ...a, currentStatus: status } : a)
    );
    if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, currentStatus: status } : p);
    fetchAnalytics();
  };

  const handleEdit = (app: PlacementApplication) => {
    setEditingApp(app);
    setModalOpen(true);
  };

  const handleFilterChange = (partial: Partial<PlacementFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const TABS: { id: TabMode; label: string; icon: React.ReactNode }[] = [
    { id: "applications", label: "Applications", icon: <Table2 className="w-4 h-4" /> },
    { id: "outreach",     label: "Outreach",     icon: <Users className="w-4 h-4" /> },
    { id: "analytics",    label: "Analytics",    icon: <BarChart3 className="w-4 h-4" /> },
    { id: "reminders",    label: "Reminders",    icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1b254b] via-[#243060] to-[#2dd4bf] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zNHY2aC02VjBoNnptMCAxN3Y2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-white/70 uppercase mb-1">Placement Tracker</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Track Your Placement Journey</h1>
            <p className="text-white/70 text-sm mt-1">Manage all campus and off-campus applications in one place</p>
          </div>
          <button
            onClick={() => { setEditingApp(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1b254b] rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-md shadow-black/20 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* ── Stats cards ───────────────────────────────────────────────────── */}
      {loadingAnalytics ? <StatsCardsSkeleton /> : <StatsCards analytics={analytics} />}

      {/* ── Tab navigation ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t.id
                  ? "bg-white dark:bg-slate-700 text-[#1b254b] dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {t.icon} {t.label}
              {t.id === "reminders" && reminders.filter((r) => !r.completed).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {reminders.filter((r) => !r.completed).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View mode + Export (only on applications tab) */}
        {tab === "applications" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {[
                { mode: "table" as const, icon: <Table2 className="w-4 h-4" /> },
                { mode: "grid" as const, icon: <LayoutGrid className="w-4 h-4" /> },
                { mode: "timeline" as const, icon: <GitBranch className="w-4 h-4" /> },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    viewMode === mode
                      ? "bg-white dark:bg-slate-700 text-[#1b254b] dark:text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                  title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                >
                  {icon}
                </button>
              ))}
            </div>
            <ExportButton />
          </div>
        )}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      {tab === "applications" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <FiltersBar filters={filters} onChange={handleFilterChange} />

          {loadingApps ? (
            <ApplicationsTableSkeleton />
          ) : applications.length === 0 ? (
            <EmptyState onAdd={() => { setEditingApp(null); setModalOpen(true); }} />
          ) : (
            <>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {applications.length} application{applications.length !== 1 ? "s" : ""}
              </p>
              {viewMode === "table" && (
                <ApplicationsTable
                  applications={applications}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onSelect={setSelectedApp}
                />
              )}
              {viewMode === "grid" && (
                <ApplicationsGrid
                  applications={applications}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onSelect={setSelectedApp}
                />
              )}
              {viewMode === "timeline" && (
                <TimelineView applications={applications} onSelect={setSelectedApp} />
              )}
            </>
          )}
        </div>
      )}

      {tab === "analytics" && (
        loadingAnalytics
          ? <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#2dd4bf]" /></div>
          : <AnalyticsSection analytics={analytics} />
      )}

      {tab === "reminders" && (
        loadingReminders
          ? <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#2dd4bf]" /></div>
          : (
            <RemindersSection
              reminders={reminders}
              applicationOptions={applications.map((a) => ({ id: a.id, companyName: a.companyName, role: a.role }))}
            />
          )
      )}

      {tab === "outreach" && <OutreachSection />}

      {/* ── Add/Edit modal ────────────────────────────────────────────────── */}
      <ApplicationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingApp(null); }}
        editingApp={editingApp}
        onSaved={handleSaved}
      />

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      {selectedApp && (
        <ApplicationDetail
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
