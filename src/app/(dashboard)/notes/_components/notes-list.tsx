"use client";

import { useState } from "react";
import { Search, Download, Star, BookOpen, Share2, ThumbsUp, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFileDialog } from "./upload-dialog";
import { EditFileDialog } from "./edit-dialog";
import { useUser } from "@clerk/nextjs";

export function NotesList({ initialFiles }: { initialFiles: any[] }) {
    const { user } = useUser();
    const [files, setFiles] = useState(initialFiles);
    const [search, setSearch] = useState("");
    const [branch, setBranch] = useState("All");
    const [semester, setSemester] = useState("All");
    const [type, setType] = useState("All");
    const [ownership, setOwnership] = useState("All");
    const [likedFiles, setLikedFiles] = useState<Set<string>>(new Set());

    const filteredFiles = files.filter((f) => {
        const sMatch = f.subject.toLowerCase().includes(search.toLowerCase());
        const bMatch = branch === "All" || f.branch === branch;
        const semMatch = semester === "All" || f.semester.toString() === semester;
        const tMatch = type === "All" || f.type === type;
        const oMatch = ownership === "All" || (user && f.uploaderId === user.id);
        return sMatch && bMatch && semMatch && tMatch && oMatch;
    });

    const topFiles = [...files]
        .sort((a, b) => {
            if (b.downloads !== a.downloads) return b.downloads - a.downloads;
            return b.rating - a.rating;
        })
        .slice(0, 3);

    const displayTopFiles = [0, 1, 2].map((index) => {
        const file = topFiles[index];
        if (file) {
            return {
                title: file.subject,
                downloads: file.downloads || 0,
                rank: index + 1,
                isEmpty: false
            };
        }
        return {
            title: "No notes yet",
            downloads: 0,
            rank: index + 1,
            isEmpty: true
        };
    });

    const handleFileUpload = (newFile: any) => {
        setFiles([newFile, ...files]);
    };

    const handleFileUpdate = (updatedFile: any) => {
        setFiles(files.map(f => f.id === updatedFile.id ? updatedFile : f));
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/notes/${fileId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            setFiles(files.filter(f => f.id !== fileId));
            toast.success("File deleted successfully");
        } catch (error) {
            toast.error("Failed to delete file");
            console.error(error);
        }
    };

    const [editingFile, setEditingFile] = useState<any | null>(null);

    const handleDownload = async (file: any) => {
        // Optimistic UI update
        setFiles(files.map(f => f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f));
        // Real download
        window.open(file.url, "_blank");

        try {
            await fetch("/api/notes/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: file.id, action: "download" })
            });
        } catch (error) {
            console.error("Failed to track download", error);
        }
    };

    const handleRate = async (fileId: string) => {
        if (likedFiles.has(fileId)) return;

        // Optimistic UI update (give a 5 star rating locally for instant feedback)
        setLikedFiles(prev => new Set(prev).add(fileId));
        setFiles(files.map(f => {
            if (f.id === fileId) {
                const newCount = f.ratingCount + 1;
                const newRating = ((f.rating * f.ratingCount) + 5) / newCount;
                return { ...f, rating: newRating, ratingCount: newCount };
            }
            return f;
        }));
        toast.success("Thanks for rating!");

        try {
            await fetch("/api/notes/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId, action: "rate", value: 5 })
            });
        } catch (error) {
            console.error("Failed to submit rating", error);
        }
    };

    const handleShare = async (file: any) => {
        const shareData = {
            title: `Topic - ${file.subject} ${file.type}`,
            text: `Check out these ${file.subject} ${file.type} on Topic!`,
            url: file.url,
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(file.url);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Find Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative flex-1 max-w-2xl w-full">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Search notes or subjects..."
                        className="pl-10 h-10 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-teal-500 w-full shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <Select value={ownership} onValueChange={setOwnership}>
                        <SelectTrigger className="w-[130px] h-10 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-600 dark:text-slate-300 text-sm">
                            <SelectValue placeholder="All Notes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Notes</SelectItem>
                            <SelectItem value="Mine" disabled={!user}>My Notes</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger className="w-[130px] h-10 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-600 dark:text-slate-300 text-sm">
                            <SelectValue placeholder="Branch: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Branch: All</SelectItem>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="ECE">ECE</SelectItem>
                            <SelectItem value="EEE">EEE</SelectItem>
                            <SelectItem value="CE">CE</SelectItem>
                            <SelectItem value="ECM">ECM</SelectItem>
                            <SelectItem value="PIE">PIE</SelectItem>
                            <SelectItem value="MME">MME</SelectItem>
                            <SelectItem value="ME">ME</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger className="w-[140px] h-10 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-600 dark:text-slate-300 text-sm">
                            <SelectValue placeholder="Semester: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Semester: All</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-[150px] h-10 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-600 dark:text-slate-300 text-sm">
                            <SelectValue placeholder="Type: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Type: All</SelectItem>
                            <SelectItem value="Notes">Notes</SelectItem>
                            <SelectItem value="PYQ">Previous Year Qs</SelectItem>
                            <SelectItem value="Assignment">Assignment</SelectItem>
                        </SelectContent>
                    </Select>

                    <UploadFileDialog onUpload={handleFileUpload} />
                </div>
            </div>

            {/* Top Downloaded Banner */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#20948b] dark:from-slate-900 dark:to-teal-900 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 fill-current" /> Top Downloaded
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full">
                    {displayTopFiles.map(n => (
                        <div key={n.rank} className={`bg-white/10 dark:bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm ${n.isEmpty ? 'opacity-50' : ''}`}>
                            <span className="text-2xl font-black text-white/40 block mb-1">#{n.rank}</span>
                            <p className="font-semibold text-white truncate">{n.title}</p>
                            {!n.isEmpty && <p className="text-sm text-white/60">{n.downloads} downloads</p>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFiles.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-dashed">
                        No files found matching your criteria.
                    </div>
                ) : (
                    filteredFiles.map((file) => (
                        <Card key={file.id} className="group hover:shadow-md transition-shadow rounded-2xl border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6 bg-white dark:bg-slate-800 overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${file.type === 'PYQ' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400' : 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'}`}>
                                    <BookOpen className="h-3 w-3" />
                                    {file.type}
                                </div>
                                <div className="flex gap-1 text-xs items-center font-bold text-orange-400">
                                    <Star className="h-3.5 w-3.5 fill-current" /> {file.rating.toFixed(1)}
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{file.subject}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {file.branch} · {file.semester}{file.semester === 1 ? 'st' : file.semester === 2 ? 'nd' : file.semester === 3 ? 'rd' : 'th'}
                                </p>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-xs text-slate-400 dark:text-slate-500">by {file.uploader?.name || "Anonymous"}</p>
                                    {user?.id === file.uploaderId && (
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => setEditingFile(file)}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDelete(file.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Download className="h-3.5 w-3.5" /> {file.downloads || 0}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-8 w-8 transition-colors ${likedFiles.has(file.id) ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10'}`}
                                        onClick={() => handleRate(file.id)}
                                        disabled={likedFiles.has(file.id)}
                                    >
                                        <ThumbsUp className={`h-4 w-4 ${likedFiles.has(file.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10" onClick={() => handleShare(file)}>
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleDownload(file)}
                                        className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center gap-1.5 rounded-lg ml-1"
                                    >
                                        <Download className="h-3.5 w-3.5" /> Get
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
            {editingFile && (
                <EditFileDialog
                    file={editingFile}
                    open={!!editingFile}
                    onOpenChange={(open) => !open && setEditingFile(null)}
                    onUpdate={handleFileUpdate}
                />
            )}
        </div>
    );
}
