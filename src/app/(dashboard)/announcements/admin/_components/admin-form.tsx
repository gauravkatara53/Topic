"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pin } from "lucide-react";

export function AdminAnnouncementForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("general");
    const [pinned, setPinned] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !category) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, category, pinned }),
            });

            if (!res.ok) throw new Error("Failed to post");

            toast.success("Announcement posted successfully!");
            setTitle("");
            setContent("");
            setCategory("general");
            setPinned(false);
            router.push("/announcements");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            placeholder="E.g., Mid-Sem Exam Schedule"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={category} onValueChange={setCategory} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="exam">Exam</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                                <SelectItem value="holiday">Holiday</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content / Body</label>
                        <textarea
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter the full details here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setPinned(!pinned)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors ${pinned ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400" : "bg-transparent text-muted-foreground"
                                }`}
                        >
                            <Pin className={`h-4 w-4 ${pinned ? "fill-current" : ""}`} />
                            Pin to Top
                        </button>
                        <span className="text-xs text-muted-foreground">
                            Marks this as high-priority
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 py-4 border-t px-6">
                    <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                        {loading ? "Posting..." : "Post Announcement"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
