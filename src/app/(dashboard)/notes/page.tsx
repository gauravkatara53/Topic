import { prisma } from "@/lib/prisma";
import { NotesList } from "./_components/notes-list";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes & PYQ",
  description: "Browse, download, and share college study materials, notes, and previous year question papers for your branch and semester.",
};

export const dynamic = "force-dynamic";

export default async function NotesPage() {
    const initialFiles = await prisma.file.findMany({
        orderBy: { createdAt: "desc" },
        include: { uploader: { select: { name: true } } }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Notes & PYQ</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Browse and download study materials</p>
                </div>
            </div>

            <NotesList initialFiles={initialFiles} />
        </div>
    );
}
