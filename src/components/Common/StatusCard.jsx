import React from "react";

const StatusCard = ({ label, count, color, onClick }) => {
  return (
    <div
      style={{
        flex: "1",
        minWidth: "70px",
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: color || "#f5f5f5",
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
    >
      <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", color: "#333" }}>{count}건</div>
    </div>
  );
};

export default StatusCard;