// NewsAdminPage.tsx
import React, { useEffect, useState } from "react";
import { Edit2, Trash2, PlusCircle, Search, ExternalLink } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { fetchNews, createNews } from "@/services/adminService";

type News = {
  id: string; // maps to _id from API
  title: string;
  description: string; // maps to content
  link: string;
  date: string; // yyyy-mm-dd
};

const NewsAdminPage: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [form, setForm] = useState<{
    id: string | null;
    title: string;
    description: string;
    link: string;
  }>({
    id: null,
    title: "",
    description: "",
    link: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Load news on mount
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      const data = await fetchNews();

      const mappedNews = data.map((item: any) => ({
        id: item._id,
        title: item.title,
        description: item.content,
        link: item.link || "",
        date: item.date
          ? item.date.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      }));

      setNewsList(mappedNews);
      setLoading(false);
    };
    loadNews();
  }, []);

  // Filter news based on search and date range
  const filteredNews = newsList.filter((news) => {
    const newsDate = new Date(news.date);
    const fromDateObj = dateFrom ? new Date(dateFrom) : null;
    const toDateObj = dateTo ? new Date(dateTo) : null;

    return (
      (news.title.toLowerCase().includes(search.toLowerCase()) ||
        news.description.toLowerCase().includes(search.toLowerCase()) ||
        news.link.toLowerCase().includes(search.toLowerCase())) &&
      (!fromDateObj || newsDate >= fromDateObj) &&
      (!toDateObj || newsDate <= toDateObj)
    );
  });

  // Handle input field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Clear form to create new news
  const handleCreateNew = () => {
    setForm({ id: null, title: "", description: "", link: "" });
    setIsEditing(false);
  };

  // Submit create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    try {
      if (isEditing && form.id) {
        // Local update only; implement update API as needed
        setNewsList((prev) =>
          prev.map((item) =>
            item.id === form.id
              ? {
                  ...item,
                  title: form.title,
                  description: form.description,
                  link: form.link,
                }
              : item
          )
        );
      } else {
        // Create new news via API
        const payload = {
          title: form.title,
          content: form.description,
          link: form.link,
        };
        const response = await createNews(payload);

        if (response && response.data) {
          const newItem = response.data;
          setNewsList((prev) => [
            {
              id: newItem._id,
              title: newItem.title,
              description: newItem.content,
              link: newItem.link || "",
              date: newItem.date
                ? newItem.date.slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ]);
        }
      }

      setForm({ id: null, title: "", description: "", link: "" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error creating/updating news:", error);
      // Add error UI as needed
    }
  };

  // Start editing selected news
  const handleEdit = (news: News) => {
    setForm({
      id: news.id,
      title: news.title,
      description: news.description,
      link: news.link,
    });
    setIsEditing(true);
  };

  // Local delete of news
  const handleDelete = (id: string) => {
    setNewsList((prev) => prev.filter((item) => item.id !== id));
    if (form.id === id) {
      setForm({ id: null, title: "", description: "", link: "" });
      setIsEditing(false);
    }
  };
  const truncateWords = (text: string, wordLimit: number): string => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-900 tracking-wide">
            News
          </h1>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-2xl shadow hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-5 h-5" />
            Create New News
          </button>
        </div>

        <>
          {/* Create/Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-6 bg-white rounded-xl shadow-md w-full"
          >
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 mb-4 sm:mb-0 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={form.title}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={
                  form.id
                    ? newsList.find((n) => n.id === form.id)?.date ?? ""
                    : new Date().toISOString().slice(0, 10)
                }
                disabled
                aria-label="Date created (read only)"
              />
              <input
                type="text"
                name="link"
                placeholder="Link (e.g. https://...)"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 mt-4 sm:mt-0 focus:ring-2 focus:ring-indigo-400 outline-none"
                value={form.link}
                onChange={handleChange}
              />
            </div>
            <textarea
              name="description"
              placeholder="Description"
              rows={4}
              className="mt-4 border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-indigo-400 outline-none"
              value={form.description}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              {isEditing ? "Update News" : "Create News"}
            </button>
          </form>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-4 mb-6 w-full items-center bg-white rounded-2xl p-6 shadow border border-gray-300">
            <div className="flex items-center gap-2 flex-grow min-w-[220px] bg-gray-100 rounded-md px-3 py-2">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search title, description, or link..."
                className="outline-none bg-transparent w-full text-gray-700 placeholder-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 max-w-[160px]"
              aria-label="Filter news from date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-gray-700 max-w-[160px]"
              aria-label="Filter news to date"
            />
          </div>

          {/* News Table */}
          {/* News Table */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-300 w-full">
            <table className="min-w-full table-fixed text-sm">
              <thead>
                <tr className="bg-indigo-100 text-indigo-900 font-semibold">
                  <th className="px-6 py-4 border-b border-gray-300 text-left w-64">
                    Title
                  </th>
                  <th className="px-6 py-4 border-b border-gray-300 text-left">
                    Description
                  </th>
                  <th className="px-6 py-4 border-b border-gray-300 text-left w-40">
                    Link
                  </th>
                  <th className="px-6 py-4 border-b border-gray-300 text-center w-28">
                    Date
                  </th>
                  <th className="px-6 py-4 border-b border-gray-300 text-right w-36">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton loading rows
                  [...Array(5)].map((_, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {[...Array(5)].map((__, i) => (
                        <td key={i} className="px-6 py-3">
                          <div className="h-4 max-w-full bg-gray-300 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredNews.length ? (
                  filteredNews.map((news, idx) => (
                    <tr
                      key={news.id}
                      className={
                        (idx % 2 === 0 ? "bg-white" : "bg-gray-50") +
                        " hover:bg-indigo-50 cursor-default"
                      }
                      title={news.title}
                      onClick={() => handleEdit(news)}
                    >
                      <td className="px-6 py-3 font-medium text-gray-900 truncate">
                        {truncateWords(news.title, 4)}
                      </td>
                      <td className="px-6 py-3 text-gray-700 truncate">
                        {truncateWords(news.description, 5)}
                      </td>
                      <td className="px-6 py-3 text-blue-700 underline truncate">
                        {news.link ? (
                          <a
                            href={
                              news.link.startsWith("http")
                                ? news.link
                                : `https://${news.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-blue-900"
                          >
                            Link
                            <ExternalLink className="w-4 h-4 inline-block" />
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-700 whitespace-nowrap">
                        {new Date(news.date)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .toUpperCase()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap flex justify-end gap-3">
                        <button
                          type="button"
                          className="text-indigo-700 hover:text-indigo-900 transition"
                          aria-label={`Edit news titled ${news.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(news);
                          }}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 transition"
                          aria-label={`Delete news titled ${news.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(news.id);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-500 font-semibold italic"
                    >
                      No news found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      </main>
    </div>
  );
};

export default NewsAdminPage;
