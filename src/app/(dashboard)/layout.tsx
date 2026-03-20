import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
