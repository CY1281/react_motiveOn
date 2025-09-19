import React from "react";

const STATUS_COLORS = {
  대기: "#c8e6c9",   // 연한 초록
  보류: "#bbdefb",   // 연한 파랑
  긴급: "#ef5350",   // 빨강
  반려: "#fff176",   // 노랑
  임시: "#bdbdbd",   // 회색
};

const StatusBadge = ({ label }) => {
  const bgColor = STATUS_COLORS[label] || "#e0e0e0";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 14px",   // 조금 더 네모 느낌
        borderRadius: "6px",  // 살짝 둥글게
        fontSize: "13px",
        fontWeight: "bold",
        backgroundColor: bgColor,
        color: "#333",
        textAlign: "center",
        minWidth: "50px",
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;