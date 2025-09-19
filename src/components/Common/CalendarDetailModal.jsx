// src/components/common/CalendarDetailModal.jsx
import React from "react";

const CalendarDetailModal = ({ isOpen, event, onModify, onDelete, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "400px",
          maxWidth: "90%",
          padding: "20px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#181818" }}>
          일정 상세
        </h3>
        <hr style={{ margin: "12px 0", border: "0.5px solid #ebebeb" }} />

        {/* 상세내용 */}
        <div style={{ fontSize: "14.7px", color: "#333", lineHeight: "2.0" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ display: "inline-block", width: "50px" }}>
              제목 :
            </strong>
            <span>{event?.title || ""}</span>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ display: "inline-block", width: "50px" }}>
              분류 :
            </strong>
            <span>{event?.category || ""}</span>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ display: "inline-block", width: "50px" }}>
              일시 :
            </strong>
            <span>{event?.date || ""}</span>
          </div>
          <div>
            <strong style={{ display: "inline-block", width: "50px" }}>
              내용 :
            </strong>
            <span>{event?.content || ""}</span>
          </div>
        </div>

        <hr style={{ margin: "16px 0", border: "0.5px solid #ebebeb" }} />

        {/* 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "7px",
          }}
        >
          <button
            onClick={onModify}
            style={{
              background: "#545761",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            style={{
              background: "#D9534F",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarDetailModal;