// adminService.ts
import {
  getNews,
  createNews as apiCreateNews,
  updateNews as apiUpdateNews,
  deleteNews as apiDeleteNews,
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
