import AdminSidebar from "../components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, FileWarning, ShoppingCart } from "lucide-react";

const Dashboard = () => {
  const cards = [
    {
      title: "Notes",
      count: 124,
      icon: <BookOpen className="w-5 h-5 text-indigo-700" />,
      bgFrom: "from-indigo-100",
      bgTo: "to-indigo-50",
      textTitle: "text-indigo-900",
      dotColor: "bg-indigo-500",
    },
    {
      title: "PYQs",
      count: 68,
      icon: <HelpCircle className="w-5 h-5 text-green-700" />,
      bgFrom: "from-green-100",
      bgTo: "to-green-50",
      textTitle: "text-green-900",
      dotColor: "bg-green-500",
    },
    {
      title: "Reports",
      count: 12,
      icon: <FileWarning className="w-5 h-5 text-red-700" />,
      bgFrom: "from-red-100",
      bgTo: "to-red-50",
      textTitle: "text-red-900",
      dotColor: "bg-red-500",
    },
    {
      title: "Buy & Sell Posts",
      count: 35,
      icon: <ShoppingCart className="w-5 h-5 text-blue-700" />,
      bgFrom: "from-blue-100",
      bgTo: "to-blue-50",
      textTitle: "text-blue-900",
      dotColor: "bg-blue-500",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 min-h-screen overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Card key={card.title} className="rounded-xl shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-md font-semibold">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Recent Notes */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center mb-5">
              <BookOpen className="w-6 h-6 text-indigo-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 tracking-wide">
                Recent Notes
              </h3>
            </div>
            <div className="space-y-4">
              {["Note 1 uploaded", "Note 2 uploaded", "Note 3 uploaded"].map(
                (text, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center transition hover:shadow-md cursor-pointer"
                  >
                    <span className="w-3 h-3 bg-indigo-500 rounded-full mr-4 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{text}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Recent PYQs */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center mb-5">
              <HelpCircle className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 tracking-wide">
                Recent PYQs
              </h3>
            </div>
            <div className="space-y-4">
              {["PYQ 1 approved", "PYQ 2 approved", "PYQ 3 approved"].map(
                (text, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center transition hover:shadow-md cursor-pointer"
                  >
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-4 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{text}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Buy & Sell Activity */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center mb-5">
              <ShoppingCart className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 tracking-wide">
                Buy & Sell Activity
              </h3>
            </div>
            <div className="space-y-4">
              {["Item 1 posted", "Item 2 sold", "Item 3 listed"].map(
                (text, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center transition hover:shadow-md cursor-pointer"
                  >
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-4 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{text}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center mb-5">
              <FileWarning className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 tracking-wide">
                Recent Reports
              </h3>
            </div>
            <div className="space-y-4">
              {[
                "Report 1 submitted",
                "Report 2 submitted",
                "Report 3 reviewed",
              ].map((text, i) => (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center transition hover:shadow-md cursor-pointer"
                >
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-4 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
