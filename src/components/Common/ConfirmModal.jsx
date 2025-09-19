// src/components/common/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  children 
}) => {
  if (!isOpen) return null;

  // 배경 클릭 시 닫기
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onCancel();
    }
  };

  return (
    <div
      className="modal-overlay"
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
      onClick={handleBackgroundClick} // ✅ 배경 클릭 감지
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "13px",
          width: "90%",
          maxWidth: "400px",
          maxHeight: "90%",
          overflowY: "auto",
          padding: "20px",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()} // ✅ 내부 클릭은 전파 막기
      >
        {children ? (
          children
        ) : (
          <>
            {title && <h3 style={{ marginBottom: "10px" }}>{title}</h3>}
            {message && (
              <p style={{ fontSize: "14px", marginBottom: "20px" }}>{message}</p>
            )}
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
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
                  padding: "10px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#ef5350",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                확인
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmModal;