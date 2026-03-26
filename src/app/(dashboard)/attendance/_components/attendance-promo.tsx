"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogIn, CheckCircle, ArrowRight, Zap, Shield, BarChart3, RefreshCw, Target, TrendingUp, Clock } from "lucide-react";

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

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
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
    return <span ref={ref}>{count}{suffix}</span>;
}

export function AttendancePromo() {
    const hero = useInView();
    const features = useInView();
    const howItWorks = useInView();
    const stats = useInView();
    const testimonial = useInView();
    const cta = useInView();

    return (
        <div className="space-y-0 -mx-3 md:-mx-4 lg:-mx-6 -mt-3 md:-mt-6 lg:-mt-6">
            {/* Hero Section */}
            <section
                ref={hero.ref}
                className={`relative overflow-hidden bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] px-6 md:px-16 py-16 md:py-24 transition-all duration-1000 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
                {/* Floating decorative elements */}
                <div className="absolute top-12 left-8 h-3 w-3 rounded-full bg-teal-400/30 animate-pulse" />
                <div className="absolute top-32 right-16 h-2 w-2 rounded-full bg-orange-400/40 animate-pulse delay-500" />
                <div className="absolute bottom-20 left-1/4 h-4 w-4 rounded-full bg-teal-300/20 animate-bounce" style={{ animationDuration: "3s" }} />
                <div className="absolute top-1/3 right-1/3 h-2 w-2 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "4s" }} />

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/20 rounded-full px-4 py-1.5 text-teal-300 text-xs font-bold tracking-widest uppercase">
                            <Zap className="h-3 w-3" /> Smart Attendance Tracking
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                            Never Miss a<br />
                            <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">Class Again</span>
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-md">
                            Auto-sync your attendance from the college portal. Get smart bunk predictions, real-time alerts, and subject-wise analytics.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link href="/sign-up" className="group inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 px-8 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 hover:scale-[1.02] gap-2">
                                <LogIn className="h-4 w-4" /> Get Started Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/sign-in" className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-8 text-sm font-semibold text-white hover:bg-white/15 transition-all duration-300">
                                Sign In
                            </Link>
                        </div>
                    </div>
                    <div className={`transition-all duration-1000 delay-300 ${hero.inView ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-12 scale-95"}`}>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
                            <Image
                                src="/promo/attendance-hero.png"
                                alt="Attendance Dashboard"
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
                className={`bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-10 md:py-14 px-6 transition-all duration-700 ${stats.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-[#1b254b] dark:text-white"><AnimatedCounter end={500} suffix="+" /></p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Students</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-teal-500"><AnimatedCounter end={98} suffix="%" /></p>
                        <p className="text-sm text-slate-500 font-medium">Sync Accuracy</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-orange-500"><AnimatedCounter end={75} suffix="%" /></p>
                        <p className="text-sm text-slate-500 font-medium">Min Threshold</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl md:text-4xl font-extrabold text-emerald-500"><AnimatedCounter end={24} suffix="/7" /></p>
                        <p className="text-sm text-slate-500 font-medium">Real-time Updates</p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section
                ref={features.ref}
                className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24 px-6 md:px-16"
            >
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center space-y-3 mb-12 md:mb-16 transition-all duration-700 ${features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <p className="text-teal-600 dark:text-teal-400 text-sm font-bold tracking-widest uppercase">Why Students Love It</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Everything You Need to<br />Stay on Track</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: RefreshCw,
                                title: "Auto Portal Sync",
                                desc: "Automatically fetches your attendance from the college portal. No manual entry needed.",
                                color: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20",
                                iconBg: "bg-teal-100 dark:bg-teal-500/20",
                                delay: "delay-0",
                            },
                            {
                                icon: Target,
                                title: "Smart Bunk Calculator",
                                desc: "Know exactly how many classes you can bunk while staying above the threshold.",
                                color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
                                iconBg: "bg-orange-100 dark:bg-orange-500/20",
                                delay: "delay-150",
                            },
                            {
                                icon: BarChart3,
                                title: "Subject Analytics",
                                desc: "Beautiful charts and breakdowns for each subject. Spot risks before they become problems.",
                                color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
                                iconBg: "bg-blue-100 dark:bg-blue-500/20",
                                delay: "delay-300",
                            },
                            {
                                icon: Shield,
                                title: "Risk Alerts",
                                desc: "Get instant warnings when any subject drops below 75%. Never get detained again.",
                                color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
                                iconBg: "bg-red-100 dark:bg-red-500/20",
                                delay: "delay-100",
                            },
                            {
                                icon: TrendingUp,
                                title: "Trend Prediction",
                                desc: "AI-powered predictions on your attendance trajectory for the rest of the semester.",
                                color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
                                iconBg: "bg-purple-100 dark:bg-purple-500/20",
                                delay: "delay-200",
                            },
                            {
                                icon: Clock,
                                title: "Last Updated Tracking",
                                desc: "Always know when your attendance was last synced. Stay informed in real time.",
                                color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
                                iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
                                delay: "delay-300",
                            },
                        ].map((f, i) => (
                            <div
                                key={f.title}
                                className={`${f.color} border dark:border-slate-700/50 dark:bg-slate-800 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-default ${features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                                style={{ transitionDelay: `${i * 100 + 200}ms` }}
                            >
                                <div className={`h-12 w-12 ${f.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section
                ref={howItWorks.ref}
                className="bg-white dark:bg-slate-800 py-16 md:py-24 px-6 md:px-16"
            >
                <div className="max-w-6xl mx-auto">
                    <div className={`text-center space-y-3 mb-14 transition-all duration-700 ${howItWorks.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                        <p className="text-orange-500 dark:text-orange-400 text-sm font-bold tracking-widest uppercase">How It Works</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Three Steps to Freedom</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div className={`space-y-8 transition-all duration-700 delay-200 ${howItWorks.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
                            {[
                                { step: "01", title: "Create Your Account", desc: "Sign up in seconds with your Google account. Completely free, no credit card needed." },
                                { step: "02", title: "Enter Portal Credentials", desc: "Securely connect to your college portal. Your password is encrypted and never stored in plain text." },
                                { step: "03", title: "Relax & Track", desc: "Your attendance syncs automatically. Get smart insights, bunk predictions, and risk alerts instantly." },
                            ].map((s, i) => (
                                <div key={s.step} className="flex gap-5 items-start group" style={{ transitionDelay: `${i * 150 + 300}ms` }}>
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1b254b] to-[#2dd4bf] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{s.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`transition-all duration-700 delay-500 ${howItWorks.inView ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95"}`}>
                            <Image
                                src="/promo/attendance-sync.png"
                                alt="How attendance sync works"
                                width={500}
                                height={500}
                                className="rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Feature Showcase */}
            <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16 md:py-24 px-6 md:px-16">
                <div
                    ref={testimonial.ref}
                    className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center"
                >
                    <div className={`transition-all duration-700 ${testimonial.inView ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-8 scale-95"}`}>
                        <Image
                            src="/promo/attendance-calc.png"
                            alt="Smart bunk calculator"
                            width={400}
                            height={400}
                            className="rounded-2xl mx-auto"
                        />
                    </div>
                    <div className={`space-y-6 transition-all duration-700 delay-200 ${testimonial.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                            Smart Enough to<br />
                            <span className="text-orange-500 dark:text-orange-400">Calculate Your Bunks</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                            Our smart predictor analyzes your attendance data and tells you exactly how many classes you can skip — per subject — while staying above the minimum threshold.
                        </p>
                        <div className="space-y-3">
                            {["Subject-wise bunk allowance", "Custom target percentage (50-100%)", "Real-time calculation updates"].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
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
                        Ready to Take Control of<br />Your Attendance?
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md mx-auto">
                        Join hundreds of students who never worry about attendance. It only takes 30 seconds to get started.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <Link href="/sign-up" className="group inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 px-10 text-base font-bold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 hover:scale-[1.03] gap-2">
                            Start Free Now
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <p className="text-slate-400 text-sm pt-2">No credit card required · Free forever · Secure</p>
                </div>
            </section>
        </div>
    );
}
