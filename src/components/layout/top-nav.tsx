"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, PanelLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { GlobalSearch } from "./global-search";
import { NotificationsPopover } from "./notifications-popover";
import { UserButton, useUser } from "@clerk/nextjs";

export function TopNav() {
    const [searchOpen, setSearchOpen] = React.useState(false);
    const { user } = useUser();

    return (
        <div className="flex items-center justify-between px-4 py-4 bg-white w-full sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-500">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-none w-64 bg-[#1b254b]">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">Sidebar navigation links</SheetDescription>
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="hidden md:flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mr-2">
                    <PanelLeft className="h-5 w-5" />
                </div>
                <span className="text-[15px] font-medium text-slate-500 hidden sm:inline-block tracking-tight">
                    {user ? <>Welcome back, <span className="text-slate-900 font-semibold">{user.firstName || "Student"}</span></> : <>Welcome, <span className="text-slate-900 font-semibold">Guest</span></>}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
                    onClick={() => setSearchOpen(true)}
                >
                    <Search className="h-4 w-4" />
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
