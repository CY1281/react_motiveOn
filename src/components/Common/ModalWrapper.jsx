import React from "react";
import useModalStore from "../../store/modalStore";

const ModalWrapper = () => {
  const { isOpen, content, closeModal } = useModalStore();

  if (!isOpen) return null; // 모달이 닫혀있으면 렌더링 X

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)", // 배경 반투명
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={closeModal} // 배경 클릭 → 닫기
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "280px",
          maxWidth: "90%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않게
      >
        {content}
        <button
          onClick={closeModal}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "8px",
            background: "#3A8DFE",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default ModalWrapper;