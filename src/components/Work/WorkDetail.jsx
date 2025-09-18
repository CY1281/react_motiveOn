import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { getWorkDetail } from "../motiveOn/api"; // API 필요

export default function WorkDetail() {
  const { wcode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;

  const [work, setWork] = useState(null);

  useEffect(() => {
    const fetchWorkDetail = async () => {
      try {
        const res = await getWorkDetail(wcode);
        setWork(res.data.work); // mapper에서 내려준 데이터 그대로 사용
      } catch (err) {
        console.error("업무 상세 불러오기 실패:", err);
      }
    };

    fetchWorkDetail();
  }, [wcode]);

  if (!work) return <div>로딩중...</div>;

  return (
    <div
      style={{
        maxWidth: "390px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        height: "788px",
        display: "flex",
        flexDirection: "column",
        padding: "16px 16px 0px",
        boxSizing: "border-box",
      }}
    >
      {/* 고정 헤더 */}
      <div style={{ marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "bold", color: "#222" }}>
          {work.wtitle || "제목 없음"}
        </h3>
        <hr style={{ marginTop: "4px", border: "none", borderTop: "1px solid #ddd" }} />
      </div>

      {/* 내용 영역 */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "16px" }}>
        {[
          { label: "요청자", value: work.requesterName || "미정" },
          { label: "담당자", value: work.managerName || "담당자 없음" },
          { label: "기한", value: work.wend || "미정" },
        ].map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ width: "70px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>
              {item.label}
            </div>
            <div
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: "#f5f5f5",
                fontSize: "13px",
                color: "#333",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ width: "70px", fontSize: "13px", fontWeight: "bold", color: "#555" }}>상태</div>
          <StatusBadge label={work.wstatus || "대기"} />
        </div>

        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "70px",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#555",
              paddingTop: "4px",
            }}
          >
            내용
          </div>
          <div
            style={{
              flex: 1,
              minHeight: "180px",
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#f5f5f5",
              fontSize: "13px",
              color: "#333",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {work.wcontent || "내용 없음"}
          </div>
        </div>
      </div>

      {/* 버튼 영역: 요청업무에서 들어온 경우만 */}
      {from === "reqlist" && (
        <div
          style={{
            borderTop: "1px solid #ddd",
            paddingTop: "12px",
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <Button label="수정" variant="primary" onClick={() => navigate(`/work/detailedit/${wcode}`)} />
          <Button label="삭제" variant="danger" onClick={() => console.log("삭제 클릭")} />
        </div>
      )}
    </div>
  );
}
