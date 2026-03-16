"use client";

import * as React from "react";
import { Search, FileText, Bell, Users, Laptop, Calendar } from "lucide-react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function GlobalSearch({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(true);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [setOpen]);

    const runCommand = React.useCallback(
        (command: () => unknown) => {
            setOpen(false);
            command();
        },
        [setOpen]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-lg border-slate-200/60 max-w-xl rounded-xl">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 bg-white text-slate-900 border-none w-full h-full">
                    <div className="flex items-center border-b border-slate-100 px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-500" />
                        <Command.Input
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Type a command or search..."
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden pt-2 pb-4 px-2">
                        <Command.Empty className="py-6 text-center text-sm text-slate-500">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1">
                            <Command.Item
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2.5 rounded-md text-sm text-slate-700 font-medium transition-colors"
                                onSelect={() => runCommand(() => router.push("/"))}
                            >
                                <Laptop className="h-4 w-4 text-slate-400" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2.5 rounded-md text-sm text-slate-700 font-medium transition-colors"
                                onSelect={() => runCommand(() => router.push("/calendar"))}
                            >
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>Calendar & Events</span>
                            </Command.Item>
                            <Command.Item
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2.5 rounded-md text-sm text-slate-700 font-medium transition-colors"
                                onSelect={() => runCommand(() => router.push("/notes"))}
                            >
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span>Study Materials & Notes</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Recent Announcements" className="text-xs font-semibold text-slate-500 px-2 pt-3 pb-1 mb-1 border-t border-slate-100 mt-2">
                            <Command.Item
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2.5 rounded-md text-sm text-slate-700 font-medium transition-colors"
                                onSelect={() => runCommand(() => router.push("/announcements"))}
                            >
                                <Bell className="h-4 w-4 text-orange-400" />
                                <span>Mid-Semester Exams Start March 15</span>
                            </Command.Item>
                            <Command.Item
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2.5 rounded-md text-sm text-slate-700 font-medium transition-colors"
                                onSelect={() => runCommand(() => router.push("/announcements"))}
                            >
                                <Users className="h-4 w-4 text-teal-400" />
                                <span>Annual Tech Fest — INNOVATE 2026</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
