"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMemo, useState, useEffect } from "react";
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
    Trophy,
    FileSearch,
    Code2
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
        label: "ATS Checker",
        icon: FileSearch,
        href: "/ats-checker",
    },
    {
        label: "DSA Sheets",
        icon: Code2,
        href: "/dsa-sheets",
    },
    {
        label: "Profile",
        icon: User,
        href: "/profile",
    },
];

export function Sidebar({ isCollapsed, onClose }: { isCollapsed?: boolean, onClose?: () => void }) {
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

    const { branch, semester, subText } = useMemo(() => {
        let b = dbUser?.branch || null;
        let s = dbUser?.semester || null;

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
                b = branchMap[bCode];
            }

            if (!isNaN(admissionYear)) {
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth();
                const yearsDifference = currentYear - admissionYear;
                if (currentMonth < 6) {
                    s = yearsDifference * 2;
                } else {
                    s = yearsDifference * 2 + 1;
                }
                s = Math.max(1, Math.min(8, s));
            }
        }

        let st = null;
        if (b && s) {
            st = `${b} · ${s}${s === 1 || s === 2 ? 'st' : s === 3 || s === 4 ? 'nd' : s === 5 || s === 6 ? 'rd' : 'th'} Sem`;
        } else if (b) {
            st = b;
        }

        return { branch: b, semester: s, subText: st };
    }, [dbUser]);

    const name = useMemo(() => {
        return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : (dbUser?.name || "Student");
    }, [user, dbUser]);

    const initials = useMemo(() => {
        return name !== "Student" ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "ST";
    }, [name]);

    const imageUrl = user?.imageUrl;

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-[#1b254b] text-white transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Logo Section */}
            <div className={cn(
                "h-20 flex items-center transition-all duration-300",
                isCollapsed ? "px-0 justify-center" : "px-6"
            )}>
                <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 bg-[#2dd4bf] rounded-md shadow-sm shrink-0">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-xl tracking-tight transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                            TOPIC
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation Links */}
            <div className={cn(
                "flex-1 py-4 space-y-2 transition-all duration-300",
                isCollapsed ? "px-3" : "px-4"
            )}>
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-3 py-3 rounded-lg transition-all duration-200 text-sm font-medium group",
                                isCollapsed ? "px-0 justify-center" : "px-4",
                                isActive
                                    ? "bg-[#2b365d]/50 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                            title={isCollapsed ? route.label : undefined}
                        >
                            <route.icon className={cn(
                                "h-4 w-4 transition-all",
                                isActive ? "text-[#2dd4bf]" : "opacity-70 group-hover:opacity-100"
                            )} />
                            {!isCollapsed && (
                                <span className="transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                                    {route.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Profile Section */}
            <div className={cn(
                "p-5 border-t border-white/5 mt-auto transition-all duration-300",
                isCollapsed ? "px-0 flex justify-center" : "p-5"
            )}>
                {user ? (
                    <div className={cn(
                        "flex items-center transition-all",
                        isCollapsed ? "flex-col gap-4" : "gap-3"
                    )}>
                        <div className="relative group cursor-pointer" onClick={() => {
                            if (isCollapsed) {
                                signOut();
                                handleLinkClick();
                            }
                        }}>
                            {imageUrl ? (
                                <img src={imageUrl} alt={name} className="h-10 w-10 rounded-full object-cover shrink-0 shadow-sm border border-white/10" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm border border-teal-500/20">
                                    {initials}
                                </div>
                            )}
                            {isCollapsed && (
                                <div className="absolute inset-0 bg-[#1b254b]/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                </div>
                            )}
                        </div>
                        
                        {!isCollapsed && (
                            <>
                                <div onClick={handleLinkClick} className="flex flex-col flex-1 overflow-hidden animate-in fade-in slide-in-from-left-2 cursor-pointer">
                                    <span className="text-sm font-semibold truncate text-white">{name}</span>
                                    {subText && <span className="text-xs text-slate-400 truncate">{subText}</span>}
                                </div>
                                <button onClick={() => {
                                    signOut();
                                    handleLinkClick();
                                }} className="text-slate-500 hover:text-white transition-colors shrink-0 p-1.5 hover:bg-white/5 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={cn(
                        "space-y-2 w-full transition-all",
                        isCollapsed ? "px-3" : ""
                    )}>
                        {!isCollapsed ? (
                            <>
                                <Link href="/sign-in" onClick={handleLinkClick} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#2dd4bf] hover:bg-[#26c0ac] text-white text-sm font-semibold rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                                    Sign In
                                </Link>
                                <Link href="/sign-up" onClick={handleLinkClick} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors">
                                    Create Account
                                </Link>
                            </>
                        ) : (
                            <Link href="/sign-in" onClick={handleLinkClick} className="flex items-center justify-center w-full py-3 bg-[#2dd4bf] hover:bg-[#26c0ac] text-white rounded-lg transition-colors shadow-sm shadow-teal-500/20" title="Sign In">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
