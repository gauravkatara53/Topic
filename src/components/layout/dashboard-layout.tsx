"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { ThemeProvider } from "./theme-provider";
import { cn } from "@/lib/utils";

export function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    return (
        <ThemeProvider>
            <div className="h-screen relative flex bg-background dark:bg-slate-900 overflow-hidden">
                {/* Desktop Sidebar */}
                <div 
                    className={cn(
                        "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-50 transition-all duration-300 ease-in-out",
                        isSidebarCollapsed ? "md:w-20" : "md:w-64"
                    )}
                >
                    <Sidebar isCollapsed={isSidebarCollapsed} />
                </div>

                {/* Main Content */}
                <main 
                    className={cn(
                        "flex-1 h-full overflow-y-auto w-full bg-slate-50 dark:bg-slate-900 transition-all duration-300 ease-in-out",
                        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
                    )}
                >
                    <TopNav 
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                        isSidebarCollapsed={isSidebarCollapsed}
                    />
                    <div className="p-3 md:p-4 lg:p-6 md:pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}
