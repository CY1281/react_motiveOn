import React, { useEffect, useState } from "react";
import { IconPlus } from "../Work/icons";
import { useNavigate } from "react-router-dom";
import { getMyWorkList } from "../motiveOn/api";
import StatusBadge from "../common/StatusBadge";

export default function MyWorkListPage() {
  const navigate = useNavigate();
  const [workList, setWorkList] = useState([]);

  useEffect(() => {
    const fetchMyWork = async () => {
      try {
        const res = await getMyWorkList();
        setWorkList(res.data.list || []);
      } catch (err) {
        console.error("업무 목록 가져오기 실패:", err);
      }
    };
    fetchMyWork();
  }, []);

  const statusMap = {
    WAIT: "대기",
    PROGRESS: "진행중",
    DONE: "완료",
  };

  useEffect(() => {
    let startX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;

      if (diffX > 80) {
        navigate(-1);
      }
      if (diffX < -80) {
        navigate(1);
      }
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate]);

  const formatWorkPeriod = (work) => {
    const start = work.wdate ? new Date(work.wdate).toLocaleDateString() : "";
    const end = work.wend ? new Date(work.wend).toLocaleDateString() : "";
    if (!start && !end) return "미정";
    return start && end ? `${start} ~ ${end}` : start || end;
  };

  return (
    <div style={{ padding: "16px", height: "788px", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px", fontWeight: "bold" }}>
        <span>내 업무 &gt; 전체</span>
      </div>
      <hr style={{ border: "0.1px solid #eee", margin: "8px 0" }} />

      <div>
        {workList.length === 0 ? (
          <div style={{ color: "#777", fontSize: "14px" }}>업무가 없습니다.</div>
        ) : (
          workList.map((work) => (
            <div
              key={work.wcode}
              style={{
                position: "relative", // 상태 배지 absolute 기준
                background: "#fff",
                padding: "12px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                marginBottom: "12px",
                cursor: "pointer"
              }}
              onClick={() => navigate(`/work/detail/${work.wcode}`, { state: { from: "mywork" } })}
            >
              {/* 상태 배지 우측 상단 */}
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <StatusBadge label={statusMap[work.wstatus] || "미정"} />
              </div>

              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{work.wtitle || work.wcode}</div>
              <div style={{ fontSize: "13px", color: "#555" }}>
                {work.dno} {work.managerName || "담당자 없음"}
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                기한: {formatWorkPeriod(work)}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: "15px",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "#52586B",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => navigate("/work/regist")}
      >
        <IconPlus />
      </button>
    </div>
  );
}