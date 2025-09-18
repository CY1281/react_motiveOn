import React, { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import InputField from "../common/InputField";

export default function RequestedWorkPage() {
  const [formData, setFormData] = useState({
    requester: "김민준",
    assignee: "박동규",
    deadline: "2025.09.09",
    content: "테스트입니다. 테스트입니다. 긴 문장이 와도 자동으로 줄바꿈이 됩니다.",
    status: "대기",
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = () => {
    console.log("저장된 데이터:", formData);
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
          테스트 (수정 모드)
        </h3>
      </div>

      {/* 내용 영역 - flex:1 + 스크롤 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", boxSizing: "border-box" }}>
        <InputField
          label="요청자"
          value={formData.requester}
          onChange={handleChange("requester")}
        />

        <InputField
          label="담당자"
          value={formData.assignee}
          onChange={handleChange("assignee")}
        />

        <InputField
          label="기한"
          type="date"
          value={formData.deadline}
          onChange={handleChange("deadline")}
        />

       {/* 상태 */}
<div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
  <div style={{ width: "40px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
    상태
  </div>
  <StatusBadge label={formData.status} />
</div>

        {/* 내용 textarea */}
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

      {/* 하단 버튼 영역 - 고정 */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: "12px",
        }}
      >
        <Button label="저장" variant="primary" onClick={handleSave} />
        <Button label="취소" variant="secondary" onClick={() => console.log("취소 클릭")} />
      </div>
    </div>
  );
}


















     