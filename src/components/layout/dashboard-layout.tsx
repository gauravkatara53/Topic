import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen relative flex bg-background">
            <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
                <Sidebar />
            </div>
            <main className="md:pl-64 flex-1 h-full overflow-y-auto w-full bg-slate-50">
                <TopNav />
                <div className="p-3 md:p-4 lg:p-6 md:pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
