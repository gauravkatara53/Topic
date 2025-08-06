import { useState } from "react";
import { Search, FilePlus } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const branches = ["MM", "EC", "CS", "EE", "ECE", "CSE", "MPIE", "CE"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const terms = ["MID", "END"];
const currentYear = new Date().getFullYear();
const sessions = Array.from({ length: 8 }, (_, i) => currentYear - i);

// Demo PYQ Data (replace with your API/backend data)
const pyqData = [
  {
    id: 1,
    title: "Data Structures - 2022",
    subject: "Data Structures",
    branch: "CSE",
    semester: 3,
    term: "MID",
    session: 2022,
    uploadedBy: "Prof. Sharma",
    date: "2024-06-12",
    status: "Approved",
  },
  {
    id: 2,
    title: "Digital Logic - 2023",
    subject: "Digital Logic",
    branch: "ECE",
    semester: 2,
    term: "END",
    session: 2023,
    uploadedBy: "Dr. Singh",
    date: "2024-07-21",
    status: "Pending",
  },
  {
    id: 3,
    title: "Thermodynamics - 2021",
    subject: "Thermodynamics",
    branch: "ME",
    semester: 4,
    term: "MID",
    session: 2021,
    uploadedBy: "Prof. Kapoor",
    date: "2024-05-15",
    status: "Approved",
  },
  // Add more items as needed
];

const AdminPYQPage = () => {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [term, setTerm] = useState("");
  const [sessionFrom, setSessionFrom] = useState("");
  const [sessionTo, setSessionTo] = useState("");

  // Filter logic
  const filteredData = pyqData.filter((pyq) => {
    const sessionNum = Number(pyq.session);
    const sessionFromNum = Number(sessionFrom);
    const sessionToNum = Number(sessionTo);

    const withinSession =
      (!sessionFrom || sessionNum >= sessionFromNum) &&
      (!sessionTo || sessionNum <= sessionToNum);

    return (
      (pyq.title.toLowerCase().includes(search.toLowerCase()) ||
        pyq.subject.toLowerCase().includes(search.toLowerCase())) &&
      (subject === "" ||
        pyq.subject.toLowerCase().includes(subject.toLowerCase())) &&
      (semester === "" || pyq.semester === Number(semester)) &&
      (branch === "" || pyq.branch === branch) &&
      (term === "" || pyq.term === term) &&
      withinSession
    );
  });

  return (
    <div className="flex h-screen box-border bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-wide">
            PYQ Management
          </h1>
          <button
            type="button"
            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-3 rounded-lg shadow-lg transition font-semibold whitespace-nowrap"
          >
            <FilePlus className="w-5 h-5" />
            Add New PYQ
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 flex flex-wrap gap-4 items-center mb-6">
          {/* Search */}
          <div className="flex items-center gap-2 flex-grow min-w-[220px] bg-gray-100 rounded-md px-3 py-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search title/topic/subject..."
              className="outline-none bg-transparent w-full text-gray-700 placeholder-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search title, topic or subject"
            />
          </div>

          {/* Subject */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 min-w-[130px]"
            aria-label="Filter by subject"
          />

          {/* Semester */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Filter by semester"
          >
            <option value="">Semester</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>

          {/* Branch */}
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Filter by branch"
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Term */}
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Filter by term"
          >
            <option value="">Select Term</option>
            {terms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Session From */}
          <select
            value={sessionFrom}
            onChange={(e) => setSessionFrom(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Session from year"
          >
            <option value="">Session From</option>
            {[...sessions].reverse().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Session To */}
          <select
            value={sessionTo}
            onChange={(e) => setSessionTo(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700"
            aria-label="Session to year"
          >
            <option value="">Session To</option>
            {sessions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-300">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-100 text-indigo-900 font-semibold">
                <th className="text-left px-6 py-4 border-b border-gray-300">
                  Title
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Subject
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Branch
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Semester
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Term
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Session
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Uploaded By
                </th>

                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Status
                </th>
                <th className="text-right px-6 py-4 border-b border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length ? (
                filteredData.map((pyq, idx) => (
                  <tr
                    key={pyq.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition cursor-default`}
                    title={pyq.title}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {pyq.title}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.subject}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.branch}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.semester}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.term}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.session}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.uploadedBy}
                    </td>

                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pyq.status === "Approved"
                            ? "bg-green-200 text-green-900"
                            : "bg-yellow-200 text-yellow-900"
                        }`}
                      >
                        {pyq.status}
                      </span>
                    </td>
                    <td className="text-right px-6 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-indigo-700 hover:text-indigo-900 font-semibold transition mr-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 font-semibold transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-10 text-gray-500 font-semibold italic"
                  >
                    No PYQs found matching your criteria.
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

export default AdminPYQPage;
