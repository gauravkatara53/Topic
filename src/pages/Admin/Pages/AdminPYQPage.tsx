import React, { useEffect, useState } from "react";
import { Search, FilePlus, X, ExternalLink } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { fetchPYQs, editPyqService } from "@/services/pyqService";

const branches = ["MM", "EC", "CS", "EE", "ECE", "CSE", "MPIE", "CE"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const terms = ["MID", "END"];
const currentYear = new Date().getFullYear();
const sessions = Array.from({ length: 8 }, (_, i) => currentYear - i);

const AdminPYQPage = () => {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [term, setTerm] = useState("");
  const [sessionFrom, setSessionFrom] = useState("");
  const [sessionTo, setSessionTo] = useState("");

  const [pyqs, setPyqs] = useState<any[]>([]);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPyqData, setEditPyqData] = useState<any>(null);

  // Fetch PYQs from API with filters
  useEffect(() => {
    const loadPYQs = async () => {
      try {
        const fetchedPYQs = await fetchPYQs({
          title: search,
          subject,
          semester,
          branch,
          term,
          sessionFrom: sessionFrom ? Number(sessionFrom) : undefined,
          sessionTo: sessionTo ? Number(sessionTo) : undefined,
          page: 1,
          limit: 20,
          uploader: "", // Replace with real uploader ID if needed
        });
        setPyqs(fetchedPYQs);
      } catch (error) {
        console.error("Failed to fetch PYQs:", error);
      }
    };
    loadPYQs();
  }, [search, subject, semester, branch, term, sessionFrom, sessionTo]);

  // Open edit modal
  const openEditModal = (pyq: any) => {
    setEditPyqData(pyq);
    setIsEditModalOpen(true);
  };
  // Close edit modal
  const closeEditModal = () => {
    setEditPyqData(null);
    setIsEditModalOpen(false);
  };

  // Handle form change in edit modal
  const handleEditFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!editPyqData) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditPyqData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit edited PYQ
  const handleEditSubmit = async () => {
    if (!editPyqData) return;

    const {
      _id,
      title,
      description,
      semester,
      branch,
      sessionFrom,
      sessionTo,
      subject,
      visibility,
      isApproved,
      rejectionReason,
      term,
    } = editPyqData;

    try {
      await editPyqService(_id, {
        title,
        description,
        semester,
        branch,
        sessionFrom,
        sessionTo,
        subject,
        visibility,
        isApproved,
        rejectionReason,
        term,
      });
      closeEditModal();

      // Refresh list
      const refreshedPYQs = await fetchPYQs({
        title: search,
        subject,
        semester,
        branch,
        term,
        sessionFrom: sessionFrom ? Number(sessionFrom) : undefined,
        sessionTo: sessionTo ? Number(sessionTo) : undefined,
        page: 1,
        limit: 20,
        uploader: "",
      });
      setPyqs(refreshedPYQs);
    } catch (err) {
      console.error("Error updating PYQ:", err);
    }
  };

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
                  Session From
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Session To
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
              {pyqs.length ? (
                pyqs.map((pyq) => (
                  <tr
                    key={pyq._id}
                    className="hover:bg-indigo-50 transition cursor-default"
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
                      {pyq.sessionFrom}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.sessionTo}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {pyq.uploadedBy}
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pyq.isApproved
                            ? "bg-green-200 text-green-900"
                            : "bg-yellow-200 text-yellow-900"
                        }`}
                      >
                        {pyq.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="text-right px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-indigo-700 hover:text-indigo-900 font-semibold transition"
                          onClick={() => openEditModal(pyq)}
                        >
                          Edit
                        </button>
                        <a
                          href={pyq.link || pyq.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-900"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {/* Add delete button here if needed */}
                      </div>
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

        {/* Edit PYQ Modal */}
        {isEditModalOpen && editPyqData && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
                onClick={closeEditModal}
                aria-label="Close edit modal"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">Edit PYQ</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block mb-1 font-semibold">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={editPyqData.title || ""}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block mb-1 font-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={editPyqData.description || ""}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="semester"
                      className="block mb-1 font-semibold"
                    >
                      Semester
                    </label>
                    <input
                      id="semester"
                      name="semester"
                      type="number"
                      min={1}
                      max={8}
                      value={editPyqData.semester || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="branch"
                      className="block mb-1 font-semibold"
                    >
                      Branch
                    </label>
                    <input
                      id="branch"
                      name="branch"
                      type="text"
                      value={editPyqData.branch || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sessionFrom"
                      className="block mb-1 font-semibold"
                    >
                      Session From
                    </label>
                    <input
                      id="sessionFrom"
                      name="sessionFrom"
                      type="number"
                      min={2000}
                      max={new Date().getFullYear()}
                      value={editPyqData.sessionFrom || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sessionTo"
                      className="block mb-1 font-semibold"
                    >
                      Session To
                    </label>
                    <input
                      id="sessionTo"
                      name="sessionTo"
                      type="number"
                      min={2000}
                      max={new Date().getFullYear()}
                      value={editPyqData.sessionTo || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block mb-1 font-semibold">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={editPyqData.subject || ""}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <label
                      htmlFor="visibility"
                      className="block mb-1 font-semibold"
                    >
                      Visibility
                    </label>
                    <select
                      id="visibility"
                      name="visibility"
                      value={editPyqData.visibility || "public"}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isApproved"
                      name="isApproved"
                      type="checkbox"
                      checked={!!editPyqData.isApproved}
                      onChange={handleEditFormChange}
                      className="h-4 w-4"
                    />
                    <label htmlFor="isApproved" className="font-semibold">
                      Approved
                    </label>
                  </div>

                  <div>
                    <label htmlFor="term" className="block mb-1 font-semibold">
                      Term
                    </label>
                    <select
                      id="term"
                      name="term"
                      value={editPyqData.term || ""}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Term</option>
                      {terms.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="block mb-1 font-semibold"
                  >
                    Rejection Reason
                  </label>
                  <input
                    id="rejectionReason"
                    name="rejectionReason"
                    type="text"
                    value={editPyqData.rejectionReason || ""}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                    disabled={!!editPyqData.isApproved}
                    placeholder={
                      editPyqData.isApproved ? "Not applicable if approved" : ""
                    }
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                    onClick={handleEditSubmit}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPYQPage;
