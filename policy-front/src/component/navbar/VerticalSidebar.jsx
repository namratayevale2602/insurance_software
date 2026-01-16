// src/components/navbar/VerticalSidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCog,
  FaEnvelope,
  FaChartBar,
  FaHome,
  FaInfoCircle,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import useAuthStore from "../../store/authStore";

const VerticalSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { path: "/", icon: FaHome, label: "Home" },
    { path: "/clients", icon: FaUser, label: "Client" },
    { path: "/gic-entries", icon: FaCog, label: "GIC" },
    { path: "/lic-entries", icon: FaEnvelope, label: "LIC" },
    { path: "/rto-entries", icon: FaChartBar, label: "RTO" },
    { path: "/bmds-entries", icon: FaInfoCircle, label: "BMDS" },
    { path: "/mf-entries", icon: FaInfoCircle, label: "MF" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`flex ${
          isSidebarOpen ? "lg:w-64" : "lg:w-16"
        } transition-all duration-300 ease-in-out`}
      >
        <aside
          className={`bg-[#04496e] text-white sticky top-16 flex flex-col ${
            isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300`}
        >
          {/* Sidebar Header with Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {isSidebarOpen && <h2 className="text-lg font-semibold">Menu</h2>}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded hover:bg-gray-700 transition duration-300"
              title={isSidebarOpen ? "Collapse" : "Expand"}
            >
              {isSidebarOpen ? (
                <FaChevronLeft size={16} />
              ) : (
                <FaChevronRight size={16} />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center rounded-md transition duration-300 ${
                    isActive
                      ? "bg-[#1da5e9] text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  } ${isSidebarOpen ? "p-3" : "p-3 justify-center"}`}
                  title={!isSidebarOpen ? item.label : ""}
                >
                  <Icon size={20} />
                  {isSidebarOpen && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info Section */}
          <div className="border-t border-gray-700 p-4">
            {user ? (
              <>
                {/* User Profile */}
                <div
                  className={`flex items-center ${
                    isSidebarOpen ? "justify-start" : "justify-center"
                  } mb-3`}
                >
                  <div className="shrink-0">
                    <FaUserCircle size={32} className="text-gray-300" />
                  </div>
                  {isSidebarOpen && (
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-300 truncate capitalize">
                        {user.role}
                      </p>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full rounded-md p-3 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-300 ${
                    isSidebarOpen ? "justify-start" : "justify-center"
                  }`}
                  title={!isSidebarOpen ? "Logout" : ""}
                >
                  <FaSignOutAlt size={20} />
                  {isSidebarOpen && (
                    <span className="ml-3 font-medium">Logout</span>
                  )}
                </button>
              </>
            ) : (
              /* Loading State */
              <div
                className={`flex items-center ${
                  isSidebarOpen ? "justify-start" : "justify-center"
                }`}
              >
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                </div>
                {isSidebarOpen && (
                  <div className="ml-3 space-y-1 flex-1">
                    <div className="h-3 bg-gray-600 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-gray-600 rounded animate-pulse w-1/2"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default VerticalSidebar;
