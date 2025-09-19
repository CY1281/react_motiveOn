// src/components/calendar/CalendarDetail.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCalendar } from "../motiveOn/api";

const CalendarDetail = ({ event, onClose }) => {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ✅ 삭제 처리 함수
  const handleDelete = async () => {
    try {
      const res = await deleteCalendar(event.ccode);

      if (res.status === 200 && res.data === "success") {
        alert("삭제되었습니다.");
        setDeleteOpen(false);
        if (res.status === 200 && res.data === "success") {
          console.log("✅ 이벤트 발행");
          window.dispatchEvent(new Event("calendar:refresh"));
          onClose();
}



        
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      alert("서버 오류 발생");
    }
  };

  return (
    <>
      {/* 일정 상세 모달 */}
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
            borderRadius: "12px",
            width: "340px",
            padding: "20px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#52586B",
              marginBottom: "12px",
            }}
          >
            일정 상세
          </h3>
          <div
            style={{
              fontSize: "14px",
              color: "#52586B",
              lineHeight: "1.8",
            }}
          >
            <div>제목 : {event?.title}</div>
            <div>분류 : {event?.category}</div>
            <div>일시 : {event?.date}</div>
            <div>내용 : {event?.content}</div>
          </div>

          <hr
            style={{ margin: "16px 0", border: "0.5px solid #ddd" }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => alert("수정 기능 연결 예정")}
              style={{
                background: "#999",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px", // 버튼 크기 조금 줄임
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)} // 삭제 모달 열기
              style={{
                background: "#ca302e",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px", // 버튼 크기 조금 줄임
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
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
            zIndex: 10000,
          }}
          onClick={() => setDeleteOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "300px",
              padding: "24px 20px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#52586B",
                marginBottom: "24px",
              }}
            >
              정말 삭제하시겠습니까?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                style={{
                  background: "#999",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px", // 크기 줄임
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  background: "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px", // 크기 줄임
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarDetail;