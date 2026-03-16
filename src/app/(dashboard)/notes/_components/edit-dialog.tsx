"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EditDialogProps {
    file: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (updatedFile: any) => void;
}

export function EditFileDialog({ file, open, onOpenChange, onUpdate }: EditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [branch, setBranch] = useState(file.branch);
    const [semester, setSemester] = useState(file.semester.toString());
    const [subject, setSubject] = useState(file.subject);
    const [type, setType] = useState(file.type);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject) {
            toast.error("Subject cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${file.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    branch,
                    semester,
                    subject,
                    type,
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Update failed");
            }

            const updatedFile = await res.json();
            // Preserve relational expansions like `uploader` that might not come back from a pure update API
            onUpdate({ ...file, ...updatedFile });
            toast.success("File updated successfully");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Update error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit File Metadata</DialogTitle>
                    <DialogDescription>Update the details describing your uploaded file.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Branch</label>
                            <Select value={branch} onValueChange={setBranch}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
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
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Semester</label>
                            <Select value={semester} onValueChange={setSemester}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                                placeholder="E.g., Data Structures"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Notes">Notes</SelectItem>
                                    <SelectItem value="PYQ">Previous Year Qs</SelectItem>
                                    <SelectItem value="Assignment">Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
