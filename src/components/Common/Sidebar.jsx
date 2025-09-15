import React, { useState } from "react";
import arrowIcon from "../../assets/img/dropdown.png";

const Sidebar = ({ isOpen, onClose, user, onNavigate }) => {
  if (!isOpen) return null;

  const [openMenu, setOpenMenu] = useState(null);

  // 메뉴 데이터
  const menuItems = [
    { label: "일정", path: "/calendarPage", type: "link" },
    {
      label: "업무",
      children: [
        { label: "홈", path: "/workPage" },
        { label: "내업무", path: "/work/myworklist" },
        { label: "요청한업무", path: "/work/reqlist" },
      ],
    },
    {
      label: "전자결재",
      children: [
        { label: "홈", path: "/approval" },
        { label: "참조문서함", path: "/approval/viewerList" },
        { label: "기안문서함", path: "/approval/draftList" },
        { label: "임시문서함", path: "/approval/tempList" },
        { label: "결재문서함", path: "/approval/completeList" },
      ],
    },
  ];

  const handleMenuClick = (item) => {
    if (item.type === "link") {
      onNavigate(item.path);
      onClose();
    } else {
      setOpenMenu(openMenu === item.label ? null : item.label);
    }
  };

  const handleSubMenuClick = (path) => {
    onNavigate(path);
    onClose();
  };

  return (
    <aside
      style={{
        width: "240px",
        height: "100vh",
        background: "#f9f9f9",
        borderRight: "1px solid #eee",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        padding: "20px 16px",
        overflowY: "auto",
      }}
    >
      {/* 사용자 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <img
            src={user?.profileImg || "/default-profile.png"}
            alt="프로필"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              marginRight: "14px",
            }}
          />
          <div
            style={{
              fontSize: "13px",
              lineHeight: "1.5",
              color: "#333",
            }}
          >
            <p>성명 : {user?.name}</p>
            <p>사번 : {user?.empNo}</p>
            <p>직위 : {user?.position}</p>
            <p>부서 : {user?.dept}</p>
            <p>출근시간 : {user?.checkIn}</p>
          </div>
        </div>

        {/* 구분선 */}
        <hr
          style={{
            border: "0",
            borderTop: "1px solid #ddd",
            margin: "8px 0",
          }}
        />
      </div>

      {/* 메뉴 */}
      <nav>
        <h4
          style={{
            marginBottom: "12px",
            fontSize: "15px",
            fontWeight: "bold",
            color: "#060b3b",
          }}
        >
          바로가기
        </h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.label} style={{ marginBottom: "6px" }}>
              {/* 상위 메뉴 */}
              <div
                style={{
                  padding: "8px 0",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none", // 드래그 방지
                  outline: "none", // 포커스 테두리 제거
                  background: "transparent", 
                  WebkitTapHighlightColor: "transparent", // 모바일 클릭 효과 제거
                }}
                onClick={() => handleMenuClick(item)}
              >
                <span>{item.label}</span>
                {item.children && (
                  <img
                    src={arrowIcon}
                    alt="arrow"
                    style={{
                      width: "14px",
                      height: "14px",
                      transform:
                        openMenu === item.label ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                )}
              </div>

              {/* 서브메뉴 */}
              {item.children && openMenu === item.label && (
                <ul style={{ listStyle: "none", paddingLeft: "16px" }}>
                  {item.children.map((sub) => (
                    <li
                      key={sub.label}
                      style={{
                        padding: "6px 0",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#444",
                        userSelect: "none",
                        outline: "none",
                        background: "transparent",
                        WebkitTapHighlightColor: "transparent",
                      }}
                      onClick={() => handleSubMenuClick(sub.path)}
                    >
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

     
    </aside>
  );
};

export default Sidebar;
