"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export function AddEventDialog({ onEventAdded }: { onEventAdded: (event: any) => void }) {
    const { user } = useUser();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("deadline");
    const [description, setDescription] = useState("");

    const isAdmin = user?.publicMetadata?.role === "ADMIN";

    if (!isAdmin) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !type) {
            toast.error("Please fill in required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, date, type, description }),
            });

            if (!res.ok) throw new Error("Failed to create event");

            const newEvent = await res.json();
            onEventAdded(newEvent);
            toast.success("Event created successfully");
            setOpen(false);
            setTitle("");
            setDate("");
            setDescription("");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" /> Add Event
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Calendar Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            placeholder="E.g., Submission Deadline"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="deadline">Personal Deadline</SelectItem>
                                <SelectItem value="event">Personal Event</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                                <SelectItem value="holiday">Holiday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Input
                            placeholder="Add some details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Saving..." : "Save Event"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
