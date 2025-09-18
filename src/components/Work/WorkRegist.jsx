import React, { useState } from "react";
import Header from "../common/Header";
import InputField from "../common/InputField";
import SelectBox from "../common/SelectBox";
import Button from "../common/Button";
import DatePicker from "../common/DatePicker";
import OrgTree from "../common/OrgTree";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequestedWorkPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showOrgTree, setShowOrgTree] = useState(false);
  const [title, setTitle] = useState("");
  const [requester, setRequester] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState("");
  const [assignees, setAssignees] = useState([]);

  const handleSelectAssignee = (user) => {
    setAssignees(prev => {
      if (prev.some(a => a.value === user.value)) {
        return prev.filter(a => a.value !== user.value);
      } else {
        return [...prev, user];
      }
    });
  };

  const requesterOptions = [
    { value: "kim", label: "김민준" },
    { value: "lee", label: "이서준" },
  ];

  const handleSave = () => {
    const data = { title, requester, assignees, startDate, endDate, content };
    console.log("저장 데이터:", data);
  };


  const pageWrapperStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    maxHeight: "100vh",
    fontFamily: "Noto Sans CJK KR, sans-serif",
    backgroundColor: "#f0f2f5",
  };

  const contentContainerStyle = {
    flex: 1,
    maxWidth: "390px",
    maxHeight: "704px",
    padding: "16px",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  };

  const fieldRowStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  };

  const labelStyle = {
    width: "80px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
    flexShrink: 0,
    marginRight: "8px",
  };

  const inputWrapperStyle = {
    flex: 1,
  };

  const commonInputStyle = {
    height: "40px",
    padding: "0 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
    lineHeight: "40px",
    width: "100%",
    outline: "none",
  };

  const assigneeInputStyle = {
    ...commonInputStyle,
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  };

  const buttonContainerStyle = {
    padding: "8px",
    backgroundColor: "white",
  };

  return (
    <div style={pageWrapperStyle}>

      <div style={contentContainerStyle}>
        {/* 제목 */}
        <div style={fieldRowStyle}>
          <div style={labelStyle}>제목</div>
          <div style={inputWrapperStyle}>
            <InputField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요(필수)"
              required
              style={commonInputStyle}
            />
          </div>
        </div>

        {/* 요청자 */}
        <div style={fieldRowStyle}>
          <div style={labelStyle}>요청자</div>
          <div style={inputWrapperStyle}>
            <SelectBox
              options={requesterOptions}
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="요청자를 선택하세요."
              style={commonInputStyle}
            />
          </div>
        </div>

        {/* 담당자 */}
        <div style={fieldRowStyle}>
          <div style={labelStyle}>담당자</div>
          <input
            type="text"
            value={assignees.map(a => a.label).join(", ")}
            placeholder="담당자를 선택하세요."
            readOnly
            onClick={() => setShowOrgTree(true)}
            style={assigneeInputStyle}
          />
        </div>

        {/* 시작일 */}
        <div style={fieldRowStyle}>
          <div style={labelStyle}>시작일</div>
          <div style={inputWrapperStyle}>
            <DatePicker
              dateValue={startDate}
              onDateChange={setStartDate}
              style={commonInputStyle}
            />
          </div>
        </div>

        {/* 종료일 */}
        <div style={fieldRowStyle}>
          <div style={labelStyle}>종료일</div>
          <div style={inputWrapperStyle}>
            <DatePicker
              dateValue={endDate}
              onDateChange={setEndDate}
              style={commonInputStyle}
            />
          </div>
        </div>

        {/* 내용 */}
        <div style={{ ...fieldRowStyle, alignItems: "flex-start", marginBottom: 0 }}>
          <div style={labelStyle}>내용</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              fontSize: "14px",
              height: "325px",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />
        <Button label="저장" onClick={handleSave} variant="primary" />
      </div>

      {/* OrgTree 모달 */}
      {showOrgTree && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowOrgTree(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              width: "80%",
              maxWidth: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <OrgTree
              onSelect={handleSelectAssignee}
              selectedAssignees={assignees}
            />
            <Button label="닫기" onClick={() => setShowOrgTree(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
