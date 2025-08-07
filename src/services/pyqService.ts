// src/services/pyqService.ts
import { deletePyq, getPyq, uploadPyq } from "@/api/pyqApi";
import { errorHandler } from "@/utils/errorHandler";
import { toast } from "react-toastify";
const { handleError } = errorHandler();

export const fetchPYQs = async (filters: {
  title?: string;
  semester?: number | string;
  branch?: string;
  subject?: string;
  term?: string;
  sessionFrom?: number;
  sessionTo?: number;
  page?: number;
  limit?: number;
  uploader?: string;
}) => {
  try {
    const response = await getPyq(filters);

    console.log("🧪 Full pyq API response:", response);
    console.log("🔍 response.data:", response?.data);

    const pyqs = response?.data?.pyqs; // adjust based on actual API response

    if (!Array.isArray(pyqs)) {
      console.warn("⚠️ `pyqs` not found or not an array:", pyqs);
      throw new Error("Invalid pyq response structure");
    }

    return pyqs;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const uploadPyqService = async (note: {
  title: string;
  term: string;
  semester: string | number;
  branch: string;
  subject: string;
  sessionFrom: string | number;
  sessionTo: string | number;
  file: File;
}) => {
  try {
    const formData = new FormData();
    formData.append("title", note.title);
    formData.append("term", note.term);
    formData.append("semester", note.semester.toString());
    formData.append("branch", note.branch);
    formData.append("subject", note.subject);
    formData.append("sessionFrom", note.sessionFrom.toString());
    formData.append("sessionTo", note.sessionTo.toString());
    formData.append("file", note.file);

    const response = await uploadPyq(formData);
    console.log("✅ Upload Success:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// delete pyq
export const handleDelete = async (pyqId: string) => {
  try {
    await deletePyq(pyqId);
    toast.success("PYQ deleted successfully!");
  } catch (error) {
    handleError(error);
    toast.error("Failed to delete PYQ");
  }
};
