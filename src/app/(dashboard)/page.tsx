import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { Metadata } from "next";

import { 
  OverviewWidgets, 
  DashboardContent, 
  UpcomingEvents, 
  DashboardSkeleton 
} from "./_components/dashboard-sections";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your college dashboard with quick stats, recent announcements, top notes, and upcoming events.",
};

export default async function Home() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  const isGuest = !userId;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8 sm:pb-10 font-sans">

      {/* Welcome Banner - Keep static/fast parts here */}
      <div className="bg-gradient-to-r from-[#1b254b] to-[#2dd4bf] rounded-2xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-white/80 uppercase flex items-center gap-1.5 sm:gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-3 h-3 sm:w-3.5 sm:h-3.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            {isGuest ? "WELCOME TO TOPIC" : "GOOD MORNING"}
          </p>
          <h2 className="text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
            {isGuest ? "Welcome to Topic 👋" : `Welcome back, ${user?.firstName || "Student"} 👋`}
          </h2>
          <p className="text-white/80 flex items-start sm:items-center gap-2 mt-2 sm:mt-4 text-[13px] sm:text-[15px] leading-snug">
            {isGuest ? (
              <span className="opacity-90">Your modern college companion. Explore announcements, notes & more.</span>
            ) : (
              <span className="opacity-90">Enjoy your day! Check your latest updates below.</span>
            )}
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="space-y-4 sm:space-y-6">
          <OverviewWidgets userId={userId} />
          <DashboardContent />
          <UpcomingEvents />
        </div>
      </Suspense>
    </div>
  );
}
