"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogIn, ArrowRight, Sparkles, BookOpen, GraduationCap, LayoutDashboard, Share2, Users, LineChart, Trophy } from "lucide-react";

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView();
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, end, duration]);
    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export function ProfilePromo() {
    const hero = useInView();
    const features = useInView();
    const highlight1 = useInView();
    const highlight2 = useInView();
    const stats = useInView();
    const cta = useInView();

    return (
        <div className="space-y-0 -mx-3 md:-mx-4 lg:-mx-6 -mt-3 md:-mt-6 lg:-mt-6">
            {/* Hero Section */}
            <section
                ref={hero.ref}
                className={`relative overflow-hidden bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] px-6 md:px-16 py-16 md:py-24 transition-all duration-1000 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
                {/* Floating decorative elements */}
                <div className="absolute top-12 left-8 h-3 w-3 rounded-full bg-blue-400/30 animate-pulse" />
                <div className="absolute top-32 right-16 h-2 w-2 rounded-full bg-purple-400/40 animate-pulse delay-500" />
                <div className="absolute bottom-20 left-1/4 h-4 w-4 rounded-full bg-blue-300/20 animate-bounce" style={{ animationDuration: "3s" }} />
                <div className="absolute top-1/3 right-1/3 h-2 w-2 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "4s" }} />

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/20 rounded-full px-4 py-1.5 text-teal-100 text-xs font-bold tracking-widest uppercase">
                            <Sparkles className="h-3 w-3" /> Your Digital College Life
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                            Your Identity on<br />
                            <span className="bg-gradient-to-r from-teal-200 to-emerald-300 bg-clip-text text-transparent">Topic</span>
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-md">
                            Create a personalized dashboard. Sync attendance, share study materials, and track your CGPA all in one beautiful place.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link href="/sign-up" className="group inline-flex h-12 items-center justify-center rounded-xl bg-[#1b254b] hover:bg-[#232f5b] px-8 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] gap-2">
                                <LogIn className="h-4 w-4" /> Create Profile
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/sign-in" className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-8 text-sm font-semibold text-white hover:bg-white/15 transition-all duration-300">
                                Sign In
                            </Link>
                        </div>
                    </div>
                    <div className={`transition-all duration-1000 delay-300 ${hero.inView ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-12 scale-95"}`}>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                            <Image
                                src="/profile_hero_teal_1773649494601.png"
                                alt="Student Digital Profile"
                                width={600}
                                height={500}
                                className="relative rounded-2xl shadow-2xl shadow-black/30 border border-white/10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section
                ref={stats.ref}
                className={`bg-white border-b border-slate-100 py-10 md:py-14 px-6 transition-all duration-700 ${stats.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-[#1b254b]"><AnimatedCounter end={1200} suffix="+" /></p>
                        <p className="text-sm text-slate-500 font-medium">Notes Shared</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-blue-500"><AnimatedCounter end={150} suffix="+" /></p>
                        <p className="text-sm text-slate-500 font-medium">Daily Active Users</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-purple-500"><AnimatedCounter end={1} prefix="#" /></p>
                        <p className="text-sm text-slate-500 font-medium">College Companion App</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-indigo-500"><AnimatedCounter end={100} suffix="%" /></p>
                        <p className="text-sm text-slate-500 font-medium">Free Forever</p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section
                ref={features.ref}
                className="bg-slate-50 py-16 md:py-24 px-6 md:px-16"
            >
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center space-y-3 mb-12 md:mb-16 transition-all duration-700 ${features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <p className="text-indigo-600 text-sm font-bold tracking-widest uppercase">Platform Features</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Everything in One Place</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: LayoutDashboard,
                                title: "Your Dashboard",
                                desc: "A personalized view of your college life. Get vital info at a glance every morning.",
                                color: "bg-blue-50 text-blue-600 border-blue-100",
                                iconBg: "bg-blue-100",
                                delay: "delay-0",
                            },
                            {
                                icon: BookOpen,
                                title: "Notes & Material",
                                desc: "Access crowd-sourced notes and PYQs. Upload your own to help juniors and classmates.",
                                color: "bg-teal-50 text-teal-600 border-teal-100",
                                iconBg: "bg-teal-100",
                                delay: "delay-150",
                            },
                            {
                                icon: GraduationCap,
                                title: "CGPA Prediction",
                                desc: "Track your grades and predict what you need to score to hit your target CGPA.",
                                color: "bg-purple-50 text-purple-600 border-purple-100",
                                iconBg: "bg-purple-100",
                                delay: "delay-300",
                            },
                            {
                                icon: LineChart,
                                title: "Real-time Attendance",
                                desc: "No more guessing. Auto-sync attendance with the official portal and calculate bunks.",
                                color: "bg-orange-50 text-orange-600 border-orange-100",
                                iconBg: "bg-orange-100",
                                delay: "delay-100",
                            },
                            {
                                icon: Share2,
                                title: "Share & Connect",
                                desc: "Easily share links to specific notes or events with your friends on WhatsApp.",
                                color: "bg-indigo-50 text-indigo-600 border-indigo-100",
                                iconBg: "bg-indigo-100",
                                delay: "delay-200",
                            },
                            {
                                icon: Users,
                                title: "Community Driven",
                                desc: "Built for students, by students. A central hub that grows stronger as more people join.",
                                color: "bg-emerald-50 text-emerald-600 border-emerald-100",
                                iconBg: "bg-emerald-100",
                                delay: "delay-300",
                            },
                        ].map((f, i) => (
                            <div
                                key={f.title}
                                className={`${f.color} border rounded-2xl p-6 md:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-default ${features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                                style={{ transitionDelay: `${i * 100 + 200}ms` }}
                            >
                                <div className={`h-12 w-12 ${f.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Feature Showcase 1: Notes & Library */}
            <section className="bg-white py-16 md:py-24 px-6 md:px-16">
                <div
                    ref={highlight1.ref}
                    className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center"
                >
                    <div className={`space-y-6 transition-all duration-700 ${highlight1.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
                        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-sm font-semibold border border-teal-100">
                            <BookOpen className="h-4 w-4" /> Share Knowledge
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                            The Ultimate<br />
                            <span className="text-teal-500">Digital Library</span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            Stop asking for notes in WhatsApp groups. Access an organized, crowd-sourced collection of notes, PYQs, and study materials sorted by branch and semester.
                        </p>
                    </div>
                    <div className={`transition-all duration-700 delay-200 ${highlight1.inView ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95"}`}>
                        <Image
                            src="/promo/profile-notes.png"
                            alt="Notes Sharing Network"
                            width={500}
                            height={500}
                            className="rounded-2xl mx-auto drop-shadow-xl"
                        />
                    </div>
                </div>
            </section>

            {/* Visual Feature Showcase 2: CGPA & Success */}
            <section className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 py-16 md:py-24 px-6 md:px-16 border-t border-slate-100">
                <div
                    ref={highlight2.ref}
                    className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center"
                >
                    <div className={`order-2 md:order-1 transition-all duration-700 delay-200 ${highlight2.inView ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95"}`}>
                        <Image
                            src="/promo/profile-cgpa.png"
                            alt="CGPA Tracking"
                            width={500}
                            height={500}
                            className="rounded-2xl mx-auto drop-shadow-xl"
                        />
                    </div>
                    <div className={`order-1 md:order-2 space-y-6 transition-all duration-700 ${highlight2.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold border border-purple-100">
                            <Trophy className="h-4 w-4" /> Academic Progress
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                            Track Your<br />
                            <span className="text-purple-600">Success Journey</span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            Log your semester grades, view your progress over time, and use our prediction model to know exactly what you need to score to hit your dream CGPA.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section
                ref={cta.ref}
                className={`bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] py-16 md:py-24 px-6 md:px-16 text-center transition-all duration-700 ${cta.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
                <div className="max-w-2xl mx-auto space-y-6 relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-teal-500/10 animate-ping" style={{ animationDuration: "3s" }} />
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Claim Your Profile on<br />Topic Today
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md mx-auto">
                        Join the fastest growing student community. Create your account in seconds using Google.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <Link href="/sign-up" className="group inline-flex h-14 items-center justify-center rounded-xl bg-[#1b254b] hover:bg-[#232f5b] px-10 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] gap-2">
                            Create Free Account
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <p className="text-slate-400 text-sm pt-2">Takes less than 30 seconds · No spam</p>
                </div>
            </section>
        </div>
    );
}
