import React from "react";

const BottomSheetModal = ({ isOpen, title, message, onConfirm, onCancel, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          width: "100%",
          maxWidth: 480,
          padding: 20,
          transform: "translateY(0)",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 style={{ marginBottom: 10, textAlign: "center" }}>{title}</h3>}

        {/* ✅ children 우선 렌더 */}
        {children ? (
          <div>{children}</div>
        ) : message ? (
          <p style={{ fontSize: 14, marginBottom: 20, textAlign: "center" }}>{message}</p>
        ) : null}

        {onConfirm && (
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: 12,
                border: "1px solid #ccc",
                borderRadius: 8,
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
                padding: 12,
                border: "none",
                borderRadius: 8,
                background: "#ef5350",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              확인
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default BottomSheetModal;
