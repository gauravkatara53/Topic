// adminApi.ts
import { apiService } from "./apiService";

export const createNews = (data: any) =>
  apiService.post("/news/create/news", data);

export const getNews = () => apiService.get("/news/get/current/new");

// Update news by ID
export const updateNews = (id: string, data: any) =>
  apiService.patch(`/news/update/${id}`, data);

// Delete news by ID
export const deleteNews = (id: string) =>
  apiService.delete(`/news/delete/${id}`);

export const getAllUsers = (params: {
  name?: string;
  limit?: number;
  page?: number;
  email?: string;
  phone?: string;
}) => apiService.get("/auth/admin/users", { params });

export const getUserById = (id: string) =>
  apiService.get(`/auth/getUser/${id}`);

export const updateUserById = (id: string, data: any) =>
  apiService.put(`/auth/admin/users/${id}`, data);
