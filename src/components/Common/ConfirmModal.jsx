import React from "react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
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
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "320px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        {title && <h3 style={{ marginBottom: "10px" }}>{title}</h3>}
        <p style={{ fontSize: "14px", marginBottom: "20px", whiteSpace: "pre-line"}}>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
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
      </div>
    </div>
  );
};

export default ConfirmModal;