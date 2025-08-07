import React, { useEffect, useState } from "react";
import { Search, FilePlus, X, ExternalLink } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { fetchNotes, editNoteService } from "@/services/noteService";

const branches = ["MME", "CSE", "EE", "ME", "CE", "ECM", "PIE", "ECE"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const AdminNotesPage = () => {
  // Filters & state
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");

  // Notes data from API
  const [notes, setNotes] = useState<any[]>([]);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNoteData, setEditNoteData] = useState<any>(null);

  // Fetch notes from API with filters & uploader (replace uploader with actual user id if needed)
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetchedNotes = await fetchNotes({
          title: search,
          semester,
          branch,
          subject,
          page: 1,
          limit: 20,
          uploader: "", // or some uploader id from user context
        });
        setNotes(fetchedNotes);
      } catch (err) {
        console.error("Failed to fetch notes", err);
      }
    };
    loadNotes();
  }, [search, topic, semester, branch, subject]);

  // Open Edit modal and set note data
  const openEditModal = (note: any) => {
    setEditNoteData(note);
    setIsEditModalOpen(true);
  };

  // Close Edit modal
  const closeEditModal = () => {
    setEditNoteData(null);
    setIsEditModalOpen(false);
  };

  // Handle form input changes in Edit modal
  const handleEditFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!editNoteData) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setEditNoteData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit edited note to API
  const handleEditSubmit = async () => {
    if (!editNoteData) return;

    const {
      _id,
      title,
      description,
      semester,
      branch,
      subject,
      visibility,
      isApproved,
      rejectionReason,
    } = editNoteData;

    try {
      await editNoteService(_id, {
        title,
        description,
        semester,
        branch,
        subject,
        visibility,
        isApproved,
        rejectionReason,
      });
      closeEditModal();

      // Reload notes after edit
      const updatedNotes = await fetchNotes({
        title: search,
        semester,
        branch,
        subject,
        page: 1,
        limit: 20,
        uploader: "",
      });
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error updating note", error);
    }
  };

  // Filter notes (optional additional filtering on client side)
  const filteredNotes = notes.filter((note) => {
    return (
      (note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.subject.toLowerCase().includes(search.toLowerCase())) &&
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

        {/* Filter Bar (same as before) */}
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
                  Subject
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Semester
                </th>
                <th className="text-center px-4 py-4 border-b border-gray-300">
                  Branch
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
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <tr
                    key={note._id}
                    className="hover:bg-indigo-50 transition cursor-default"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {note.title}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.subject}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.semester}
                    </td>
                    <td className="text-center px-4 py-3 text-gray-700">
                      {note.branch}
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          note.isApproved
                            ? "bg-green-200 text-green-900"
                            : "bg-yellow-200 text-yellow-900"
                        }`}
                      >
                        {note.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="text-right px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-indigo-700 hover:text-indigo-900 font-semibold transition"
                          onClick={() => openEditModal(note)}
                        >
                          Edit
                        </button>
                        <a
                          href={note.link || note.fileUrl}
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
                    colSpan={6}
                    className="text-center py-10 text-gray-500 font-semibold italic"
                  >
                    No Notes found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Note Modal */}
        {isEditModalOpen && editNoteData && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
                onClick={closeEditModal}
                aria-label="Close edit modal"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Note</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={editNoteData.title}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label
                    className="block mb-1 font-semibold"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={editNoteData.description}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block mb-1 font-semibold"
                      htmlFor="semester"
                    >
                      Semester
                    </label>
                    <input
                      id="semester"
                      name="semester"
                      type="number"
                      min={1}
                      max={8}
                      value={editNoteData.semester}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      className="block mb-1 font-semibold"
                      htmlFor="branch"
                    >
                      Branch
                    </label>
                    <input
                      id="branch"
                      name="branch"
                      type="text"
                      value={editNoteData.branch}
                      onChange={handleEditFormChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={editNoteData.subject}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <label
                      className="block mb-1 font-semibold"
                      htmlFor="visibility"
                    >
                      Visibility
                    </label>
                    <select
                      id="visibility"
                      name="visibility"
                      value={editNoteData.visibility}
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
                      checked={editNoteData.isApproved}
                      onChange={handleEditFormChange}
                      className="h-4 w-4"
                    />
                    <label htmlFor="isApproved" className="font-semibold">
                      Approved
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-1 font-semibold"
                    htmlFor="rejectionReason"
                  >
                    Rejection Reason
                  </label>
                  <input
                    id="rejectionReason"
                    name="rejectionReason"
                    type="text"
                    value={editNoteData.rejectionReason || ""}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2"
                    disabled={editNoteData.isApproved}
                    placeholder={
                      editNoteData.isApproved
                        ? "Not applicable if approved"
                        : ""
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

export default AdminNotesPage;
