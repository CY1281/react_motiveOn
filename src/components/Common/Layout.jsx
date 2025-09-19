import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";   // ✅ store import

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ 로그인 상태 가져오기
  const { isLoggedIn, logout, user } = useUserStore();

  // ✅ 로그인 안 한 경우 → 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userInfo = user || {
    name: "이민진",
    empNo: "24330015",
    position: "사원",
    dept: "경영지원팀",
    checkIn: "2025-09-04 01:49",
    profileImg: "/profile.png",
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ width: "100%", height: "788px" }}>
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={userInfo}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      <main
        style={{
          marginTop: "56px",
          width: "100%",
          height: "calc(100vh - 56px)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;