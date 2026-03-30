import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function DashboardTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (userId && clerkUser) {
        // Sync user to DB if not exists
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : "Student",
                email: clerkUser.emailAddresses[0]?.emailAddress || "",
            }
        });
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
