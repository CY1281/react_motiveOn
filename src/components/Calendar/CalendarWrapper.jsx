import React, { useState, useEffect } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarEventList from "./CalendarEventList";
import { getCalendarList } from "../motiveOn/api";

const CalendarWrapper = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // 날짜 포맷 (YYYY.MM.DD)
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // ✅ 공통 fetch 함수
  const fetchEvents = async () => {
    try {
      const res = await getCalendarList();
      const rawEvents = res.data.calendarList || [];

      const mappedEvents = rawEvents.map((event) => {
        let color = "#9bc59c";
        if (event.catecode === "C") color = "#f76258"; // 회사
        else if (event.catecode === "D") color = "#71b2e7"; // 부서
        else if (event.catecode === "P") color = "#94c296"; // 개인

        return {
          ...event,
          sdate: formatDate(event.sdate),
          edate: formatDate(event.edate),
          color,
        };
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    // 최초 로드
    fetchEvents();

    // ✅ 삭제 후 refresh 이벤트 받을 수 있도록 listener 추가
    const refreshHandler = () => fetchEvents();
    window.addEventListener("calendar:refresh", refreshHandler);

    // cleanup
    return () => {
      window.removeEventListener("calendar:refresh", refreshHandler);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "844px",
        maxWidth: "390px",
        margin: "0 auto",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 달력 영역 */}
      <div style={{ flex: 2.5, minHeight: 0 }}>
        <CalendarHeader setSelectedDate={setSelectedDate} />
      </div>

      {/* 이벤트 리스트 영역 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CalendarEventList events={events} selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default CalendarWrapper;