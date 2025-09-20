// src/components/Approval/ApprovalComposePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import OrgTree from "../common/OrgTree2";                 // ✅ 그대로 사용
import { useUserStore } from "../../store/userStore";
import { saveApproval as apiSaveApproval, tempSaveApproval as apiTempSaveApproval } from "../motiveOn/api"; // ✅ axios API 사용

/* ================== compact tokens ================== */
const H = 30;
const FONT = 13;
const GAP = 12;
const PADX = 12;

/* ================= helpers ================= */
const GlobalFix = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; overflow: hidden; -webkit-text-size-adjust: 100%; }
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

function useTopOffset(selectors = ["#appHeader", "#app-header", ".app-header", "header"]) {
  const [top, setTop] = useState(0);
  useEffect(() => {
    const el = selectors.map((s) => document.querySelector(s)).find(Boolean) || null;
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

/* ====== ENO 유틸 ====== */
const pickEno = (p) => {
  if (!p) return null;
  const cand =
    p.value ?? p.eno ?? p.ENO ??
    p.empNo ?? p.empno ?? p.EMPNO ?? p.EMP_NO ??
    p.userId ?? p.id ?? p.no;
  if (cand == null) return null;
  const n = Number(String(cand).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const toEnoArray = (arr) =>
  Array.isArray(arr) ? arr.map(pickEno).filter((n) => Number.isFinite(n)) : [];

/* ====== userStore → 표시용 정보 ====== */
function useEffectiveUser() {
  const { user } = useUserStore();
  return useMemo(() => {
    if (!user) return { name: "", eno: null, deptName: null, dno: null };
    if (typeof user === "number" || typeof user === "string") {
      const eno = Number(String(user).replace(/[^\d]/g, ""));
      return { name: "", eno: Number.isFinite(eno) ? eno : null, deptName: null, dno: null };
    }
    const eno = user?.eno ?? user?.ENO ?? null;
    const dno = user?.dno ?? user?.DNO ?? null;
    return {
      name: user?.name ?? user?.NAME ?? "",
      eno: eno != null ? Number(String(eno).replace(/[^\d]/g, "")) : null,
      deptName: user?.deptName ?? user?.DEPTNAME ?? null,
      dno: dno != null ? Number(String(dno).replace(/[^\d]/g, "")) : null,
    };
  }, [user]);
}

/* ================= page ================= */
export default function ApprovalComposePage() {
  const nav = useNavigate();
  const q = useQuery();
  const sformno = q.get("sformno") || "신규양식";

  const effUser = useEffectiveUser();

  const [title, setTitle] = useState("");
  const [emergency, setEmergency] = useState(false);

  // 최종 확정 값
  const [assignee, setAssignee] = useState(null); // 단일
  const [refs, setRefs] = useState([]);           // 다중

  // 모달 임시선택
  const [assigneeTemp, setAssigneeTemp] = useState([]); // [{value,label,name,eno}]
  const [refsTemp, setRefsTemp] = useState([]);

  const [dueDate, setDueDate] = useState(todayStr());
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const [showOrgAssignee, setShowOrgAssignee] = useState(false);
  const [showOrgRefs, setShowOrgRefs] = useState(false);

  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const topOffset = useTopOffset();

  const fileInputRef = useRef(null);
  const onFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);
  };

  // 양식 이름 로딩(간단)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sformno || sformno === "신규양식") return;
      try {
        const res = await fetch(`/api/approval/forms.item.json?sformno=${encodeURIComponent(sformno)}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!alive) return;
        const data = await res.json().catch(() => ({}));
        const f = data.form || data.data || data;
        const name = f?.formName || f?.FORMNAME || f?.name || "";
        setFormName(String(name || "").trim());
      } catch {}
    })();
    return () => { alive = false; };
  }, [sformno]);

  /* ===== payload 구성 ===== */
  const buildPayload = (isTemp = false) => {
  const approverEnos = assignee ? [pickEno(assignee)].filter(Boolean) : [];
  const refEnos      = toEnoArray(refs);

    const vo = {
    eno: effUser,
    sformno: String(sformno || ""),
    title: (title || "").trim(),
    signcontent: (content || "").trim(),
    emergency: emergency ? 1 : 0,
    tempsave: isTemp ? 1 : 0,
    approvers: approverEnos,
    refs: refEnos,
  };


  return {
    /* --- SIGNDOC (insertSignDoc/insertTempSave) --- */
    eno:     effUser.eno,                 // ★ 기안자 ENO
    dno:     effUser.dno,                 // ★ 기안자 DNO
    sformno: String(sformno || ""),       // ★ 양식번호 (문자/숫자 모두 문자열로)
    title:   (title || "").trim(),
    signcontent: (content || "").trim(),
    emergency: emergency ? 1 : 0,
    // 옵션(넣어도 무해): ddate/edate/tempsave/state
    tempsave: isTemp ? 1 : 0,             // 서버가 무시해도 OK

    /* --- SIGNLINE / SIGNREF (insertSignLines / insertSignRefs) --- */
    approvers: approverEnos,              // ★ ENO 숫자 배열
    refs:      refEnos,                   // ★ ENO 숫자 배열
  };
};

  /* ===== 저장 호출: axios API 사용 ===== */
  const handleTemp = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const vo = buildPayload();
      console.log("[compose] TEMP payload →", vo);
      const { data } = await apiTempSaveApproval(vo); // ✅ axios로 호출
      const ok = data?.ok ?? true;
      alert(ok ? "임시저장 되었습니다." : (data?.message || "임시저장 실패"));
    } catch (e) {
      console.error(e);
      alert(`임시저장 중 오류가 발생했습니다.\n${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
  if (!title.trim()) return alert("제목을 입력해 주세요.");
  if (!assignee)     return alert("담당자를 선택해 주세요.");
  if (!pickEno(assignee)) return alert("담당자 ENO를 확인해 주세요.");

  if (saving) return;
  setSaving(true);
  try {
    const vo = buildPayload(false); // ★ 본저장
    console.log("[SAVE] payload", vo);
    const { data } = await apiSaveApproval(vo); // axios: /api/approval/save
    const ok = data?.ok ?? true;
    const signNo = data?.signNo ?? data?.SIGNNO;
    if (ok) {
      alert("결재요청이 등록되었습니다.");
      if (signNo) nav(`/approval/detail/${encodeURIComponent(signNo)}`, { replace: true });
      else nav("/approval", { replace: true });
    } else {
      alert(data?.message || "결재요청 실패");
    }
  } catch (e) {
    console.error(e);
    alert(`결재요청 오류: ${e?.message || e}`);
  } finally {
    setSaving(false);
  }
};

  /* ===== 모달 오픈 시 현재 값 동기화 ===== */
  const openAssigneeModal = () => {
    setAssigneeTemp(assignee ? [assignee] : []);
    setShowOrgAssignee(true);
  };
  const openRefsModal = () => {
    setRefsTemp(refs);
    setShowOrgRefs(true);
  };

  /* ===== OrgTree2를 수정하지 않고 DOM 클릭 가로채기 ===== */
  const parseNodeFromClick = (evtTarget) => {
    // 앵커 우선
    const anchor = evtTarget.closest?.("a.jstree-anchor");
    if (anchor) {
      const nodeId = (anchor.id || "").replace(/_anchor$/, ""); // e-xxxx_anchor → e-xxxx
      const text = anchor.textContent?.trim() || "";
      const isEmployee = /^e-\d+$/i.test(nodeId);
      const eno = isEmployee ? Number(nodeId.replace(/\D/g, "")) : null;
      return { id: nodeId, text, isEmployee, eno };
    }
    // li 폴백
    const li = evtTarget.closest?.("li.jstree-node");
    if (li) {
      const nodeId = li.id || "";
      const text = li.querySelector("a.jstree-anchor")?.textContent?.trim() || "";
      const isEmployee = /^e-\d+$/i.test(nodeId);
      const eno = isEmployee ? Number(nodeId.replace(/\D/g, "")) : null;
      return { id: nodeId, text, isEmployee, eno };
    }
    return null;
  };

  const onTreeClickAssignee = (e) => {
    e.preventDefault?.();
    e.stopPropagation?.();
    const info = parseNodeFromClick(e.target);
    if (!info || !info.isEmployee || !Number.isFinite(info.eno)) return;
    const obj = { value: info.eno, label: info.text, name: info.text, eno: info.eno };
    setAssigneeTemp((prev) => (prev.some((p) => p.value === obj.value) ? [] : [obj]));
  };

  const onTreeClickRefs = (e) => {
    e.preventDefault?.();
    e.stopPropagation?.();
    const info = parseNodeFromClick(e.target);
    if (!info || !info.isEmployee || !Number.isFinite(info.eno)) return;
    const obj = { value: info.eno, label: info.text, name: info.text, eno: info.eno };
    setRefsTemp((prev) => (prev.some((p) => p.value === obj.value) ? prev.filter((p) => p.value !== obj.value) : [...prev, obj]));
  };

  return (
    <>
      <GlobalFix />

      <Viewport style={{ top: topOffset }}>
        <Card>
          <Header>
            <Title>
              신규 결재 작성 <Small>({formName || sformno})</Small>
            </Title>
          </Header>

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
              <Label>기안자</Label>
              <Inline>
                <Read
                  value={
                    (effUser.name
                      ? effUser.name + (effUser.deptName ? ` (${effUser.deptName})` : "")
                      : "") || ""
                  }
                  readOnly
                />
                <Badge $active={emergency} onClick={() => setEmergency((v) => !v)}>
                  긴급
                </Badge>
              </Inline>
            </Row>

            <Row>
              <Label>
                담당자 <Req>*</Req>
              </Label>
              <Picker type="button" onClick={openAssigneeModal}>
                <span className="text">
                  {assignee ? `${assignee.name || assignee.label || ""}` : "담당자를 선택해 주세요."}
                </span>
                <span className="chev">▾</span>
              </Picker>
            </Row>

            <Row>
              <Label>참조자</Label>
              <Picker type="button" onClick={openRefsModal}>
                <span className="text">
                  {refs.length ? refs.map((r) => r.name || r.label).join(", ") : "참조자를 선택해 주세요."}
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
                <Read readOnly value={files.length ? `${files.length}개 선택됨` : ""} placeholder="" />
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

          <Footer>
            <Actions>
              <Ghost onClick={handleTemp} disabled={saving}>임시저장</Ghost>
              <Primary onClick={handleSubmit} disabled={saving}>결재요청</Primary>
            </Actions>
          </Footer>
        </Card>
      </Viewport>

      {/* 담당자 선택(단일) */}
      {showOrgAssignee && (
        <ModalOverlay onClick={() => setShowOrgAssignee(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, textAlign: "center" }}>조직도 (담당자 선택)</h3>
            <TreeWrap onClick={onTreeClickAssignee}>
              <OrgTree />
            </TreeWrap>
            <SelHint>
              {assigneeTemp.length
                ? `선택됨: ${assigneeTemp[0].name || assigneeTemp[0].label}`
                : "선택된 담당자가 없습니다."}
            </SelHint>
            <ModalActions>
              <BtnGhost onClick={() => setShowOrgAssignee(false)}>취소</BtnGhost>
              <BtnPrimary
                onClick={() => {
                  if (!assigneeTemp.length) { alert("담당자를 선택해 주세요."); return; }
                  const x = assigneeTemp[assigneeTemp.length - 1];
                  setAssignee({ ...x, name: x.name || x.label });
                  setShowOrgAssignee(false);
                }}
              >
                확인
              </BtnPrimary>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* 참조자 선택(다중) */}
      {showOrgRefs && (
        <ModalOverlay onClick={() => setShowOrgRefs(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, textAlign: "center" }}>조직도 (참조자 선택)</h3>
            <TreeWrap onClick={onTreeClickRefs}>
              <OrgTree />
            </TreeWrap>
            <SelHint>
              {refsTemp.length
                ? `선택됨: ${refsTemp.map((x) => x.name || x.label).join(", ")}`
                : "선택된 참조자가 없습니다."}
            </SelHint>
            <ModalActions>
              <BtnGhost onClick={() => setShowOrgRefs(false)}>취소</BtnGhost>
              <BtnPrimary
                onClick={() => {
                  setRefs(refsTemp.map((x) => ({ ...x, name: x.name || x.label })));
                  setShowOrgRefs(false);
                }}
              >
                확인
              </BtnPrimary>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </>
  );
}

/* ================= styled ================= */
const Viewport = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  padding: ${GAP}px max(8px, env(safe-area-inset-left))
           calc(${GAP}px + env(safe-area-inset-bottom))
           max(8px, env(safe-area-inset-right));
  display: grid;
  place-items: center;
`;
const Card = styled.div`
  width: 100%;
  max-width: 680px;
  height: 100%;
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
`;
const Header = styled.div` padding: ${GAP}px ${PADX}px 0; `;
const Title = styled.h2`
  font-size: 16px; font-weight: 800; margin: 4px 0 12px; color: #2b2f3a; word-break: keep-all;
`;
const Small = styled.small` font-size: 12px; font-weight: 600; color: #8a94a6; margin-left: 6px; `;
const ScrollArea = styled.div`
  min-height: 0; overflow: auto; padding: 0 ${PADX}px ${PADX}px;
  scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.25) transparent;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,.22); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
`;
const Row = styled.div` margin-bottom: ${GAP}px; `;
const Label = styled.div` font-size: 12px; color: #333; font-weight: 700; margin-bottom: 6px; `;
const Req = styled.span` color: #d35454; margin-left: 2px; `;
const Inline = styled.div` display: flex; align-items: center; gap: 8px; `;
const Input = styled.input`
  width: 100%; height: ${H}px; padding: 6px 10px;
  border: 1px solid #e1e5ef; border-radius: 6px; font-size: ${FONT}px; line-height: 18px; min-width: 0;
`;
const DateInput = styled(Input).attrs({ type: "date" })``;
const Read = styled.input.attrs({ type: "text", readOnly: true })`
  width: 100%; height: ${H}px; padding: 6px 10px;
  border: 1px solid #e1e5ef; border-radius: 6px; background: #f7f8fb; font-size: ${FONT}px; color: #333; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
const Badge = styled.button`
  flex: 0 0 auto; height: 24px; padding: 0 10px; border-radius: 999px;
  border: 1px solid #d9dbe3; background: ${({ $active }) => ($active ? "#ffecec" : "#f2f3f7")};
  color: ${({ $active }) => ($active ? "#b01818" : "#666")}; font-size: 12px; font-weight: 800; cursor: pointer;
`;
const Picker = styled.button`
  width: 100%; height: ${H}px; padding: 6px 10px;
  border: 1px solid #e1e5ef; border-radius: 6px; background: #fff; text-align: left; font-size: ${FONT}px;
  display: flex; align-items: center; justify-content: space-between; min-width: 0;
  .text{ flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#6f7892; }
  .chev { color:#98a0b3; margin-left:8px; flex:0 0 auto; }
`;
const Textarea = styled.textarea`
  width: 100%; min-height: 160px; padding: 10px 12px; resize: vertical; border: 1px solid #e1e5ef; border-radius: 6px;
  font-size: ${FONT}px; line-height: 1.5; outline: none; word-break: break-word;
`;
const FileLine = styled.div` display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; `;
const FileBtn = styled.button`
  height: ${H}px; padding: 0 10px; border-radius: 6px; border: 1px solid #d9dbe3; background: #f2f3f7; font-size: 12px; font-weight: 700; color: #555;
`;
const Footer = styled.div`
  border-top: 1px solid #e1e5ef; padding: ${GAP - 2}px ${PADX}px calc(${GAP - 2}px + env(safe-area-inset-bottom)); background: #fff;
`;
const Actions = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 8px; `;
const Ghost = styled.button` height: ${H}px; border-radius: 8px; border: 1px solid #d9dbe3; background: #fff; font-weight: 800; font-size: ${FONT}px; `;
const Primary = styled.button` height: ${H}px; border-radius: 8px; border: 0; background: #487FC3; color: #fff; font-weight: 800; font-size: ${FONT}px; `;

/* ====== 모달 & 트리 래퍼 ====== */
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;
const ModalCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 80%;
  max-width: 560px;
`;
const ModalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
`;
const BtnGhost = styled.button`
  height: 48px;
  border-radius: 10px;
  border: 1px solid #d9dbe3;
  background: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
`;
const BtnPrimary = styled.button`
  height: 48px;
  border-radius: 10px;
  border: 0;
  background: #487FC3;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
`;
const SelHint = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #6f7892;
`;
const TreeWrap = styled.div`
  max-height: min(60vh, 520px);
  overflow: auto;
  border: 1px solid #eaecef;
  border-radius: 8px;
  padding: 8px;
`;
