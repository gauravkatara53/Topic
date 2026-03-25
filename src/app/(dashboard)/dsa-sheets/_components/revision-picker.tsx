"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevisionPickerProps {
  lastRevised: string;
  nextRevision: string;
  onChange: (field: 'lastRevised' | 'nextRevision', value: string) => void;
}

export function RevisionPicker({ lastRevised, nextRevision, onChange }: RevisionPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingNext, setSelectingNext] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  // Default lastRevised to today if empty
  useEffect(() => {
    if (!lastRevised) {
      const today = format(new Date(), 'yyyy-MM-dd');
      onChange('lastRevised', today);
      if (!nextRevision) {
        onChange('nextRevision', format(addDays(new Date(), 3), 'yyyy-MM-dd'));
      }
    }
  }, [lastRevised, nextRevision, onChange]);

  const lastDate = useMemo(() => lastRevised ? startOfDay(parseISO(lastRevised)) : startOfDay(new Date()), [lastRevised]);
  const nextDate = useMemo(() => nextRevision ? startOfDay(parseISO(nextRevision)) : null, [nextRevision]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(prev => addDays(startOfMonth(prev), -1));
  const nextMonth = () => setCurrentMonth(prev => addDays(endOfMonth(prev), 1));

  const quickPresets = [
    { label: "+1 Day", days: 1 },
    { label: "+3 Days", days: 3 },
    { label: "+7 Days", days: 7 },
  ];

  const handleDayClick = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    if (!selectingNext) {
      onChange('lastRevised', formatted);
      setSelectingNext(true);
    } else {
      // Ensure next revision is after last revised
      if (day > lastDate) {
        onChange('nextRevision', formatted);
      } else {
        // If they click earlier, swap them or just set lastRevised
        onChange('lastRevised', formatted);
      }
      setSelectingNext(false);
    }
  };

  const isLastInMonth = lastRevised && format(lastDate, 'MMM yyyy') === format(currentMonth, 'MMM yyyy');
  const isNextInMonth = nextRevision && nextDate && format(nextDate, 'MMM yyyy') === format(currentMonth, 'MMM yyyy');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-[13px] font-black text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 relative">
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0 relative z-10">
          {/* Empty slots for start of month */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}
          
          {days.map(day => {
            const isSelected = isSameDay(day, lastDate);
            const isNext = nextDate && isSameDay(day, nextDate);
            const isTdy = isToday(day);
            
            // Interaction logic for range fill
            const effectiveNext = (selectingNext && hoveredDate) ? hoveredDate : nextDate;
            const inRange = effectiveNext && (
              (day > lastDate && day < effectiveNext) || 
              (day < lastDate && day > effectiveNext)
            );
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => selectingNext && setHoveredDate(day)}
                className={cn(
                  "h-8 w-full text-[12px] font-bold transition-all relative group flex items-center justify-center",
                  isSelected ? "bg-[#1b254b] text-white shadow-lg shadow-[#1b254b]/20 z-20 rounded-lg" :
                  isNext && !selectingNext ? "bg-[#2dd4bf] text-white shadow-lg shadow-[#2dd4bf]/20 z-20 rounded-lg" :
                  (selectingNext && hoveredDate && isSameDay(day, hoveredDate)) ? "bg-[#2dd4bf]/50 text-white z-20 rounded-lg" :
                  inRange ? "bg-indigo-50/80 text-indigo-600 z-10" :
                  "text-slate-600 hover:bg-slate-100 rounded-lg",
                  isTdy && !isSelected && !isNext && !inRange && "text-indigo-600 ring-1 ring-inset ring-indigo-200 rounded-lg"
                )}
              >
                {day.getDate()}
                {isSelected && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />}
              </button>
            );
          })}
        </div>
        
        {/* Pointer Overlay */}
        {(isLastInMonth && (isNextInMonth || selectingNext)) && (
           <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-[#1b254b] to-[#2dd4bf] blur-[0.5px] transition-all duration-300" style={{
                transform: `translateY(-50%) skewY(-1deg)`,
                opacity: 0.1
             }} />
           </div>
        )}
      </div>

      {/* Quick Access */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0 mr-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            Plan:
          </div>
          {quickPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                const newNext = addDays(lastDate, preset.days);
                onChange('nextRevision', format(newNext, 'yyyy-MM-dd'));
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0 whitespace-nowrap shadow-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-3 flex items-center justify-between text-[11px] font-bold">
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1b254b]" />
            <span className="text-slate-500">Last Revised</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" />
            <span className="text-slate-500">Next Revision</span>
        </div>
      </div>
    </div>
  );
}
