import React, { useEffect } from "react";

const Toast = ({ message, isOpen, duration = 2000, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "60px", // 하단에서 조금 위로
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "20px",
        fontSize: "14px",
        zIndex: 10000,
        animation: "fadeInOut 2s ease",
      }}
    >
      {message}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, 20px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            90% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, 20px); }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;