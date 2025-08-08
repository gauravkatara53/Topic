import React, { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "@/services/adminService";

interface UserSummary {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";

const PAGE_LIMIT = 10; // How many users per page?

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Fetch all users (once, no filtering)
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const data = await fetchUsers({});
        setAllUsers(data.users || []);
        setPage(1);
      } catch (e) {
        console.error(e);
        setAllUsers([]);
        setPage(1);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Apply filter in frontend and paginate
  useEffect(() => {
    let filtered = allUsers;

    if (search.trim() !== "") {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    if (email.trim() !== "") {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(email.trim().toLowerCase())
      );
    }
    if (phone.trim() !== "") {
      filtered = filtered.filter((user) =>
        (user.phone || "").toLowerCase().includes(phone.trim().toLowerCase())
      );
    }

    const paginatedUsers = filtered.slice(
      (page - 1) * PAGE_LIMIT,
      page * PAGE_LIMIT
    );

    setUsers(paginatedUsers);
  }, [search, email, phone, allUsers, page]);

  const totalFilteredUsers = allUsers.filter((user) => {
    return (
      user.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      user.email.toLowerCase().includes(email.trim().toLowerCase()) &&
      (user.phone || "").toLowerCase().includes(phone.trim().toLowerCase())
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredUsers.length / PAGE_LIMIT)
  );

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1); // Always reset to page 1 on filter change
    };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex h-screen box-border bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Title and Filters */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-wide">
            Users
          </h1>
        </div>
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center gap-2 flex-grow min-w-[150px] bg-gray-100 rounded-md px-3 py-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search name..."
              className="outline-none bg-transparent w-full text-gray-700 placeholder-gray-500"
              value={search}
              onChange={handleFilterChange(setSearch)}
              aria-label="Search users by name"
            />
          </div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={handleFilterChange(setEmail)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 min-w-[150px]"
            aria-label="Filter by email"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={handleFilterChange(setPhone)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 min-w-[120px]"
            aria-label="Filter by phone"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-300">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-100 text-indigo-900 font-semibold">
                <th className="text-left px-6 py-4 border-b border-gray-300">
                  Avatar
                </th>
                <th className="text-left px-6 py-4 border-b border-gray-300">
                  Name
                </th>
                <th className="text-left px-6 py-4 border-b border-gray-300">
                  Email
                </th>
                <th className="text-left px-6 py-4 border-b border-gray-300">
                  Phone
                </th>
                <th className="text-center px-6 py-4 border-b border-gray-300">
                  Active
                </th>
                <th className="text-right px-6 py-4 border-b border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, idx) => (
                  <tr
                    key={user._id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition cursor-default`}
                  >
                    <td className="px-6 py-3">
                      <img
                        src={
                          user.avatar &&
                          user.avatar !== "default_profile_image.png"
                            ? user.avatar
                            : FALLBACK_AVATAR
                        }
                        alt={`${user.name} avatar`}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{user.email}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {user.phone || "N/A"}
                    </td>
                    <td className="text-center px-6 py-3">
                      {user.isActive ? (
                        <span className="px-2 py-1 rounded-full bg-green-200 text-green-800 text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-red-200 text-red-800 text-xs">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-right px-6 py-3 flex justify-end gap-3">
                      <button
                        type="button"
                        className="text-indigo-700 hover:text-indigo-900 transition"
                        title="View Profile"
                        aria-label="View user profile"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 font-semibold italic"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => goToPage(page - 1)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md font-semibold ${
              page === 1 || loading
                ? "cursor-not-allowed border-gray-300 text-gray-400"
                : "border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="flex items-center font-semibold text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages || loading}
            onClick={() => goToPage(page + 1)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md font-semibold ${
              page === totalPages || loading
                ? "cursor-not-allowed border-gray-300 text-gray-400"
                : "border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            }`}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
