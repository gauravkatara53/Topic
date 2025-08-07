// src/api/notesApi.ts
import { apiService } from "./apiService";

export const getPyq = ({
  title = "",
  semester = "",
  branch = "",
  subject = "",
  term = "",
  sessionFrom = 0,
  sessionTo = 0,
  page = 1,
  limit = 5,
  uploader = "",
}: {
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
  const queryParams = new URLSearchParams();

  if (title) queryParams.append("title", title);
  if (semester) queryParams.append("semester", String(semester));
  if (branch) queryParams.append("branch", branch);
  if (subject) queryParams.append("subject", subject);
  if (term) queryParams.append("term", term);
  if (uploader) queryParams.append("uploader", uploader);
  if (sessionFrom) queryParams.append("sessionFrom", String(sessionFrom));
  if (sessionTo) queryParams.append("sessionTo", String(sessionTo));
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  return apiService.get(`/PYQ/get/pyq?${queryParams.toString()}`);
};

// ✅ Upload pyq API
export const uploadPyq = (formData: FormData) => {
  return apiService.post("/PYQ/upload-pyq", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// delete notes
export const deletePyq = (pyqId: string) => {
  return apiService.delete(`/PYQ/delete/${pyqId}`);
};

export const editPyq = (
  pyqId: string,
  data: {
    title: string;
    description: string;
    semester: number | string;
    branch: string;
    sessionFrom: number | string;
    sessionTo: number | string;
    subject: string;
    visibility: string;
    isApproved: boolean;
    rejectionReason: string;
    term: string;
  }
) => {
  return apiService.put(`/PYQ/admin/edit-pyq/${pyqId}`, data);
};
