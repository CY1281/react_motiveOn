import React from "react";
import CalendarWrapper from "./CalendarWrapper";

const CalendarPage = () => {
  return (
    <div
      style={{
        width: "100%",               // 전체 화면 가로 꽉 채우기
        height: "100%",              // 부모(main) 꽉 채우기
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        overflow: "hidden",          // 내부 스크롤 제거
      }}
    >
      <CalendarWrapper />
    </div>
  );
};


export default CalendarPage;