import {
  LayoutGrid,
  BookOpen,
  HelpCircle,
  FileWarning,
  ShoppingCart,
  Newspaper,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarLinks = [
  { label: "Dashboard", icon: LayoutGrid, href: "/admin/dashboard" },
  { label: "News", icon: Newspaper, href: "/admin/news" },
  { label: "Notes", icon: BookOpen, href: "/admin/notes" },
  { label: "PYQs", icon: HelpCircle, href: "/admin/pyq" },
  { label: "Complaint", icon: FileWarning, href: "/admin/complaint" },
  { label: "Buy & Sell", icon: ShoppingCart, href: "/admin/marketplace" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="h-screen w-64 bg-gradient-to-br from-gray-50 to-white border-r shadow-lg p-5 flex flex-col">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 mb-8 pl-1">
        <span className="rounded-full bg-blue-100 p-2 shadow-inner">
          <LayoutGrid className="w-6 h-6 text-blue-700" />
        </span>
        <span className="text-2xl font-bold text-blue-900 tracking-wider">
          Admin
        </span>
      </div>
      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {sidebarLinks.map(({ label, icon: Icon, href }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={label}
              to={href}
              className={`
                flex items-center gap-4 px-4 py-3 my-1 rounded-xl font-semibold text-base
                transition bg-white/80 shadow-sm hover:bg-blue-100 hover:text-blue-900 group
                ${
                  isActive
                    ? "bg-[#1938d2f6] text-white shadow-lg hover:bg-blue-600"
                    : "text-gray-700"
                }
              `}
              style={{
                boxShadow: isActive
                  ? "0 2px 12px 0 rgba(37, 78, 159, 0.25)"
                  : undefined,
              }}
            >
              <Icon
                className={`w-5 h-5 transition ${
                  isActive
                    ? "text-white"
                    : "text-blue-700 group-hover:text-blue-800"
                }`}
              />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-300"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Optional footer or avatar */}
      <div className="mt-auto flex flex-col items-center pt-8">
        <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow-inner">
          <span className="text-lg font-bold text-blue-700">A</span>
        </div>
        <span className="text-xs text-gray-500">Admin</span>
      </div>
    </aside>
  );
};

export default AdminSidebar;
