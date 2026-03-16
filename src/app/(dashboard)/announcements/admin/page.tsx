import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminAnnouncementForm } from "./_components/admin-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post Announcement",
  description: "Create a new notice or event for students (Admin Only).",
};

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || (user?.publicMetadata?.role !== "ADMIN" && user?.publicMetadata?.role !== "FACULTY")) {
        redirect("/announcements"); // Protect page
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Post Announcement</h2>
                <p className="text-muted-foreground">Create a new notice or event for students.</p>
            </div>

            <AdminAnnouncementForm />
        </div>
    );
}
