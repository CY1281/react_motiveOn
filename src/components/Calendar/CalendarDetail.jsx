// src/components/calendar/CalendarDetail.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CalendarDetailModal from "../common/CalendarDetailModal"; // ✅ 새 이름으로 변경

const CalendarDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  if (!event) return null;

  const getCategoryLabel = (catecode) => {
    switch (catecode) {
      case "C":
        return "회사 일정";
      case "D":
        return "부서 일정";
      case "P":
        return "개인 일정";
      default:
        return "기타";
    }
  };

  return (
    <CalendarDetailModal
      isOpen={true}
      event={{
        title: event.title,
        category: getCategoryLabel(event.catecode),
        date: `${event.sdate} ~ ${event.edate}`,
        content: event.content,
      }}
      onModify={() =>
        navigate("/calendar/CalendarRegist", { state: { event } })
      }
      onDelete={() => {
        alert("삭제 기능 연동 예정");
        navigate(-1);
      }}
      onClose={() => navigate(-1)}
    />
  );
};

export default CalendarDetail;