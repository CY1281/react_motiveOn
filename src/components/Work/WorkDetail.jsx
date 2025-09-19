// src/components/Work/WorkDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { getWorkDetail, deleteWork } from "../motiveOn/api";

export default function WorkDetail() {
  const { wcode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;

  const [work, setWork] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statusMap = {
    WAIT: "대기",
    ING: "진행중",
    DONE: "완료",
  };

  // 상세 데이터 가져오기
  useEffect(() => {
    const fetchWorkDetail = async () => {
      try {
        const res = await getWorkDetail(wcode);
        setWork(res.data.work);
      } catch (err) {
        console.error("업무 상세 불러오기 실패:", err);
      }
    };
    fetchWorkDetail();
  }, [wcode]);

  // 삭제 처리
  const handleDelete = async () => {
    try {
      // ✅ deleteWork 함수에서 쿼리 파라미터로 전달
      const res = await deleteWork(wcode);

      if (res.status === 200 && res.data.message === "success") {
        alert("업무가 삭제되었습니다.");
        navigate("/work/reqlist", { replace: true }); // ✅ 요청업무 페이지로 이동
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      console.error("업무 삭제 실패:", err);
      alert("서버 오류로 삭제 실패");
    }
  };

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
        <h3
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "bold",
            color: "#222",
          }}
        >
          {work.wtitle || "제목 없음"}
        </h3>
        <hr
          style={{
            marginTop: "4px",
            border: "none",
            borderTop: "1px solid #ddd",
          }}
        />
      </div>

      {/* 내용 영역 */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "16px" }}>
        {[
          { label: "요청자", value: work.requesterName || "미정" },
          { label: "담당자", value: work.managerName || "담당자 없음" },
          {
            label: "기한",
            value: (() => {
              const start = work.wdate
                ? new Date(work.wdate).toLocaleDateString()
                : "";
              const end = work.wend
                ? new Date(work.wend).toLocaleDateString()
                : "";
              if (!start && !end) return "미정";
              return start && end ? `${start} ~ ${end}` : start || end;
            })(),
          },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "70px",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#555",
              }}
            >
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "70px",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            상태
          </div>
          <StatusBadge label={statusMap[work.wstatus] || "미정"} />
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
            dangerouslySetInnerHTML={{
              __html: work.wcontent || "내용 없음",
            }}
          />
        </div>
      </div>

      {/* 버튼 영역 */}
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
          <Button
            label="수정"
            variant="primary"
            onClick={() =>
              navigate(`/work/detailedit/${wcode}`, { state: { work } })
            }
          />
          <Button
            label="삭제"
            variant="danger"
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      )}

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
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                style={{
                  background: "#999",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
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
                  padding: "6px 14px",
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
    </div>
  );
}