"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, PanelLeft, LogIn, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { GlobalSearch } from "./global-search";
import { NotificationsPopover } from "./notifications-popover";
import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function TopNav({ 
    onToggleSidebar, 
    isSidebarCollapsed 
}: { 
    onToggleSidebar?: () => void; 
    isSidebarCollapsed?: boolean; 
}) {
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { user } = useUser();
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700 w-full sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 focus-visible:ring-0">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-none w-64 bg-[#1b254b]">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">Sidebar navigation links</SheetDescription>
                            <Sidebar isCollapsed={false} onClose={() => setIsMobileMenuOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>
                <div 
                    onClick={onToggleSidebar}
                    className="hidden md:flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer mr-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                    <PanelLeft className={cn("h-5 w-5 transition-transform duration-300", isSidebarCollapsed && "rotate-180")} />
                </div>
                <span className="text-[15px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block tracking-tight">
                    {user ? <>Welcome back, <span className="text-slate-900 dark:text-white font-semibold">{user.firstName || "Student"}</span></> : <>Welcome, <span className="text-slate-900 dark:text-white font-semibold">Guest</span></>}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-full h-9 w-9"
                    onClick={() => setSearchOpen(true)}
                >
                    <Search className="h-4 w-4" />
                </Button>

                {/* Dark Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-yellow-400 rounded-full h-9 w-9 transition-all duration-200"
                >
                    {resolvedTheme === "dark" ? (
                        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-12" />
                    ) : (
                        <Moon className="h-4 w-4 transition-transform duration-300" />
                    )}
                </Button>

                {/* <NotificationsPopover /> */}

                <div className="ml-1 flex items-center shrink-0">
                    {user ? (
                        <UserButton
                            userProfileMode="navigation"
                            userProfileUrl="/profile"
                            afterSignOutUrl="/"
                        />
                    ) : (
                        <Link href="/sign-in" className="inline-flex items-center gap-1.5 bg-[#1b254b] hover:bg-[#232f5b] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                            <LogIn className="h-3.5 w-3.5" />
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
        </div>
    );
}

