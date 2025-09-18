// src/components/Approval/FormPickerPage.jsx
import React, { useState } from "react";

const forms = [
  { sformno: "F-001", formName: "지출결의서" },
  { sformno: "F-105", formName: "휴가신청서" },
  { sformno: "F-077", formName: "출장보고서" },
];

export default function FormPickerPage({ onPick }) {
  const [selected, setSelected] = useState(null);

  const handlePick = (sformno) => {
    setSelected(sformno);
    onPick?.(sformno); // ✅ 부모로 전달
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          border: "1px solid #e1e5ef",
          borderRadius: 12,
          maxHeight: 400,
          overflowY: "auto",
          padding: 12,
        }}
      >
        {forms.map((f) => (
          <label
            key={f.sformno}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fafcff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <input
              type="radio"
              name="form"
              checked={selected === f.sformno}
              onChange={() => handlePick(f.sformno)}
            />
            <span>{f.formName}</span>
          </label>
        ))}
      </div>
    </div>
  );
}