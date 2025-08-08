// adminService.ts
import {
  getNews,
  createNews as apiCreateNews,
  updateNews as apiUpdateNews,
  deleteNews as apiDeleteNews,
  updateUserById,
  getUserById,
  getAllUsers,
} from "@/api/adminApi";
import { errorHandler } from "@/utils/errorHandler";

const { handleError } = errorHandler();

export const fetchNews = async () => {
  try {
    const response = await getNews();

    if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response.data?.data)) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const createNews = async (data: any) => {
  try {
    const response = await apiCreateNews(data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateNews = async (id: string, data: any) => {
  try {
    const response = await apiUpdateNews(id, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const deleteNews = async (id: string) => {
  try {
    const response = await apiDeleteNews(id);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const fetchUsers = async (filters: {
  name?: string;
  limit?: number;
  page?: number;
  email?: string;
  phone?: string;
}) => {
  try {
    const response = await getAllUsers(filters);
    if (response.data && Array.isArray(response.data.users)) {
      return response.data; // directly return response.data, not response.data.data
    }
    return { users: [], total: 0, page: 1, pages: 1 };
  } catch (error) {
    handleError(error);
    return { users: [], total: 0, page: 1, pages: 1 };
  }
};

export const fetchUserById = async (id: string) => {
  try {
    const response = await getUserById(id);
    console.log(response);
    // Return user object inside response.data (not data.data)
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updateUser = async (id: string, data: any) => {
  try {
    const response = await updateUserById(id, data);
    return response.data; // return response.data (not data.data)
  } catch (error) {
    handleError(error);
    throw error;
  }
};
