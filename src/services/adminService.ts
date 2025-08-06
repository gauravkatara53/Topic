// adminService.ts
import { getNews, createNews as apiCreateNews } from "@/api/adminApi"; // Adjust paths as needed
import { errorHandler } from "@/utils/errorHandler";

const { handleError } = errorHandler();

export const fetchNews = async () => {
  try {
    const response = await getNews();

    if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response.data?.data)) {
      // If API returns nested "data" field with array
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    handleError(error);
    return [];
  }
};

// New service function to create news with error handling
export const createNews = async (data: any) => {
  try {
    const response = await apiCreateNews(data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error; // rethrow so calling code can catch if needed
  }
};
