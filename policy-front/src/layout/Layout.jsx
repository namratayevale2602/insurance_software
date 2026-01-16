// src/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import HorizontalNavbar from "../component/navbar/HorizontalNavbar";
import VerticalSidebar from "../component/navbar/VerticalSidebar";
import Footer from "../component/footer/Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Horizontal Navbar */}
      {/* <HorizontalNavbar /> */}

      <div className="flex flex-1">
        {/* Vertical Sidebar - Now properly toggleable */}
        <VerticalSidebar />

        {/* Main Content - Adjusts based on sidebar state */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
