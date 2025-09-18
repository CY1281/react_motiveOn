// src/components/Approval/ApprovalComposePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import OrgPickerBottomSheet from "./OrgPickerBottomSheet";

/* ================== compact tokens (상세 페이지와 동일 컨벤션) ================== */
const H = 30;      // 필드 높이
const FONT = 13;   // 폰트
const GAP = 12;    // 기본 간격
const PADX = 12;   // 좌우 패딩

/* ================= helpers ================= */
const GlobalFix = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; overflow: hidden; -webkit-text-size-adjust: 100%; } /* 바깥 스크롤 금지 */
`;

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

/* 상단 헤더 높이 측정 훅 (첫 매치 요소 사용) */
function useTopOffset(selectors = ["#appHeader", "#app-header", ".app-header", "header"]) {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const el =
      selectors.map((s) => document.querySelector(s)).find(Boolean) || null;
    if (!el) return;

    const update = () => setTop(el.getBoundingClientRect().height || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selectors.join("|")]);
  return top;
}

/* ================= page ================= */
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
  const [assignee, setAssignee] = useState(null);
  const [refs, setRefs] = useState([]);
  const [dueDate, setDueDate] = useState(todayStr());
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const [orgModal, setOrgModal] = useState(null); // null | "assignee" | "refs"

  // 헤더 높이 측정 → 카드 top 오프셋에 반영
  const topOffset = useTopOffset();

  // 파일 입력
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
    due: dueDate,
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
      <GlobalFix />

      {/* ===== 화면 고정 컨테이너 (카드 밖 스크롤 금지) ===== */}
      <Viewport style={{ top: topOffset }}>
        <Card>
          {/* 헤더 (상세 페이지와 동일한 여백 규칙) */}
          <Header>
            <Title>
              신규 결재 작성 <Small>({sformno})</Small>
            </Title>
          </Header>

          {/* 스크롤 영역 (카드 내부만 스크롤) */}
          <ScrollArea>
            <Row>
              <Label>제목 :</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요."
              />
            </Row>

            <Row>
              <Label>요청자</Label>
              <Inline>
                <Read value={currentUserName} readOnly />
                <Badge $active={emergency} onClick={() => setEmergency((v) => !v)}>
                  긴급
                </Badge>
              </Inline>
            </Row>

            <Row>
              <Label>
                담당자 <Req>*</Req>
              </Label>
              <Picker type="button" onClick={() => setOrgModal("assignee")}>
                <span className="text">
                  {assignee
                    ? `${assignee.name}${assignee.position ? ` (${assignee.position})` : ""}`
                    : "담당자를 선택해 주세요."}
                </span>
                <span className="chev">▾</span>
              </Picker>
            </Row>

            <Row>
              <Label>참조자</Label>
              <Picker type="button" onClick={() => setOrgModal("refs")}>
                <span className="text">
                  {refs.length ? refs.map((r) => r.name).join(", ") : "참조자를 선택해 주세요."}
                </span>
                <span className="chev">▾</span>
              </Picker>
            </Row>

            <Row>
              <Label>기한</Label>
              <DateInput
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Row>

            <Row>
              <Label>내용</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력해 주세요."
              />
            </Row>

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
          </ScrollArea>

          {/* 하단 고정 액션 (상세 페이지와 동일한 패딩/처리) */}
          <Footer>
            <Actions>
              <Ghost onClick={handleTemp}>임시저장</Ghost>
              <Primary onClick={handleSubmit}>결재요청</Primary>
            </Actions>
          </Footer>
        </Card>
      </Viewport>

      {/* ===== BottomSheet (조직도) ===== */}
      <OrgPickerBottomSheet
        isOpen={orgModal === "assignee"}
        onClose={() => setOrgModal(null)}
        multiple={false}
        initial={assignee ? [assignee] : []}
        onApply={(list) => setAssignee(list?.[0] || null)}
        title="조직도 (담당자 선택)"
      />
      <OrgPickerBottomSheet
        isOpen={orgModal === "refs"}
        onClose={() => setOrgModal(null)}
        multiple
        initial={refs}
        onApply={(list) => setRefs(Array.isArray(list) ? list : [])}
        title="조직도 (참조자 선택)"
      />
    </>
  );
}

/* ================= styled ================= */

/* 바깥 스크롤 금지 + 헤더 높이만큼 top 오프셋 */
const Viewport = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  /* top은 인라인 style로 주입 (헤더 높이) */
  padding: ${GAP}px max(8px, env(safe-area-inset-left))
           calc(${GAP}px + env(safe-area-inset-bottom))
           max(8px, env(safe-area-inset-right));
  display: grid;
  place-items: center;          /* 상세 페이지와 동일 배경 */
`;

/* 카드: Viewport 영역(헤더~하단) 꽉 채움 + 내부 3단 레이아웃 */
const Card = styled.div`
  width: 100%;
  max-width: 680px;
  height: 100%;               /* ✅ Viewport 높이를 그대로 사용 */
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);

  display: grid;
  grid-template-rows: auto 1fr auto;  /* 헤더 / 스크롤영역 / 푸터 */
  overflow: hidden;                   /* 카드 밖으로 넘치지 않게 */
`;

const Header = styled.div`
  padding: ${GAP}px ${PADX}px 0;      /* 상세 페이지와 동일 패딩 */
`;
const Title = styled.h2`
  font-size: 16px;
  font-weight: 800;
  margin: 4px 0 12px;
  color: #2b2f3a;
  word-break: keep-all;
`;
const Small = styled.small`
  font-size: 12px;
  font-weight: 600;
  color: #8a94a6;
  margin-left: 6px;
`;

/* 카드 내부 스크롤 영역 */
const ScrollArea = styled.div`
  min-height: 0;                       /* grid 내부 스크롤 허용 */
  overflow: auto;                      /* 카드 내부만 스크롤 */
  padding: 0 ${PADX}px ${PADX}px;      /* 상세 페이지와 동일 패딩 */

  /* 스크롤바 스타일도 상세 페이지와 동일 */
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,.25) transparent;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.22);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
`;

const Row = styled.div` margin-bottom: ${GAP}px; `;
const Label = styled.div`
  font-size: 12px; color: #333; font-weight: 700; margin-bottom: 6px;
`;
const Req = styled.span` color: #d35454; margin-left: 2px; `;
const Inline = styled.div` display: flex; align-items: center; gap: 8px; `;

/* === 공통 높이 30px / 폰트 13px === */
const Input = styled.input`
  width: 100%; height: ${H}px; padding: 6px 10px;
  border: 1px solid #e1e5ef; border-radius: 6px;
  font-size: ${FONT}px; line-height: 18px; min-width: 0;
`;
const DateInput = styled(Input).attrs({ type: "date" })``;

const Read = styled.input.attrs({ type: "text", readOnly: true })`
  width: 100%; height: ${H}px; padding: 6px 10px;
  border: 1px solid #e1e5ef; border-radius: 6px;
  background: #f7f8fb; font-size: ${FONT}px; color: #333; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
const Badge = styled.button`
  flex: 0 0 auto; height: 24px; padding: 0 10px; border-radius: 999px;
  border: 1px solid #d9dbe3;
  background: ${({ $active }) => ($active ? "#ffecec" : "#f2f3f7")};
  color: ${({ $active }) => ($active ? "#b01818" : "#666")};
  font-size: 12px; font-weight: 800; cursor: pointer;
`;
const Picker = styled.button`
  width: 100%; height: ${H}px; padding: 6px 10px;
  border: 1px solid #e1e5ef; border-radius: 6px; background: #fff;
  text-align: left; font-size: ${FONT}px;
  display: flex; align-items: center; justify-content: space-between; min-width: 0;
  .text{ flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#6f7892; }
  .chev { color:#98a0b3; margin-left:8px; flex:0 0 auto; }
`;
const Textarea = styled.textarea`
  width: 100%; min-height: 160px; padding: 10px 12px;
  resize: vertical; border: 1px solid #e1e5ef; border-radius: 6px;
  font-size: ${FONT}px; line-height: 1.5; outline: none; word-break: break-word;
`;
const FileLine = styled.div`
  display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center;
`;
const FileBtn = styled.button`
  height: ${H}px; padding: 0 10px; border-radius: 6px;
  border: 1px solid #d9dbe3; background: #f2f3f7;
  font-size: 12px; font-weight: 700; color: #555;
`;

/* 카드 내 하단 고정 영역 (상세 페이지와 동일 처리) */
const Footer = styled.div`
  border-top: 1px solid #e1e5ef;
  padding: ${GAP - 2}px ${PADX}px calc(${GAP - 2}px + env(safe-area-inset-bottom));
  background: #fff;
`;
const Actions = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
`;
const Ghost = styled.button`
  height: ${H}px; border-radius: 8px; border: 1px solid #d9dbe3;
  background: #fff; font-weight: 800; font-size: ${FONT}px;
`;
const Primary = styled.button`
  height: ${H}px; border-radius: 8px; border: 0;
  background: #487FC3; color: #fff; font-weight: 800; font-size: ${FONT}px;
`;