import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { isLoggedIn, name, avatar, role } = user;

  const isAdmin = role === "admin";
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? "/profile" : "/login");
  };

  const adminTab = { path: "/admin/news", label: "Admin" };

  // Base navigation links
  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/academic", label: "Academic" },
    { path: "/attendance", label: "Attendance" },
    { path: "/upload", label: "Upload" },
    { path: "/buy-sell", label: "Buy&Sell" },
    { path: "/contact", label: "Contact us" },
  ];

  // Desktop includes all links + admin if admin
  const desktopLinks = isAdmin ? [...navLinks, adminTab] : navLinks;

  // Mobile excludes /upload as per original code and adds admin if admin
  const mobileBaseLinks = navLinks.filter((link) => link.path !== "/upload");
  const mobileLinks = isAdmin
    ? [...mobileBaseLinks, adminTab]
    : mobileBaseLinks;

  return (
    <nav className="bg-[#81d0c7] border-gray-200 relative z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4 relative">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center space-x-3 z-10 sm:-ml-10">
          <img
            src="https://topic-frontend.vercel.app/assets/mortarboard-DQ6alufg.png"
            className="h-10"
            alt="Logo"
          />
          <span className="text-3xl font-bold text-gray-800">Topic</span>
        </Link>

        {/* Middle: Nav Links (desktop) */}
        <div className="-ml-20 hidden md:flex space-x-6 absolute left-1/2 transform -translate-x-1/2">
          {desktopLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={closeMenu}
              className={`whitespace-nowrap relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300
              ${
                location.pathname.startsWith(path)
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-500"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100 hover:shadow-md hover:scale-105"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Avatar/Login (desktop) */}
        <div className="hidden md:flex items-center space-x-3 ml-auto z-10">
          {isLoggedIn ? (
            <>
              <img
                src={
                  avatar ||
                  "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                }
                alt="User"
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full cursor-pointer outline outline-2 outline-white bg-gray-200"
              />
              <span className="bg-white rounded-md text-gray-800 px-3 py-1">
                Hello, {name}
              </span>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-100"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile: Profile + Menu toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={handleProfileClick}
            className="w-10 h-10 flex justify-center items-center rounded-full hover:bg-gray-100"
          >
            <img
              src={
                isLoggedIn
                  ? avatar ||
                    "https://cdn-icons-png.flaticon.com/128/1144/1144760.png"
                  : "https://cdn-icons-png.flaticon.com/128/1077/1077012.png"
              }
              alt="User Icon"
              className="w-6 h-6 rounded-full bg-gray-200"
            />
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 17 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col space-y-2 bg-[#81d0c7] p-4 rounded-lg">
            {isLoggedIn && (
              <li className="bg-white text-gray-800 px-3 py-2 rounded">
                Hello, {name}
              </li>
            )}
            {mobileLinks.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={closeMenu}
                  className={`block py-2 px-3 rounded hover:bg-gray-100 ${
                    location.pathname === path
                      ? "bg-white text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            {!isLoggedIn && (
              <li>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/login");
                  }}
                  className="block py-2 px-3 w-full text-left text-blue-600 hover:bg-blue-100 rounded"
                >
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
