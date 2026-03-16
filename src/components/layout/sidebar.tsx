"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Megaphone,
    CalendarDays,
    BookOpen,
    ClipboardCheck,
    GraduationCap,
    Grid2X2,
    User,
    Trophy
} from "lucide-react";

const routes = [
    {
        label: "Dashboard",
        icon: Grid2X2,
        href: "/",
    },
    {
        label: "Announcements",
        icon: Megaphone,
        href: "/announcements",
    },
    {
        label: "Calendar",
        icon: CalendarDays,
        href: "/calendar",
    },
    {
        label: "Notes & PYQs",
        icon: BookOpen,
        href: "/notes",
    },
    {
        label: "Attendance",
        icon: ClipboardCheck,
        href: "/attendance",
    },
    {
        label: "CG Leaderboard",
        icon: Trophy,
        href: "/cg-leaderboard",
    },
    {
        label: "Profile",
        icon: User,
        href: "/profile",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [dbUser, setDbUser] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetch("/api/profile")
                .then(res => res.json())
                .then(data => setDbUser(data))
                .catch(console.error);
        }
    }, [user]);

    let branch = dbUser?.branch || null;
    let semester = dbUser?.semester || null;

    if (dbUser?.rollNumber && dbUser.rollNumber.length >= 8) {
        const rollDisplay = dbUser.rollNumber.toUpperCase();
        const admissionYear = parseInt(rollDisplay.substring(0, 4), 10);
        const bCode = rollDisplay.substring(6, 8);

        const branchMap: Record<string, string> = {
            CS: "CSE",
            EC: "ECE",
            EE: "EE",
            CE: "CE",
            ME: "ME",
            MM: "MME",
            PI: "PIE",
            EM: "ECM"
        };

        if (branchMap[bCode]) {
            branch = branchMap[bCode];
        }

        if (!isNaN(admissionYear)) {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const yearsDifference = currentYear - admissionYear;
            if (currentMonth < 6) {
                semester = yearsDifference * 2;
            } else {
                semester = yearsDifference * 2 + 1;
            }
            semester = Math.max(1, Math.min(8, semester));
        }
    }

    let subText = null;
    if (branch && semester) {
        subText = `${branch} · ${semester}${semester === 1 || semester === 2 ? 'st' : semester === 3 || semester === 4 ? 'nd' : semester === 5 || semester === 6 ? 'rd' : 'th'} Sem`;
    } else if (branch) {
        subText = branch;
    }

    const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : (dbUser?.name || "Student");
    const initials = name !== "Student" ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "ST";
    const imageUrl = user?.imageUrl;

    return (
        <div className="flex flex-col h-full bg-[#1b254b] text-white">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 bg-[#2dd4bf] rounded-md shadow-sm">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">TOPIC</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 space-y-2 px-4">
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-[#2b365d]/50 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <route.icon className={cn("h-4 w-4", isActive ? "text-[#2dd4bf]" : "opacity-70")} />
                            {route.label}
                        </Link>
                    );
                })}
            </div>

            {/* Profile Section */}
            <div className="p-5 border-t border-white/5 mt-auto">
                {user ? (
                    <div className="flex items-center gap-3">
                        {imageUrl ? (
                            <img src={imageUrl} alt={name} className="h-10 w-10 rounded-full object-cover shrink-0 shadow-sm" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                                {initials}
                            </div>
                        )}
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-sm font-semibold truncate text-white">{name}</span>
                            {subText && <span className="text-xs text-slate-400 truncate">{subText}</span>}
                        </div>
                        <button onClick={() => signOut()} className="text-slate-500 hover:text-white transition-colors shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link href="/sign-in" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#2dd4bf] hover:bg-[#26c0ac] text-white text-sm font-semibold rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                            Sign In
                        </Link>
                        <Link href="/sign-up" className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors">
                            Create Account
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
