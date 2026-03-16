"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatDistanceToNow } from "date-fns";

export function AttendanceDashboard({ initialRecords }: { initialRecords: any[] }) {
    const [records, setRecords] = useState(initialRecords);
    const [loading, setLoading] = useState(false);
    const [lastScraped, setLastScraped] = useState<Date | null>(
        initialRecords.length > 0 && initialRecords[0].scrapedAt
            ? new Date(initialRecords[0].scrapedAt)
            : null
    );
    const [openDialog, setOpenDialog] = useState(false);
    const [collegeId, setCollegeId] = useState("");
    const [collegePassword, setCollegePassword] = useState("");
    const [targetPercentage, setTargetPercentage] = useState([75]);

    const handleScrape = async (e?: React.FormEvent, isAutoSync = false) => {
        if (e) e.preventDefault();

        if (!isAutoSync && (!collegeId || !collegePassword)) {
            toast.error("Please enter credentials");
            return;
        }

        if (!isAutoSync) setOpenDialog(false);
        setLoading(true);
        toast("Sneaking into portal... 🕵️", { id: "scraping" });
        try {
            const bodyPayload = isAutoSync ? {} : { collegeId, collegePassword };
            const res = await fetch("/api/attendance/fetch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
            });
            if (!res.ok) {
                const err = await res.json();
                if (err.needCredentials) throw new Error("NEED_CREDENTIALS");
                throw new Error(err.error || "Failed");
            }
            const { data } = await res.json();
            setRecords(data);
            if (data.length > 0) setLastScraped(new Date(data[0].scrapedAt));
            toast.success("Attendance updated!", { id: "scraping" });

            // Check for < 75%
            const riskCount = data.filter((r: any) => r.percentage < 75).length;
            if (riskCount > 0) {
                toast.error(`Warning: ${riskCount} subjects below 75%`, { duration: 5000 });
            }
        } catch (error: any) {
            if (error.message === "NEED_CREDENTIALS" || error.message === "Invalid college ID or password.") {
                toast.dismiss("scraping");
                if (error.message === "Invalid college ID or password.") {
                    toast.error("Saved credentials failed. Please re-enter.", { duration: 4000 });
                }
                setOpenDialog(true);
            } else {
                toast.error(error.message || "Failed to scrape portal", { id: "scraping" });
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (percentage: number) => {
        if (percentage >= 85) return "text-green-500";
        if (percentage >= 75) return "text-yellow-500";
        return "text-red-500";
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 85) return "bg-green-500";
        if (percentage >= 75) return "bg-yellow-500";
        return "bg-red-500";
    };

    // Calculators
    const calcClassesToAttend = (attended: number, total: number, target: number) => {
        // (attended + X) / (total + X) = target / 100
        // attended + X = (target*total)/100 + (target*X)/100
        // X - (target/100)X = (target*total)/100 - attended
        // X(1 - target/100) = ...
        const t = target / 100;
        const req = Math.ceil((t * total - attended) / (1 - t));
        return req > 0 ? req : 0;
    };

    const calcClassesToBunk = (attended: number, total: number, minimum: number) => {
        // attended / (total + X) = minimum / 100
        // total + X = attended / (minimum/100)
        // X = attended / (minimum/100) - total
        const min = minimum / 100;
        const bunk = Math.floor(attended / min - total);
        return bunk > 0 ? bunk : 0;
    };

    const totalClasses = records.reduce((acc: number, r: any) => acc + r.total, 0);
    const totalAttended = records.reduce((acc: number, r: any) => acc + r.attended, 0);
    const globalAttendance = totalClasses === 0 ? 0 : (totalAttended / totalClasses) * 100;

    // Predictor Logic - Global Target
    const globalTarget = targetPercentage[0];
    const globalToAttend = calcClassesToAttend(totalAttended, totalClasses, globalTarget);
    const globalToBunk = calcClassesToBunk(totalAttended, totalClasses, globalTarget);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <div>
                    <h3 className="font-semibold text-slate-800">Live Attendance Sync</h3>
                    <p className="text-sm text-slate-500">
                        {lastScraped ? `Last updated ${formatDistanceToNow(lastScraped)} ago` : "No data synced yet"}
                    </p>
                </div>
                <Button
                    onClick={() => handleScrape(undefined, true)}
                    disabled={loading}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? "Scraping..." : "Sync Portal Data"}
                </Button>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sync NIT JSR Portal</DialogTitle>
                        <DialogDescription>
                            Enter your college credentials. Your password is not persistently stored.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleScrape} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Registration No. / User ID</label>
                            <Input
                                placeholder="E.g., 2024UGCS001"
                                value={collegeId}
                                onChange={(e) => setCollegeId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={collegePassword}
                                onChange={(e) => setCollegePassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Start Secure Scrape
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                {/* Circular Progress Overview */}
                <Card className="rounded-2xl border-slate-200/60 shadow-sm flex flex-col items-center justify-center p-8">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                        {/* Fake SVG Circle to represent Circular Progress exactly like screenshot */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                            <circle
                                cx="50" cy="50" r="40"
                                stroke={globalAttendance >= 75 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${Math.min(globalAttendance, 100) * 2.51} 251.2`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-bold text-orange-500">{globalAttendance.toFixed(0)}%</span>
                            <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase mt-1">Overall</span>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="rounded-2xl border-slate-200/60 shadow-sm p-6 flex flex-col justify-center">
                            <p className="text-xs font-semibold tracking-widest text-slate-500 mb-2">ATTENDED</p>
                            <h3 className="text-4xl font-bold text-slate-800">{totalAttended}</h3>
                            <p className="text-sm text-slate-400 mt-1">classes</p>
                        </Card>
                        <Card className="rounded-2xl border-slate-200/60 shadow-sm p-6 flex flex-col justify-center">
                            <p className="text-xs font-semibold tracking-widest text-slate-500 mb-2">TOTAL</p>
                            <h3 className="text-4xl font-bold text-slate-800">{totalClasses}</h3>
                            <p className="text-sm text-slate-400 mt-1">classes</p>
                        </Card>
                    </div>

                    <div className="bg-orange-50/50 border border-orange-200 p-4 rounded-xl flex items-start gap-4">
                        <div className="h-8 w-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-semibold text-slate-800">{globalAttendance < 75 ? "Below 75% — Risk of Detention" : "Safe Zone"}</h4>
                            <p className="text-sm text-slate-600">{globalAttendance < 75 ? "Attend more classes to reach 75%" : "You are currently meeting attendance requirements."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Predictor */}
            <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-white pb-4 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        Smart Attendance Predictor
                    </CardTitle>
                    <p className="text-sm text-slate-500">See how your attendance changes if you miss upcoming classes.</p>
                </CardHeader>
                <CardContent className="p-6 space-y-8 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Target</span>
                        <div className="flex-1 px-2">
                            <Slider
                                defaultValue={[75]}
                                max={100}
                                min={50}
                                step={1}
                                value={targetPercentage}
                                onValueChange={setTargetPercentage}
                                className="w-full"
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1 w-16 justify-end">
                            {targetPercentage[0]}<span className="font-normal text-slate-500">%</span>
                        </span>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-4 transition-all w-full min-h-[100px] overflow-visible">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">Overall Action Plan</span>
                            <span className={`text-xl font-bold ${globalAttendance < globalTarget ? 'text-orange-500' : 'text-teal-500'}`}>
                                {globalAttendance < globalTarget ? `Attend ${globalToAttend} blocks` : `Can bunk ${globalToBunk} blocks`}
                            </span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-full relative overflow-hidden">
                            {/* Base Current Attendance Bar */}
                            <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${globalAttendance >= globalTarget ? 'bg-teal-500' : 'bg-orange-400'}`}
                                style={{ width: `${Math.min(globalAttendance, 100)}%` }}
                            ></div>

                            {/* Target Gap Indicator */}
                            {globalAttendance < globalTarget ? (
                                /* Deficit: Fill from current to target in light orange */
                                <div
                                    className="absolute top-0 h-full bg-orange-200 opacity-60 transition-all duration-300 pointer-events-none"
                                    style={{ left: `${globalAttendance}%`, width: `${globalTarget - globalAttendance}%` }}
                                ></div>
                            ) : (
                                /* Surplus: Fill from target to current in lighter teal to show buffer */
                                <div
                                    className="absolute top-0 h-full bg-teal-300 opacity-50 z-10 transition-all duration-300 pointer-events-none"
                                    style={{ left: `${globalTarget}%`, width: `${globalAttendance - globalTarget}%` }}
                                ></div>
                            )}

                            {/* Target Line Indicator */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800/40 z-20 pointer-events-none transition-all duration-300" style={{ left: `${globalTarget}%` }}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Subject-wise Breakdown</h3>
            {records.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
                    <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <CardTitle>No Attendance Data</CardTitle>
                    <CardDescription className="max-w-sm mt-2">
                        Click 'Sync Portal Data' to securely fetch your attendance from the college portal using Puppeteer.
                    </CardDescription>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {records.map((record) => {
                        const p = record.percentage;
                        const targetLine = targetPercentage[0];
                        const toAttendTarget = calcClassesToAttend(record.attended, record.total, targetLine);
                        const toBunkTarget = calcClassesToBunk(record.attended, record.total, targetLine);

                        return (
                            <Card key={record.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow rounded-2xl border-slate-200/60 shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg leading-tight line-clamp-2" title={record.subject}>
                                            {record.subject}
                                        </CardTitle>
                                        {p >= 85 ? (
                                            <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                                        ) : p >= targetLine ? (
                                            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                                        ) : (
                                            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-500 tracking-widest font-semibold text-xs">ATTENDED</p>
                                            <p className="text-2xl font-bold">{record.attended} <span className="text-slate-400 text-sm font-normal">/ {record.total}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-black ${getStatusColor(p)}`}>
                                                {p.toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
                                            {/* Base Current Attendance Bar */}
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out z-10 ${p >= targetLine ? 'bg-teal-500' : 'bg-orange-400'}`}
                                                style={{ width: `${Math.min(p, 100)}%` }}
                                            ></div>

                                            {/* Target Gap Indicator */}
                                            {p < targetLine ? (
                                                /* Deficit */
                                                <div
                                                    className="absolute top-0 h-full bg-orange-200 opacity-60 transition-all duration-1000 ease-out pointer-events-none"
                                                    style={{ left: `${p}%`, width: `${targetLine - p}%` }}
                                                ></div>
                                            ) : (
                                                /* Surplus buffer */
                                                <div
                                                    className="absolute top-0 h-full bg-teal-300 opacity-50 z-20 transition-all duration-1000 ease-out pointer-events-none"
                                                    style={{ left: `${targetLine}%`, width: `${p - targetLine}%` }}
                                                ></div>
                                            )}

                                            {/* Target Line Indicator */}
                                            <div className="absolute top-0 bottom-0 w-[1px] bg-slate-800/40 z-30 pointer-events-none transition-all duration-1000 ease-out" style={{ left: `${targetLine}%` }}></div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 mt-auto pb-4 pt-4 flex-col items-start gap-2 border-t border-slate-100 text-sm">
                                    {p < targetLine ? (
                                        <div className="flex items-start gap-2 text-orange-600 font-medium">
                                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>Attend <strong>{toAttendTarget}</strong> more {toAttendTarget === 1 ? 'class' : 'classes'} to reach {targetLine}%</span>
                                        </div>
                                    ) : toBunkTarget > 0 ? (
                                        <div className="flex items-start gap-2 text-teal-600 font-medium">
                                            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>Can safely bunk <strong>{toBunkTarget}</strong> {toBunkTarget === 1 ? 'class' : 'classes'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2 text-slate-600 font-medium">
                                            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>On the margin (no bunks left)</span>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
