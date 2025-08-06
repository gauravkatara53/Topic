import { useState } from "react";
import { Search, FilePlus } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const branches = ["MM", "EC", "CS", "EE", "ECE", "CSE", "MPIE", "CE"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

// Demo Notes Data (replace with your real API/backend data)
const notesData = [
  {
    id: 1,
    title: "Intro to Programming",
    topic: "Programming Fundamentals",
    semester: 1,
    branch: "CSE",
    subject: "Programming",
    uploadedBy: "Prof. Gupta",
    date: "2024-06-15",
    status: "Approved",
  },
  {
    id: 2,
    title: "Circuit Analysis Notes",
    topic: "Electrical Circuits",
    semester: 3,
    branch: "ECE",
    subject: "Electrical",
    uploadedBy: "Dr. Mehta",
    date: "2024-07-10",
    status: "Pending",
  },
  {
    id: 3,
    title: "Thermodynamics Revision",
    topic: "Thermodynamics",
    semester: 4,
    branch: "ME",
    subject: "Mechanical",
    uploadedBy: "Prof. Singh",
    date: "2024-05-21",
    status: "Approved",
  },
  // Add more as needed
];

const AdminNotesPage = () => {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");

  // Filtering notes data according to filters and search
  const filteredData = notesData.filter((note) => {
    return (
      (note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.topic.toLowerCase().includes(search.toLowerCase()) ||
        note.subject.toLowerCase().includes(search.toLowerCase())) &&
      (topic === "" ||
        note.topic.toLowerCase().includes(topic.toLowerCase())) &&
      (semester === "" || note.semester === Number(semester)) &&
      (branch === "" || note.branch === branch) &&
      (subject === "" ||
        note.subject.toLowerCase().includes(subject.toLowerCase()))
    );
  });

  return (
    <div className="flex h-screen box-border bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-wide">
            Notes Management
          </h1>
          <button
            type="button"
            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-3 rounded-lg shadow-lg transition font-semibold whitespace-nowrap"
          >
            <FilePlus className="w-5 h-5" />
            Add New Note
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

          {/* Topic */}
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic"
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 min-w-[130px]"
            aria-label="Filter by topic"
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

          {/* Branch with emoji label */}
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

          {/* Subject */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 min-w-[130px]"
            aria-label="Filter by subject"
          />
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
                  Topic
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Semester
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Branch
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Subject
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
                filteredData.map((note, idx) => (
                  <tr
                    key={note.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition cursor-default`}
                    title={note.title}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {note.title}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.topic}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.semester}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.branch}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.subject}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.uploadedBy}
                    </td>

                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          note.status === "Approved"
                            ? "bg-green-200 text-green-900"
                            : "bg-yellow-200 text-yellow-900"
                        }`}
                      >
                        {note.status}
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
                    colSpan={9}
                    className="text-center py-10 text-gray-500 font-semibold italic"
                  >
                    No Notes found matching your criteria.
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

export default AdminNotesPage;
