import React, { useState, ReactNode } from "react";
import { Link } from "react-router-dom";

type Tab = "notes" | "pyq" | "attend";

interface TopicCardProps {
  image: string;
  title: string;
  link: string;
  external?: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({
  image,
  title,
  link,
  external,
}) => (
  <div className="rounded-2xl shadow-md overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
    {external ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <img src={image} alt={title} className="h-60 w-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h5 className="text-white text-2xl font-bold uppercase">{title}</h5>
        </div>
      </a>
    ) : (
      <Link to={link} className="block relative">
        <img src={image} alt={title} className="h-60 w-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h5 className="text-white text-2xl font-bold uppercase">{title}</h5>
        </div>
      </Link>
    )}
  </div>
);

const BrowseTopics: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>("notes");

  const tabButtons: { id: Tab; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "pyq", label: "PYQ's" },
    { id: "attend", label: "Tools" },
  ];

  const renderContent = (): ReactNode => {
    switch (selectedTab) {
      case "notes":
        return (
          <TopicCard
            image="https://img.freepik.com/free-vector/modern-weekly-schedule-template-with-flat-design_23-2147942250.jpg"
            title="Notes"
            link="/academic/get/notes"
          />
        );
      case "pyq":
        return (
          <TopicCard
            image="https://img.freepik.com/premium-vector/test-icon-illustration_430232-32.jpg"
            title="PYQ's"
            link="/academic/get/pyq"
          />
        );
      case "attend":
        return (
          <>
            <TopicCard
              image="https://img.freepik.com/free-vector/appointment-booking-with-calendar_23-2148553008.jpg"
              title="Attendance"
              link="/attendance"
            />
            <TopicCard
              image="https://img.freepik.com/free-vector/calculator-concept-illustration_114360-1239.jpg"
              title="CG Calculator"
              link="./cg"
            />
            <TopicCard
              image="https://images.collegedunia.com/images/profile/2023-07-09/1688892503_IMG-20230709-WA0010.jpg"
              title="NIT JSR"
              link="https://online.nitjsr.ac.in/endsem/"
              external
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 ">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Browse Topics
      </h1>

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {tabButtons.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedTab === tab.id
                ? "bg-[#7fd0c7] text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-[#e6fffd]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default BrowseTopics;
