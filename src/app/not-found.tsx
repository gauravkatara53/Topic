import Link from "next/link";
import { Ghost, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1120] px-6">
      <div className="text-center relative z-10 max-w-lg mx-auto">
        <div className="relative inline-block mb-6 group">
          <div className="absolute inset-0 bg-[#2dd4bf] blur-3xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-700"></div>
          <Ghost className="w-32 h-32 text-[#1b254b] dark:text-[#2dd4bf] relative z-10 animate-bounce" strokeWidth={1} />
        </div>
        
        <h1 className="text-[100px] sm:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] dark:from-[#2dd4bf] dark:to-blue-500 leading-none select-none mb-2">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-4">
          Looks like you're lost
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm sm:text-base leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or is temporarily unavailable. Let's get you back on track!
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-[#1b254b] to-[#243060] dark:from-[#2dd4bf] dark:to-[#14b8a6] rounded-xl hover:shadow-lg hover:shadow-[#1b254b]/20 dark:hover:shadow-[#2dd4bf]/20 hover:-translate-y-0.5"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>

      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-[#2dd4bf]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}
