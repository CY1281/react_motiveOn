// src/components/Approval/ApprovalComposePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import useOrgStore from "../../store/orgStore"; // 공용 스토어만 사용 (common 컴포넌트는 건드리지 않음)
import dropdownIcon from "../../assets/img/dropdown.png";

/* ============ helpers ============ */
const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};
const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* ============ lightweight Modal ============ */
function Modal({ open, onClose, children, maxWidth = 420, title }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 30px rgba(2,6,23,.24)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid #eee",
            fontWeight: 800,
          }}
        >
          {title}
        </div>
        <div style={{ padding: 12 }}>{children}</div>
      </div>
    </div>
  );
}

/* ============ Local Date Picker (모달) ============ */
function DatePickerModal({
  open,
  onClose,
  valueDate,
  valueTime = "",
  onApply,
  showTime = false,
}) {
  const [tmpDate, setTmpDate] = useState(valueDate || "");
  const [tmpTime, setTmpTime] = useState(valueTime || "");

  useEffect(() => {
    if (open) {
      setTmpDate(valueDate || "");
      setTmpTime(valueTime || "");
    }
  }, [open, valueDate, valueTime]);

  const apply = () => {
    onApply(tmpDate, showTime ? tmpTime : "");
  };
  const clear = () => {
    setTmpDate("");
    setTmpTime("");
  };

  return (
    <Modal open={open} onClose={onClose} title="날짜 선택" maxWidth={360}>
      <div style={{ display: "grid", gap: 10 }}>
        <input
          type="date"
          value={tmpDate}
          onChange={(e) => setTmpDate(e.target.value)}
          style={inputBox}
        />
        {showTime && (
          <input
            type="time"
            value={tmpTime}
            onChange={(e) => setTmpTime(e.target.value)}
            style={inputBox}
          />
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={clear} style={btnGhost}>
            지우기
          </button>
          <button onClick={onClose} style={btnGhost}>
            취소
          </button>
          <button onClick={apply} style={btnPrimary}>
            적용
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ============ Local Org Picker (모달) ============ */
/** 공용 common/OrgTree는 수정하지 말라는 요청에 따라,
 *  같은 스토어(useOrgStore)만 사용해서 Approval 전용 선택용 OrgPicker를 작성.
 */
function OrgPickerModal({
  open,
  onClose,
  multiple = false,
  initial = [],
  onApply,
  title = "조직도 선택",
}) {
  const { orgData } = useOrgStore();
  const [search, setSearch] = useState("");
  const [openDepts, setOpenDepts] = useState({});
  const [selectedMap, setSelectedMap] = useState(new Map());

  // 초기값 동기화
  useEffect(() => {
    if (!open) return;
    const map = new Map();
    (initial || []).forEach((p) => map.set(p.eno, p));
    setSelectedMap(map);
  }, [open, initial]);

  const filtered = useMemo(() => {
    const s = (search || "").trim();
    return orgData
      .map((dept) => {
        const matched = (dept.employees || []).filter(
          (emp) =>
            emp.name.includes(s) ||
            emp.position?.includes(s) ||
            dept.deptName.includes(s)
        );
        return { ...dept, employees: matched };
      })
      .filter((dept) => dept.employees.length > 0 || dept.deptName.includes(s));
  }, [orgData, search]);

  const toggleDept = (deptName) =>
    setOpenDepts((prev) => ({ ...prev, [deptName]: !prev[deptName] }));

  const isChecked = (emp) => selectedMap.has(emp.eno);
  const toggleSelect = (emp) =>
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (multiple) {
        next.has(emp.eno) ? next.delete(emp.eno) : next.set(emp.eno, emp);
      } else {
        next.clear();
        next.set(emp.eno, emp);
      }
      return next;
    });

  const apply = () => onApply(Array.from(selectedMap.values()));

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={380}>
      <div style={{ display: "grid", gap: 10 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색(이름/부서)"
          style={inputBox}
        />

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {filtered.map((dept) => {
            const isOpen = search ? true : openDepts[dept.deptName] ?? true;
            return (
              <li key={dept.deptName} style={{ marginBottom: 10 }}>
                {/* 부서 */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "4px 0",
                  }}
                  onClick={() => toggleDept(dept.deptName)}
                >
                  <span style={{ flex: 1 }}>{dept.deptName}</span>
                  <img
                    src={dropdownIcon}
                    alt="toggle"
                    style={{
                      width: 14,
                      height: 14,
                      transform: isOpen ? "rotate(180deg)" : "rotate(90deg)",
                      transition: "transform .2s ease",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* 사원 */}
                {isOpen && (
                  <ul style={{ listStyle: "none", paddingLeft: 14, margin: "6px 0" }}>
                    {dept.employees.map((emp) => {
                      const checked = isChecked(emp);
                      return (
                        <li
                          key={emp.eno}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                            cursor: "pointer",
                          }}
                          onClick={() => toggleSelect(emp)}
                        >
                          <input
                            type={multiple ? "checkbox" : "radio"}
                            readOnly
                            checked={checked}
                            style={{ width: 14, height: 14 }}
                          />
                          <span style={{ fontWeight: 700 }}>{emp.name}</span>
                          <span style={{ color: "#777", fontSize: 11 }}>{emp.position}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={btnGhost}>
            닫기
          </button>
          <button onClick={apply} style={btnPrimary}>
            적용
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ============ page ============ */
export default function ApprovalComposePage({
  currentUserName = "이민진",
  onTempSave = async () => ({ ok: true }),
  onSubmitDraft = async () => ({ ok: true, signNo: "A-2025-000123" }),
}) {
  const nav = useNavigate();
  const q = useQuery();
  const sformno = q.get("sformno") || "신규양식";

  const [title, setTitle] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [assignee, setAssignee] = useState(null); // {eno,name,deptName,position}
  const [refs, setRefs] = useState([]);           // array of same shape
  const [dueDate, setDueDate] = useState(todayStr());
  const [dueTime, setDueTime] = useState("");     // showTime을 true로 쓰면 활용
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  // 모달 상태
  const [orgModal, setOrgModal] = useState(null); // null | "assignee" | "refs"
  const [dateOpen, setDateOpen] = useState(false);

  // 외부 스크롤 잠금 (모바일 느낌 유지)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const fileInputRef = useRef(null);
  const onFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);
  };

  const buildPayload = () => ({
    sformno,
    title: title.trim(),
    emergency: emergency ? 1 : 0,
    assignee: assignee ? { id: assignee.eno, name: assignee.name } : null,
    refs: refs.map((r) => ({ id: r.eno, name: r.name })),
    due: dueTime ? `${dueDate} ${dueTime}` : dueDate,
    content,
  });

  const handleTemp = async () => {
    const res = await onTempSave(buildPayload());
    alert(res?.ok ? "임시저장 되었습니다." : (res?.message || "임시저장 실패"));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력해 주세요.");
    if (!assignee) return alert("담당자를 선택해 주세요.");
    const res = await onSubmitDraft(buildPayload());
    if (res?.ok) {
      res.signNo
        ? nav(`/approval/detail/${encodeURIComponent(res.signNo)}`, { replace: true })
        : nav("/approval", { replace: true });
    } else {
      alert(res?.message || "결재요청 실패");
    }
  };

  return (
    <>
      {/* ===== 본문 (embedded) ===== */}
      <Wrap>
        <Inner>
          <Title>
            신규 결재 작성 <Small>({sformno})</Small>
          </Title>

          {/* 제목 */}
          <Row>
            <Label>제목 :</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요."
            />
          </Row>

          {/* 요청자 + 긴급 */}
          <Row>
            <Label>요청자</Label>
            <Inline>
              <Read value={currentUserName} readOnly />
              <Badge $active={emergency} onClick={() => setEmergency((v) => !v)}>
                긴급
              </Badge>
            </Inline>
          </Row>

          {/* 담당자 */}
          <Row>
            <Label>
              담당자 <Req>*</Req>
            </Label>
            <Picker onClick={() => setOrgModal("assignee")}>
              {assignee ? `${assignee.name} (${assignee.position ?? ""})` : "담당자를 선택해 주세요."}
              <span className="chev">▾</span>
            </Picker>
          </Row>

          {/* 참조자 */}
          <Row>
            <Label>참조자</Label>
            <Picker onClick={() => setOrgModal("refs")}>
              {refs.length ? refs.map((r) => r.name).join(", ") : "참조자를 선택해 주세요."}
              <span className="chev">▾</span>
            </Picker>
          </Row>

          {/* 기한 (모달 달력) */}
          <Row>
            <Label>기한</Label>
            <Read
              readOnly
              value={dueTime ? `${dueDate} ${dueTime}` : dueDate}
              placeholder="날짜를 선택하세요"
              onClick={() => setDateOpen(true)}
              style={{ cursor: "pointer" }}
              title="클릭하여 날짜를 선택하세요"
            />
          </Row>

          {/* 내용 */}
          <Row>
            <Label>내용</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해 주세요."
            />
          </Row>

          {/* 첨부파일 */}
          <Row>
            <Label>첨부파일</Label>
            <FileLine>
              <Read
                readOnly
                value={files.length ? `${files.length}개 선택됨` : ""}
                placeholder=""
              />
              <FileBtn type="button" onClick={() => fileInputRef.current?.click()}>
                파일선택
              </FileBtn>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={onFiles}
              />
            </FileLine>
          </Row>

          {/* 하단 액션 */}
          <Actions>
            <Ghost onClick={handleTemp}>임시저장</Ghost>
            <Primary onClick={handleSubmit}>결재요청</Primary>
          </Actions>
        </Inner>
      </Wrap>

      {/* ===== 모달들 ===== */}
      <OrgPickerModal
        open={orgModal === "assignee"}
        onClose={() => setOrgModal(null)}
        multiple={false}
        initial={assignee ? [assignee] : []}
        onApply={(list) => {
          setAssignee(list?.[0] || null);
          setOrgModal(null);
        }}
        title="조직도 (담당자 선택)"
      />
      <OrgPickerModal
        open={orgModal === "refs"}
        onClose={() => setOrgModal(null)}
        multiple
        initial={refs}
        onApply={(list) => {
          setRefs(Array.isArray(list) ? list : []);
          setOrgModal(null);
        }}
        title="조직도 (참조자 선택)"
      />
      <DatePickerModal
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        valueDate={dueDate}
        valueTime={dueTime}
        onApply={(d, t) => {
          setDueDate(d || "");
          setDueTime(t || "");
          setDateOpen(false);
        }}
        showTime={false} // 시간까지 쓰려면 true 로 바꿔도 됨
      />
    </>
  );
}

/* ============ styles ============ */
const inputBox = {
  width: "100%",
  padding: "10px",
  fontSize: 13,
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#f9f9f9",
};

const btnGhost = {
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #d9dbe3",
  background: "#fff",
  fontWeight: 700,
};

const btnPrimary = {
  height: 36,
  padding: "0 16px",
  borderRadius: 8,
  border: 0,
  background: "#487FC3",
  color: "#fff",
  fontWeight: 800,
};

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 8px 24px;
`;
const Inner = styled.div`
  width: 100%;
  max-width: 680px;
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);
  padding: 12px 12px 16px;
`;
const Title = styled.h2`
  font-size: 16px;
  font-weight: 800;
  margin: 4px 0 12px;
  color: #2b2f3a;
`;
const Small = styled.small`
  font-size: 12px;
  font-weight: 600;
  color: #8a94a6;
  margin-left: 6px;
`;
const Row = styled.div`
  margin-bottom: 12px;
`;
const Label = styled.div`
  font-size: 12px;
  color: #333;
  font-weight: 700;
  margin-bottom: 6px;
`;
const Req = styled.span`
  color: #d35454;
  margin-left: 2px;
`;
const Inline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Input = styled.input`
  width: 100%;
  height: 34px;
  padding: 6px 10px;
  border: 1px solid #e1e5ef;
  border-radius: 6px;
  font-size: 14px;
`;
const Read = styled.input.attrs({ type: "text", readOnly: true })`
  width: 100%;
  height: 34px;
  padding: 6px 10px;
  border: 1px solid #e1e5ef;
  border-radius: 6px;
  background: #f7f8fb;
  font-size: 14px;
  color: #333;
`;
const Badge = styled.button`
  flex: 0 0 auto;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #d9dbe3;
  background: ${({ $active }) => ($active ? "#ffecec" : "#f2f3f7")};
  color: ${({ $active }) => ($active ? "#b01818" : "#666")};
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
`;
const Picker = styled.button`
  width: 100%;
  height: 34px;
  padding: 6px 10px;
  border: 1px solid #e1e5ef;
  border-radius: 6px;
  background: #fff;
  color: #6f7892;
  text-align: left;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .chev {
    color: #98a0b3;
  }
`;
const Textarea = styled.textarea`
  width: 100%;
  height: 190px;
  padding: 10px 12px;
  resize: none;
  border: 1px solid #e1e5ef;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
`;
const FileLine = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
`;
const FileBtn = styled.button`
  height: 34px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #d9dbe3;
  background: #f2f3f7;
  font-size: 12px;
  font-weight: 700;
  color: #555;
`;
const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;
const Ghost = styled.button`
  height: 36px;
  border-radius: 8px;
  border: 1px solid #d9dbe3;
  background: #fff;
  font-weight: 800;
`;
const Primary = styled.button`
  height: 36px;
  border-radius: 8px;
  border: 0;
  background: #487FC3;
  color: #fff;
  font-weight: 800;
`;
