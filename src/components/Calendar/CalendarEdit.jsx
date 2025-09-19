import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../common/Button";
import DatePicker from "../common/DatePicker"; // ✅ 공통 DatePicker import
import { modifyCalendar } from "../motiveOn/api"; // ✅ 일정 수정 API

const CalendarEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 기존 일정 데이터
  const event = location.state?.event || {};

  // ✅ timestamp → YYYY-MM-DD
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ✅ timestamp → HH:mm
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  };

  // ✅ 초기값 설정 (sdate, edate 사용)
  const [title, setTitle] = useState(event.title || "");
  const [startDate, setStartDate] = useState(formatDate(event.sdate));
  const [startTime, setStartTime] = useState(formatTime(event.sdate));
  const [endDate, setEndDate] = useState(formatDate(event.edate));
  const [endTime, setEndTime] = useState(formatTime(event.edate));
  const [category, setCategory] = useState(event.catecode || "");
  const [content, setContent] = useState(event.content || "");

  // ✅ 수정 저장
  const handleUpdate = async () => {
    if (!title) {
      alert("제목을 입력하세요");
      return;
    }

    const updatedEvent = {
      ccode: event.ccode, // 일정 PK
      title,
      start: startDate && startTime ? `${startDate} ${startTime}:00` : null,
      end: endDate && endTime ? `${endDate} ${endTime}:00` : null,
      catecode: category,
      content,
      color: event.color || "#4caf50",
    };

    console.log("👉 수정 요청 데이터:", updatedEvent);

    try {
      const res = await modifyCalendar(updatedEvent);
      if (res.status === 200 && res.data === "success") {
        alert("일정이 수정되었습니다.");
        navigate("/calendarPage");
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      console.error("수정 오류:", err);
      alert("서버 오류 발생");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 본문 */}
      <div style={{ padding: "8.7px", height: "700px", overflowY: "auto" }}>
        {/* 제목 */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "13px" }}
        >
          <label style={{ width: "60px", fontSize: "14px", fontWeight: "bold" }}>
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              fontSize: "14px",
            }}
          />
        </div>

        {/* 일시 */}
        <div style={{ display: "flex", marginBottom: "16px" }}>
          <label
            style={{
              width: "60px",
              fontSize: "14px",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            일시
          </label>

          <div style={{ flex: 1 }}>
            {/* 시작일 */}
            <div style={{ marginBottom: "8px" }}>
              <DatePicker
                dateValue={startDate}
                timeValue={startTime}
                onDateChange={setStartDate}
                onTimeChange={setStartTime}
                showTime={true}
              />
            </div>

            {/* 종료일 */}
            <div style={{ marginBottom: "0px" }}>
              <DatePicker
                dateValue={endDate}
                timeValue={endTime}
                onDateChange={setEndDate}
                onTimeChange={setEndTime}
                showTime={true}
              />
            </div>
          </div>
        </div>

        {/* 분류 */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "13px" }}
        >
          <label style={{ width: "60px", fontSize: "14px", fontWeight: "bold" }}>
            분류
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              fontSize: "14px",
            }}
          >
            <option value="">분류를 선택하세요</option>
            <option value="C">회사</option>
            <option value="D">부서</option>
            <option value="P">개인</option>
          </select>
        </div>

        {/* 내용 */}
        <div style={{ display: "flex" }}>
          <label
            style={{
              width: "60px",
              fontSize: "14px",
              fontWeight: "bold",
              marginTop: "6px",
            }}
          >
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요."
            style={{
              flex: 1,
              height: "459px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              fontSize: "13px",
              resize: "none",
            }}
          />
        </div>
      </div>

      <hr style={{ margin: "9px 0", border: "0.2px solid #eee" }} />

      {/* 취소 / 수정 버튼 */}
      <div style={{ display: "flex", gap: "8px", padding: "2px 16px 5px" }}>
        <Button label="취소" variant="secondary" onClick={() => navigate(-1)} />
        <Button label="수정" variant="primary" onClick={handleUpdate} />
      </div>
    </div>
  );
};

export default CalendarEdit;