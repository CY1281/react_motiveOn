import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import InputField from "../common/InputField";
import { modifyWork } from "../motiveOn/api"; // ✅ 수정 API import

export default function WorkDetailEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { wcode } = useParams();

  // WorkDetail에서 넘어온 데이터
  const work = location.state?.work;

  const [formData, setFormData] = useState({
    wtitle: "",
    requester: "",
    assignee: "",
    deadline: "",
    content: "",
    status: "",
  });

  // 넘어온 work 데이터로 초기값 세팅
  useEffect(() => {
    if (work) {
      setFormData({
        wtitle: work.wtitle || "",
        requester: work.requesterName || "",
        assignee: work.managerName || "",
        deadline: work.wend ? new Date(work.wend).toISOString().substring(0, 10) : "",
        content: work.wcontent ? work.wcontent.replace(/<[^>]+>/g, "") : "",
        status: work.wstate || "WAIT", // 상태 코드 그대로 사용
      });
    }
  }, [work]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        wcode,
        wtitle: formData.wtitle,
        wcontent: formData.content,
        wend: formData.deadline, // yyyy-MM-dd
        wstate: formData.status, // WAIT / ING / DONE 등 코드값
      };

      const res = await modifyWork(payload);

      if (res.data.message === "success" || res.data === "SUCCESS") {
        alert("업무가 수정되었습니다.");
        // ✅ 수정 후 상세보기로 이동하면서 새로고침되도록 state 초기화
        navigate(`/work/detail/${wcode}`, { replace: true });
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      console.error("업무 수정 실패:", err);
      alert("서버 오류로 수정에 실패했습니다.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "390px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        height: "788px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* 고정 헤더 */}
      <div style={{ padding: "16px", borderBottom: "1px solid #ddd" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "bold", color: "#222" }}>
          {formData.wtitle || "업무 수정"} (수정 모드)
        </h3>
      </div>

      {/* 내용 영역 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", boxSizing: "border-box" }}>
        <InputField label="제목" value={formData.wtitle} onChange={handleChange("wtitle")} />
        <InputField label="요청자" value={formData.requester} onChange={handleChange("requester")} />
        <InputField label="담당자" value={formData.assignee} onChange={handleChange("assignee")} />
        <InputField label="기한" type="date" value={formData.deadline} onChange={handleChange("deadline")} />

        {/* 상태 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ width: "40px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>상태</div>
          <StatusBadge label={formData.status} />
        </div>

        {/* 내용 */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "325px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "6px",
              color: "#333",
            }}
          >
            내용
          </label>
          <textarea
            value={formData.content}
            onChange={handleChange("content")}
            style={{
              flex: 1,
              width: "100%",
              resize: "none",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              outline: "none",
              lineHeight: "1.5",
              boxSizing: "border-box",
            }}
            placeholder="내용을 입력하세요"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: "12px",
        }}
      >
        <Button label="저장" variant="primary" onClick={handleSave} />
        <Button label="취소" variant="secondary" onClick={() => navigate(-1)} />
      </div>
    </div>
  );
}