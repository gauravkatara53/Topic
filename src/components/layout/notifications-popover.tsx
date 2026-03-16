"use client";

import * as React from "react";
import { Bell, Check, Clock } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Dummy data for notifications
const notifications = [
    {
        id: 1,
        title: "Attendance Warning",
        description: "Your attendance in Data Structures is currently at 74%.",
        time: "2 hours ago",
        unread: true,
    },
    {
        id: 2,
        title: "New Note Uploaded",
        description: "Rohan added 'OS Module 3 Notes' in Operating Systems.",
        time: "5 hours ago",
        unread: true,
    },
    {
        id: 3,
        title: "Event Reminder",
        description: "Annual Tech Fest meeting starts in 30 minutes in Room 402.",
        time: "1 day ago",
        unread: false,
    },
];

export function NotificationsPopover() {
    const [unreadCount, setUnreadCount] = React.useState(
        notifications.filter((n) => n.unread).length
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
                    >
                        <Bell className="h-4 w-4" />
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[340px] p-0 rounded-xl shadow-lg border-slate-200/60 transition-all">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => setUnreadCount(0)}
                            className="text-[11px] font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
                        >
                            <Check className="h-3 w-3" />
                            Mark all as read
                        </button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors ${notification.unread && unreadCount > 0 ? "bg-teal-50/30" : ""
                                }`}
                        >
                            <div className="mt-1 flex-shrink-0">
                                <div
                                    className={`h-2 w-2 rounded-full ${notification.unread && unreadCount > 0
                                            ? "bg-teal-500"
                                            : "bg-slate-300"
                                        }`}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-slate-800 leading-tight">
                                    {notification.title}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    {notification.description}
                                </p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                                    <Clock className="h-3 w-3" />
                                    {notification.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        className="w-full text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg h-9"
                    >
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
