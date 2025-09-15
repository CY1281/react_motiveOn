import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const userMock = {
    name: "이민진",
    empNo: "24330015",
    position: "사원",
    dept: "경영지원팀",
    checkIn: "2025-09-04 01:49",
    profileImg: "/profile.png",
  };

  return (
    <div style={{ display: "flex" }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={userMock}
        onNavigate={navigate}
      />
      <main style={{ flex: 1, marginTop: "56px", padding: "0px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
