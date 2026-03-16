"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export function UploadFileDialog({ onUpload }: { onUpload: (file: any) => void }) {
    const { user, isLoaded } = useUser();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileObj, setFileObj] = useState<File | null>(null);

    const [branch, setBranch] = useState("CSE");
    const [semester, setSemester] = useState("1");
    const [subject, setSubject] = useState("");
    const [type, setType] = useState("Notes");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !fileObj || !user) {
            toast.error("Please fill in all fields (Sign in required)");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", fileObj);
            formData.append("branch", branch);
            formData.append("semester", semester);
            formData.append("subject", subject);
            formData.append("type", type);

            const res = await fetch("/api/notes/upload", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Upload failed");
            }

            const newFile = await res.json();
            onUpload(newFile);
            toast.success("File uploaded successfully");
            setOpen(false);
            setSubject("");
            setFileObj(null);
        } catch (error: any) {
            toast.error(error.message || "Upload error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (val && !user) {
                toast.error("Please sign in to upload materials", {
                    action: {
                        label: "Sign In",
                        onClick: () => window.location.href = "/sign-in",
                    },
                });
                return;
            }
            setOpen(val);
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2 w-full md:w-auto shrink-0 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 shadow-sm transition-colors">
                    <Upload className="h-4 w-4" /> Upload Material
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription>Share notes or previous year questions.</DialogDescription>
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium">File (PDF/DOC/Image)</label>
                        <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => setFileObj(e.target.files?.[0] || null)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Uploading..." : "Upload File"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
