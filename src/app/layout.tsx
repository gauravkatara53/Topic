import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Topic",
    default: "Topic - College Companion",
  },
  description: "The ultimate college companion app for NIT Jamshedpur students. Track attendance, manage notes, check CGPA leaderboard, and view college calendar.",
  keywords: ["Topic", "NIT Jsr", "NIT Jamshedpur", "College Companion", "Attendance Tracker", "CGPA Calculator", "College Notes", "Student Portal"],
  authors: [{ name: "Topic Team" }],
  creator: "Topic",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://topic.app",
    title: "Topic - College Companion",
    description: "The ultimate college companion app for NIT Jamshedpur students. Track attendance, manage notes, check CGPA leaderboard.",
    siteName: "Topic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Topic - College Companion",
    description: "The ultimate college companion app for NIT Jamshedpur students.",
    creator: "@topic",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${instrumentSans.variable} font-sans antialiased text-slate-800`}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
