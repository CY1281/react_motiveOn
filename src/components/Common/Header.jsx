import React from "react";
import { useNavigate } from "react-router-dom"; 
import logo from "../../assets/img/motiveon-logo.png";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate(); 

  return (
    <header
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", 
        padding: "0 16px",
        borderBottom: "1px solid #eee",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#fff",
        zIndex: 1100,
      }}
    >
      {/* 왼쪽: 메뉴 버튼 */}
      <button
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* 중앙: 로고 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
         
        }}
        onClick={() => navigate("/home")} 
      >
        <img src={logo} alt="MotiveOn" style={{ height: "90px" }} />
      </div>
    </header>
  );
};

export default Header;