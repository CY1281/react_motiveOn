import React from "react";
import { useNavigate } from "react-router-dom";
import StatusCard from "../common/StatusCard.jsx";

export default function MyWorkPage() {
  const navigate = useNavigate();

  const myWorkStatuses = [
    { label: "대기", count: 0, color: "#d8f5d0" },
    { label: "진행", count: 0, color: "#f9d9d4" },
    { label: "협업요청", count: 0, color: "#f3d7f9" },
    { label: "대리요청", count: 0, color: "#e2e2e2" },
    { label: "완료", count: 0, color: "#fff9c4" },
    { label: "전체", count: 0, color: "#e0e7ff" },
  ];

  const requestedWorkStatuses = [
    { label: "대기", count: 0, color: "#d8f5d0" },
    { label: "진행", count: 0, color: "#f9d9d4" },
    { label: "협업요청", count: 0, color: "#f3d7f9" },
    { label: "대리요청", count: 0, color: "#e2e2e2" },
    { label: "완료", count: 0, color: "#fff9c4" },
    { label: "전체", count: 0, color: "#e0e7ff" },
  ];

  
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 내 업무 */}
      <Section title="내 업무" 
               showMore 
               onMoreClick={() => navigate("/work/myworklist")} >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {myWorkStatuses.map((s, i) => (
            <StatusCard key={i} {...s} />
          ))}
        </div>
      </Section>

      {/* 요청한 업무 */}
      <Section title="요청한 업무" 
               showMore
               onMoreClick={() => navigate("/work/reqlist")} >

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {requestedWorkStatuses.map((s, i) => (
            <StatusCard key={i} {...s} />
          ))}
        </div>
      </Section>

      {/* 금주 마감 업무 */}
      <Section title="금주 마감 업무" fullHeight>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {[1, 2].map((_, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                  업무 제목
                </div>
                <div style={{ fontSize: "13px", color: "#555" }}>00부 김00</div>
                <div style={{ fontSize: "13px", color: "#777" }}>
                  상태: 대기
                </div>
                <div
                  style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}
                >
                  ~2025.09.07
                </div>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                {idx === 0 ? "내 업무" : "요청한 업무"}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

const Section = ({ title, children, showMore, fullHeight, onMoreClick }) => {
  return (
    <div
      style={{
        // marginBottom: "10px",
        background: "#fff",
        borderRadius: "7px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: fullHeight ? "300px" : "auto", // fullHeight이면 고정 높이 + 내부 스크롤
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        <span>{title}</span>
        {showMore && (
          <span
            style={{ color: "#777", fontSize: "12px", cursor: "pointer" }}
            onClick={onMoreClick} // 클릭 이벤트 연결
          >
            더보기
          </span>
        )}
      </div>
      {children}
    </div>
  );
};
