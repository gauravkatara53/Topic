import { useState } from "react";
import { Search, Eye, Edit2, Trash2 } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

// Report types and status options
const reportTypes = [
  "Bug",
  "Content Issue",
  "User Complaint",
  "Feature Request",
];
const reportStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];

// Demo report data - replace with your real API/backend data
const reportsData = [
  {
    id: 1,
    title: "App crashes on login",
    type: "Bug",
    status: "Pending",
    user: "john_doe",
    dateReported: "2024-07-01",
    description: "The app crashes every time when I try to log in on Android.",
  },
  {
    id: 2,
    title: "Inappropriate content in notes",
    type: "Content Issue",
    status: "In Progress",
    user: "jane_smith",
    dateReported: "2024-06-21",
    description: "Some notes contain inappropriate language.",
  },
  {
    id: 3,
    title: "Feature request: Dark Mode",
    type: "Feature Request",
    status: "Resolved",
    user: "alice87",
    dateReported: "2024-05-10",
    description: "Please add dark mode support for better nighttime reading.",
  },
  // Add more as needed
];

const AdminReportsPage = () => {
  // Filters state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, _setDateTo] = useState("");

  // Filter logic
  const filteredReports = reportsData.filter((report) => {
    const reportDate = new Date(report.dateReported);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const inDateRange =
      (!fromDate || reportDate >= fromDate) &&
      (!toDate || reportDate <= toDate);

    return (
      (report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.description.toLowerCase().includes(search.toLowerCase())) &&
      (type === "" || report.type === type) &&
      (status === "" || report.status === status) &&
      (user === "" || report.user.toLowerCase().includes(user.toLowerCase())) &&
      inDateRange
    );
  });

  return (
    <div className="flex h-screen box-border bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-wide">
            Complaint
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 flex flex-wrap gap-4 items-center mb-6">
          {/* Search */}
          <div className="flex items-center gap-2 flex-grow min-w-[220px] bg-gray-100 rounded-md px-3 py-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search title or description..."
              className="outline-none bg-transparent w-full text-gray-700 placeholder-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search reports by title or description"
            />
          </div>

          {/* Report Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Filter by report type"
          >
            <option value="">Report Type</option>
            {reportTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Filter by report status"
          >
            <option value="">Status</option>
            {reportStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* User */}
          <input
            type="text"
            placeholder="User"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 min-w-[130px]"
            aria-label="Filter by user"
          />

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 max-w-[160px]"
            aria-label="Filter reports from date"
          />
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-300">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-100 text-indigo-900 font-semibold">
                <th className="text-left px-6 py-4 border-b border-gray-300">
                  Title
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Type
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Status
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  User
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Date Reported
                </th>

                <th className="text-right px-6 py-4 border-b border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length ? (
                filteredReports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition cursor-default`}
                    title={report.title}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {report.title}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {report.type}
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === "Resolved"
                            ? "bg-green-200 text-green-900"
                            : report.status === "Rejected"
                            ? "bg-red-200 text-red-900"
                            : "bg-yellow-200 text-yellow-900"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {report.user}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {report.dateReported}
                    </td>

                    <td className="text-right px-6 py-3 whitespace-nowrap flex justify-end gap-3">
                      <button
                        type="button"
                        className="text-gray-600 hover:text-indigo-700 transition"
                        title="View"
                        aria-label="View report details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="text-indigo-700 hover:text-indigo-900 transition"
                        title="Edit"
                        aria-label="Edit report"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                        aria-label="Delete report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-500 font-semibold italic"
                  >
                    No reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminReportsPage;
