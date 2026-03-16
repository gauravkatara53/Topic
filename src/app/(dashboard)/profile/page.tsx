import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { Mail, Briefcase, GraduationCap, MapPin, CalendarDays, ClipboardCheck, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { EditProfileDialog } from "./_components/edit-profile-dialog";
import { ProfilePromo } from "./_components/profile-promo";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and manage your digital college profile on Topic. Track your attendance, shared notes, and CGPA.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return <ProfilePromo />;
    }

    // Fetch comprehensive user data and stats
    const [userDb, attendance, uploadedFiles] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.attendanceRecord.findMany({ where: { userId } }),
        prisma.file.count({ where: { uploaderId: userId } }),
    ]);

    if (!userDb) {
        // Fallback or create if they somehow reached here without a DB record
        redirect("/");
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || userDb.name || "Student";
    const userInitials = name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "ST";

    const totalClasses = attendance.reduce((acc: number, r: any) => acc + r.total, 0);
    const totalAttended = attendance.reduce((acc: number, r: any) => acc + r.attended, 0);
    const currentAttendance = totalClasses === 0 ? "N/A" : `${((totalAttended / totalClasses) * 100).toFixed(1)}%`;

    const branchMap: Record<string, string> = {
        CS: "Computer Science Engineering",
        EC: "Electronics and Communication Engineering",
        EE: "Electrical Engineering",
        CE: "Civil Engineering",
        ME: "Mechanical Engineering",
        MM: "Metallurgical and Materials Engineering",
        PI: "Production and Industrial Engineering",
        EM: "Electronics and Computer Engineering"
    };

    let branch = userDb.branch || null;
    let semester = userDb.semester || null;
    let rollDisplay = "Not Provided";

    if (userDb.rollNumber && userDb.rollNumber.length >= 8) {
        rollDisplay = userDb.rollNumber.toUpperCase();
        const admissionYear = parseInt(rollDisplay.substring(0, 4), 10);
        const bCode = rollDisplay.substring(6, 8);

        if (branchMap[bCode]) {
            branch = branchMap[bCode];
        }

        if (!isNaN(admissionYear)) {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth(); // 0 is January

            const yearsDifference = currentYear - admissionYear;
            if (currentMonth < 6) { // Spring Semester (Jan-June)
                semester = yearsDifference * 2;
            } else { // Autumn Semester (July-Dec)
                semester = yearsDifference * 2 + 1;
            }
            semester = Math.max(1, Math.min(8, semester));
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10 font-sans">
            <div className="relative">
                <div className="h-48 w-full bg-gradient-to-r from-[#1b254b] to-[#2dd4bf] rounded-2xl"></div>
                <div className="absolute -bottom-16 left-8 flex items-end gap-6 w-full pr-16 justify-between">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-md bg-white">
                        <AvatarImage src={user.imageUrl || ""} alt={name} />
                        <AvatarFallback className="text-4xl bg-teal-50 text-teal-600 font-bold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="mb-4">
                        <EditProfileDialog
                            initialData={{
                                bio: userDb.bio,
                                cgpa: userDb.cgpa,
                                rollNumber: userDb.rollNumber,
                                hostel: userDb.hostel,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-20 px-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{name}</h1>
                        {branch && semester ? (
                            <p className="text-slate-500 font-medium text-[15px] flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> B.Tech {branch} ({Math.ceil(semester / 2)}{semester === 1 || semester === 2 ? 'st' : semester === 3 || semester === 4 ? 'nd' : semester === 5 || semester === 6 ? 'rd' : 'th'} Year)
                            </p>
                        ) : null}
                    </div>
                    <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-none px-4 py-1 flex gap-1.5 items-center">
                        <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0"></span>
                        Active Student
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card className="col-span-2 shadow-sm border-slate-200/60 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800">About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                                {userDb.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself!"}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 text-[14px]">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{user.emailAddresses[0]?.emailAddress || userDb.email || "No email provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{branch || "College of Engineering"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="truncate">{userDb.hostel || "No address/hostel provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="truncate">Roll No: <span className="font-medium text-slate-800">{rollDisplay}</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200/60 rounded-2xl h-max">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Cumulative CGPA</span>
                                <span className={`font-bold ${userDb.cgpa ? 'text-slate-800' : 'text-slate-300 font-normal text-sm'}`}>
                                    {userDb.cgpa ? userDb.cgpa.toFixed(2) : "Not set"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Current Attendance</span>
                                <span className={`font-bold ${currentAttendance !== "N/A" ? 'text-orange-500' : 'text-slate-300 font-normal text-sm'}`}>
                                    {currentAttendance}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500 font-medium">Notes Shared</span>
                                <span className="font-bold text-teal-600">{uploadedFiles}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

