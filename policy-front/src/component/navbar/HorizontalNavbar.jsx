// src/components/navbar/HorizontalNavbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

const HorizontalNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  //   const toggleDesktopMenu = () => {
  //     setIsDesktopMenuOpen(!isDesktopMenuOpen);
  //   };

  return (
    <nav className="bg-[#1da5e9] text-white shadow-lg sticky top-0 z-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Toggle */}
          <div className="flex items-center space-x-4">
            <div className="shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">
                YourLogo
              </Link>
            </div>

            {/* Desktop Toggle Button - Always visible on desktop */}
            {/* <button
              onClick={toggleDesktopMenu}
              className="hidden lg:flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-400 rounded-md transition duration-300"
              title={isDesktopMenuOpen ? "Collapse Menu" : "Expand Menu"}
            >
              {isDesktopMenuOpen ? (
                <FaArrowLeft size={14} />
              ) : (
                <FaArrowRight size={14} />
              )}
            </button> */}
          </div>

          {/* Desktop Menu - Can be toggled */}
          <div className="hidden md:flex items-center space-x-1">
            {isDesktopMenuOpen ? (
              // Expanded Menu with Text + Icons
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center"
                >
                  <FaHome className="mr-2" /> Home
                </Link>
                <Link
                  to="/about"
                  className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center"
                >
                  <FaInfoCircle className="mr-2" /> About
                </Link>
                <Link
                  to="/contact"
                  className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center"
                >
                  <FaEnvelope className="mr-2" /> Contact
                </Link>
              </div>
            ) : (
              // Collapsed Menu - Icons Only
              <div className="flex items-center space-x-2">
                <Link
                  to="/"
                  className="hover:bg-blue-500 p-2 rounded-md transition duration-300 flex items-center"
                  title="Home"
                >
                  <FaHome size={18} />
                </Link>
                <Link
                  to="/about"
                  className="hover:bg-blue-500 p-2 rounded-md transition duration-300 flex items-center"
                  title="About"
                >
                  <FaInfoCircle size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="hover:bg-blue-500 p-2 rounded-md transition duration-300 flex items-center"
                  title="Contact"
                >
                  <FaEnvelope size={18} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu section */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Mobile Toggle Button */}
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
            <Link
              to="/"
              className="hover:bg-blue-500 px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome className="mr-2" /> Home
            </Link>
            <Link
              to="/about"
              className="hover:bg-blue-500 px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaInfoCircle className="mr-2" /> About
            </Link>
            <Link
              to="/contact"
              className="hover:bg-blue-500 px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaEnvelope className="mr-2" /> Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HorizontalNavbar;
