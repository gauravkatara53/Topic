import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpenCheck,
  UploadCloud,
  ScrollText,
  FileText,
  Files,
  UploadIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footerd from "../Dashboard/Components/Footerd";

const academicActions = [
  {
    title: "Get Notes",
    description: "Explore and download class notes shared by others.",
    icon: BookOpenCheck,
    gradient: "from-blue-500 to-blue-300",
    action: "/academic/get/notes",
  },
  {
    title: "Get PYQs",
    description: "Access previous year question papers.",
    icon: ScrollText,
    gradient: "from-yellow-500 to-yellow-300",
    action: "/academic/get/pyq",
  },
  {
    title: "Upload Notes",
    description: "Share your notes with the community.",
    icon: UploadCloud,
    gradient: "from-green-500 to-green-300",
    action: "/academic/upload/notes",
  },
  {
    title: "Upload PYQ",
    description: "Share your PYQ with the community.",
    icon: UploadIcon,
    gradient: "from-blue-500 to-pink-300",
    action: "/academic/upload/pyq",
  },

  {
    title: "My Uploaded Notes",
    description: "View and manage your uploaded notes.",
    icon: Files,
    gradient: "from-purple-500 to-purple-300",
    action: "/academic/my/notes",
  },
  {
    title: "My Uploaded PYQs",
    description: "Check and manage your uploaded PYQs.",
    icon: FileText,
    gradient: "from-pink-500 to-pink-300",
    action: "/academic/my/pyqs",
  },
];

const AcademicPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {academicActions.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  onClick={() => navigate(item.action)}
                  className="rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full bg-gradient-to-br ${item.gradient} shadow-inner`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <Button
                      variant="ghost"
                      className="text-blue-600 text-sm hover:underline p-0 flex items-center gap-1"
                    >
                      Open <span className="ml-1">→</span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <Footerd />
    </>
  );
};

export default AcademicPage;
