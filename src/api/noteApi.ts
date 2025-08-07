// src/api/notesApi.ts
import { apiService } from "./apiService";

export const getNotes = ({
  title = "",
  semester = "",
  branch = "",
  subject = "",
  page = 1,
  limit = 5,
  uploader = "",
}: {
  title?: string;
  semester?: number | string;
  branch?: string;
  subject?: string;
  page?: number;
  limit?: number;
  uploader?: string;
}) => {
  const queryParams = new URLSearchParams();

  if (title) queryParams.append("title", title);
  if (semester) queryParams.append("semester", String(semester));
  if (branch) queryParams.append("branch", branch);
  if (subject) queryParams.append("subject", subject);
  if (uploader) queryParams.append("uploader", uploader);
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  return apiService.get(`/notes/get/notes?${queryParams.toString()}`);
};

// ✅ Upload notes API
export const uploadNotes = (formData: FormData) => {
  return apiService.post("/notes/upload-notes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// delete notes
export const deleteNotes = (noteId: string) => {
  return apiService.delete(`/notes/delete/${noteId}`);
};

export const editNote = (
  noteId: string,
  data: {
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
  return apiService.put(`/notes/admin/edit-note/${noteId}`, data);
};
