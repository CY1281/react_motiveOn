import React from "react";

const BottomSheetModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)", // 배경 반투명
        display: "flex",
        alignItems: "flex-end", // 하단 정렬
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancel} // 배경 클릭 시 닫힘
    >
      <div
        style={{
          background: "#fff",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          width: "100%",
          maxWidth: "480px",
          padding: "20px",
          transform: "translateY(0)",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
      >
        {/* 제목 */}
        {title && (
          <h3 style={{ marginBottom: "10px", textAlign: "center" }}>{title}</h3>
        )}

        {/* 메시지 */}
        <p style={{ fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
          {message}
        </p>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#f1f1f1",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#ef5350",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            확인
          </button>
        </div>
      </div>

      {/* 슬라이드 애니메이션 keyframes */}
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default BottomSheetModal;