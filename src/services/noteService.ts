import { deleteNotes, editNote, getNotes, uploadNotes } from "@/api/noteApi";
import { errorHandler } from "@/utils/errorHandler";
import { toast } from "react-toastify";
const { handleError } = errorHandler();
export const fetchNotes = async (filters: {
  title?: string;
  semester?: number | string;
  branch?: string;
  subject?: string;
  page?: number;
  limit?: number;
  uploader?: string;
}) => {
  try {
    const response = await getNotes(filters);

    const notes = response?.data?.notes;

    if (!Array.isArray(notes)) {
      console.warn("⚠️ `notes` not found or not an array:", notes);
      throw new Error("Invalid notes response structure");
    }

    return notes;
  } catch (error) {
    handleError(error);
    console.error("❌ Failed to fetch notes", error);
    throw error;
  }
};

// ✅ Upload notes service
export const uploadNotesService = async (note: {
  title: string;
  description: string;
  semester: string | number;
  branch: string;
  subject: string;
  file: File;
}) => {
  try {
    const formData = new FormData();
    formData.append("title", note.title);
    formData.append("description", note.description);
    formData.append("semester", note.semester.toString());
    formData.append("branch", note.branch);
    formData.append("subject", note.subject);
    formData.append("file", note.file);

    const response = await uploadNotes(formData);

    console.log("✅ Upload Success:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// delete pyq
export const handleDeleteNote = async (noteId: string) => {
  try {
    await deleteNotes(noteId);
    toast.success("Notes deleted successfully!");
  } catch (error) {
    handleError(error);
    toast.error("Failed to delete NOTES");
  }
};

export const editNoteService = async (
  noteId: string,
  updatedData: {
    title: string;
    description: string;
    semester: number | string;
    branch: string;
    subject: string;
    visibility: string;
    isApproved: boolean;
    rejectionReason: string;
  }
) => {
  try {
    const response = await editNote(noteId, updatedData);
    toast.success("Note updated successfully!");
    return response.data;
  } catch (error) {
    handleError(error);
    toast.error("Failed to update note");
    throw error;
  }
};
