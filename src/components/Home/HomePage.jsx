// src/components/Home/HomePage.jsx
import React, { useState, useEffect } from "react";   // ✅ useEffect 추가
import StatusCard from "../common/StatusCard";
import { Link } from "react-router-dom";
import { getCalendarList } from "../motiveOn/api";   // ✅ 일정 API 불러오기

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("긴급");
  const [todayEvents, setTodayEvents] = useState([]);

  // 오늘 날짜 (YYYY.MM.DD)
  const today = new Date();
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };
  const todayStr = formatDate(today);

  // ✅ 시간 포맷 (밀리초 → YYYY.MM.DD HH:mm)
  const formatDateTime = (val) => {
    if (!val) return "";
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${da} ${h}:${min}`;
  };

  // ✅ catecode 색상 매핑
  const getCategoryColor = (catecode) => {
    switch (catecode) {
      case "C":
        return "#f76258"; // 회사
      case "D":
        return "#71b2e7"; // 부서
      case "P":
        return "#94c296"; // 개인
      default:
        return "#9bc59c"; // 기본
    }
  };

  useEffect(() => {
    getCalendarList()
      .then((res) => {
        const list = res.data.calendarList || [];

        // 오늘 날짜 일정 필터링
        const events = list.filter((event) => {
          const sdate = formatDate(new Date(event.sdate));
          const edate = formatDate(new Date(event.edate));
          return todayStr >= sdate && todayStr <= edate;
        });

        setTodayEvents(events);
      })
      .catch((err) => console.error("홈 일정 불러오기 실패:", err));
  }, []);

  // 요일
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekdayStr = weekdays[today.getDay()];

  const approvalData = {
    긴급: [
      "긴급 결재 문서입니다.",
      "긴급 결재가 필요한 문서 1",
      "긴급 결재가 필요한 문서 2",
      "긴급 결재가 필요한 문서 3",
      "긴급 결재가 필요한 문서 4",
      "긴급 결재가 필요한 문서 5",
      "긴급 결재가 필요한 문서 6",
      "긴급 결재 문서입니다.",
    ],
    반려: [
      "반려된 결재 문서입니다.",
      "반려 사유: 서명 누락",
      "반려 사유: 예산 초과",
    ],
    보류: [
      "보류된 결재 문서입니다.",
      "보류: 담당자 확인 필요",
      "보류: 추가 자료 요청",
    ],
    대기: [
      "결재 대기 문서입니다.",
      "대기: 부서장 승인 필요",
      "대기: 회계팀 확인 필요",
    ],
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "390px",
        margin: "0 auto",
        background: "#f5f5f5", // 전체 배경 회색
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#344055",
        minHeight: "100vh",
      }}
    >
      {/* 일정 */}
      <section
        style={{
          padding: "16px",
          background: "#fff",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            fontWeight: "bold",
            padding: "0 12px",
          }}
        >
          <span>일정</span>
          <Link to="/calendarPage" style={{ fontSize: "12px", color: "#bbb" }}>
            바로가기
          </Link>
        </div>

        <div
          style={{
            background: "#f9f9f9",
            borderRadius: "6px",
            padding: "16px",
          }}
        >
          <div
            style={{ fontWeight: "600", marginBottom: "8px", fontSize: "13px" }}
          >
            {today.getDate()}일 ({weekdayStr})
          </div>

          {todayEvents.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#888" }}>
              해당 날짜에 일정이 없습니다.
            </p>
          ) : (
            todayEvents.map((event, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                {/* 🔹 catecode 색상바 */}
                <div
                  style={{
                    width: "12px",
                    height: "20px",
                    backgroundColor: getCategoryColor(event.catecode),
                    borderRadius: "3px",
                  }}
                ></div>
                <div>
                  <div style={{ fontWeight: "500", fontSize: "13px" }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8d8c8c" }}>
                    {formatDateTime(event.sdate)} ~ {formatDateTime(event.edate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 업무 */}
      <section
        style={{
          padding: "16px",
          background: "#fff",
          marginBottom: "8px",
        }}
      >
        {/* 상단 타이틀 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
            fontWeight: "bold",
            color: "#344055",
            padding: "0 8px",
          }}
        >
          <span>업무</span>
          <Link to="/work" style={{ fontSize: "12px", color: "#bbb" }}>
            바로가기
          </Link>
        </div>

        {/* 금주 마감 업무 + 카드 */}
        <div
          style={{
            background: "#f7f7f7",
            borderRadius: "6px",
            padding: "16px",
          }}
        >
          {/* 제목 줄 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              fontWeight: "600",
              fontSize: "14px",
              color: "#344055",
            }}
          >
            <span>금주 마감 업무</span>
          </div>

          {/* 카드 grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            <StatusCard label="대기" count={0} color="#d4f0d2" />
            <StatusCard label="진행" count={0} color="#f9d6c7" />
            <StatusCard label="협업요청" count={0} color="#f7d8f0" />
            <StatusCard label="대리요청" count={0} color="#d9d9d9" />
            <StatusCard label="완료" count={0} color="#fff7b1" />
            <StatusCard label="전체" count={0} color="#e7ebf0" />
          </div>
        </div>
      </section>

      {/* 전자결재 */}
      <section
        style={{
          padding: "16px",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          minHeight: "400px",
        }}
      >
        {/* 상단 타이틀 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
            fontWeight: "bold",
            color: "#344055",
            padding: "0 12px",
          }}
        >
          <span>전자결재</span>
          <Link to="/approvalPage" style={{ fontSize: "12px", color: "#bbb" }}>
            바로가기
          </Link>
        </div>

        {/* 탭 + 리스트 */}
        <div
          style={{
            background: "#f9f9f9",
            borderRadius: "6px",
            minHeight: "280px",
          }}
        >
          {/* 탭 */}
          <div
            style={{
              display: "flex",
              borderBottom: "0.9px solid #ddd",
            }}
          >
            {["긴급", "반려", "보류", "대기"].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: activeTab === tab ? "#2c557d" : "#555",
                  fontWeight: activeTab === tab ? "600" : "400",
                  borderBottom:
                    activeTab === tab
                      ? "3px solid #2c557d"
                      : "3px solid transparent",
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* 리스트 */}
          <div
            style={{
              height: "220px",
              overflowY: "auto",
              padding: "12px",
              background: "#f9f9f9",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            }}
          >
            {approvalData[activeTab].map((item, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "14px",
                  color: "#444",
                  lineHeight: "3",
                  listStyleType: "disc",
                  paddingLeft: "15px",
                  margin: 0,
                }}
              >
                {item}
              </li>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;