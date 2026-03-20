"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Event as RbcEvent, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Calendar as CalendarIcon, Clock, MapPin, Tag } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { AddEventDialog } from "./add-event-dialog";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

type CalendarEventType = {
    id: string;
    title: string;
    date: Date;
    type: string;
    description: string | null;
};

export default function InteractiveCalendar({ initialEvents }: { initialEvents: CalendarEventType[] }) {
    const [events, setEvents] = useState(
        initialEvents.map((e) => ({
            id: e.id,
            title: e.title,
            start: new Date(e.date),
            end: new Date(e.date), // Simple all-day for now
            allDay: true,
            resource: e,
        }))
    );

    const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleEventAdded = (e: any) => {
        setEvents([...events, {
            id: e.id,
            title: e.title,
            start: new Date(e.date),
            end: new Date(e.date),
            allDay: true,
            resource: e,
        }]);
    };

    const dayPropGetter = (date: Date) => {
        const dayEvents = events.filter(e => isSameDay(e.start, date));
        let className = "";
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        if (dayEvents.length > 0) {
            const hasExam = dayEvents.some(e => e.resource?.type === "EXAM");
            const hasHoliday = dayEvents.some(e => e.resource?.type === "HOLIDAY");
            const hasEvent = dayEvents.some(e => e.resource?.type === "EVENT");

            if (hasExam) className = "bg-red-100";
            else if (hasHoliday) className = "bg-green-100";
            else if (hasEvent) className = "bg-purple-100";
            else className = "bg-orange-100";
        } else if (isWeekend) {
            className = "bg-red-50/50";
        }

        return { className };
    };

    // Custom date header to color weekend numbers red
    const CustomDateHeader = ({ label, date }: { label: string, date: Date }) => {
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        return (
            <button className={`rbc-button-link ${isWeekend ? 'text-red-500 font-bold' : ''}`}>
                {label}
            </button>
        );
    };

    // Hidden in CSS anyway, return empty fragment to avoid unnecessary DOM nodes
    const CustomEvent = () => <></>;

    const handleSelectSlot = ({ start }: { start: Date }) => {
        setSelectedDate(start);
        const dayEvents = events.filter(e => isSameDay(e.start, start));
        setSelectedDateEvents(dayEvents);
    };

    const handleSelectEvent = (event: any) => {
        setSelectedDate(event.start);
        const dayEvents = events.filter(e => isSameDay(e.start, event.start));
        setSelectedDateEvents(dayEvents);
    };

    return (
        <div className="h-full w-full custom-calendar-wrapper flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 px-2 pt-2 gap-4">
                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center pl-2">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-xs text-slate-500 font-medium whitespace-nowrap">Holiday</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs text-slate-500 font-medium whitespace-nowrap">Exam</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-xs text-slate-500 font-medium whitespace-nowrap">Academic</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span className="text-xs text-slate-500 font-medium whitespace-nowrap">Event</span></div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <AddEventDialog onEventAdded={handleEventAdded} />
                </div>
            </div>

            <div className={`flex-1 min-h-[400px] relative ${selectedDate && selectedDateEvents.length > 0 ? 'hidden sm:block' : 'block'}`}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    dayPropGetter={dayPropGetter}
                    views={["month"]} // Limited to month for cleanliness
                    defaultView="month"
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    popup={false} // Disable default popup
                    components={{
                        month: {
                            event: CustomEvent,
                            dateHeader: CustomDateHeader,
                        },
                    }}
                />
            </div>

            {/* Event Details Panel */}
            {selectedDate && selectedDateEvents.length > 0 && (
                <div className="shrink-0 max-h-[60vh] sm:max-h-48 bg-slate-50 border border-slate-200 rounded-xl p-5 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-slate-400" />
                            <h3 className="font-semibold text-slate-700">
                                {format(selectedDate, "EEEE, MMMM d, yyyy")}
                            </h3>
                        </div>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-xs font-semibold text-primary sm:hidden bg-teal-50 px-3 py-1 rounded-full"
                        >
                            Back to Calendar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {selectedDateEvents.map((evt: any, i) => (
                            <div key={i} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="mt-1 flex-shrink-0">
                                    <div className={`w-3 h-3 rounded-full ${evt.resource?.type === 'EXAM' ? 'bg-red-500' :
                                        evt.resource?.type === 'HOLIDAY' ? 'bg-green-500' :
                                            evt.resource?.type === 'EVENT' ? 'bg-purple-500' : 'bg-orange-500'
                                        }`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 leading-tight">{evt.title}</h4>
                                    {evt.resource?.description && (
                                        <p className="text-sm text-slate-500 mt-1">{evt.resource.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge text={evt.resource?.type || "General"} />
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> All Day
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Badge({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 uppercase tracking-wider">
            {text}
        </span>
    );
}
