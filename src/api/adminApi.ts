// adminApi.ts
import { apiService } from "./apiService";

export const createNews = (data: any) =>
  apiService.post("/news/create/news", data);

export const getNews = () => apiService.get("/news/get/current/new");
