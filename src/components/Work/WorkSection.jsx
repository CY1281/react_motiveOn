import React from "react";
import StatusCard from "../common/StatusCard"; 

const WorkSection = () => {

  const items = [
    { label: "대기", count: 2, color: "#e0f7e9" },
    { label: "진행", count: 1, color: "#ffe5e0" },
    { label: "협업요청", count: 0, color: "#fce0f6" },
    { label: "대리요청", count: 3, color: "#ececec" },
    { label: "완료", count: 5, color: "#fff6cc" },
    { label: "전체", count: 11, color: "#eaeaea" },
  ];

  return (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ marginBottom: "8px" }}>내 업무</h4>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {items.map((item, idx) => (
          <StatusCard
            key={idx}
            label={item.label}
            count={item.count}
            color={item.color}
            onClick={() => console.log(item.label + " 클릭됨")}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkSection;
