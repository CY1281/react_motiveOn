import React from "react";
import StatusBadge from "../common/StatusBadge";

const ApprovalStatusList = () => {
  const statuses = [
    { label: "대기", count: 3, color: "#a5d6a7" },
    { label: "진행", count: 1, color: "#81d4fa" },
    { label: "보류", count: 2, color: "#ffe082" },
    { label: "반려", count: 1, color: "#ffcc80" },
    { label: "긴급", count: 1, color: "#ef9a9a" },
  ];

  return (
    <div>
      <h4>전자결재 상태 요약</h4>
      {statuses.map((s, idx) => (
        <StatusBadge
          key={idx}
          label={s.label}
          count={s.count}
          color={s.color}
          onClick={() => console.log(s.label + " 클릭됨")}
        />
      ))}
    </div>
  );
};

export default ApprovalStatusList;