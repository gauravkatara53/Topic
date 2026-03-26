"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";

export function EditProfileDialog({
    initialData
}: {
    initialData: { bio: string | null; cgpa: number | null; rollNumber: string | null; hostel: string | null }
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [bio, setBio] = useState(initialData.bio || "");
    const [cgpa, setCgpa] = useState(initialData.cgpa?.toString() || "");
    const [rollNumber, setRollNumber] = useState(initialData.rollNumber || "");
    const [hostel, setHostel] = useState(initialData.hostel || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio, cgpa, rollNumber, hostel }),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            toast.success("Profile updated successfully!");
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update profile data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shrink-0 border-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Edit2 className="h-4 w-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">About Me / Bio</label>
                        <Textarea
                            placeholder="A short bio about yourself..."
                            value={bio}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">CGPA</label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="E.g. 8.5"
                                value={cgpa}
                                onChange={(e) => setCgpa(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Roll Number</label>
                            <Input
                                type="text"
                                placeholder="E.g. 2023UGMM057"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hostel / Address</label>
                        <Input
                            placeholder="E.g. Campus Hostel, Block B"
                            value={hostel}
                            onChange={(e) => setHostel(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
