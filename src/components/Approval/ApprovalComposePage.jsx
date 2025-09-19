// src/components/Approval/ApprovalComposePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import OrgPickerBottomSheet from "./OrgPickerBottomSheet";
import { useUserStore } from "../../store/userStore"; // ✅ Zustand 스토어 사용

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

/* ====== CSRF & 네트워크 유틸 ====== */
function escapeRegex(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + escapeRegex(name) + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function getCsrfToken() {
  return (
    document.querySelector('meta[name="_csrf"]')?.content ||
    document.querySelector('meta[name="csrf-token"]')?.content ||
    getCookie("XSRF-TOKEN") ||
    null
  );
}
function buildCommonHeaders() {
  const token = getCsrfToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(token ? { "X-CSRF-TOKEN": token, "X-XSRF-TOKEN": token } : {}),
  };
}
function looksLikeLoginRedirect(res, bodyText = "") {
  const url = (res.url || "").toLowerCase();
  return (
    res.status === 401 ||
    res.redirected ||
    url.includes("/login") ||
    url.includes("signin") ||
    /<form[^>]+action=.*login/i.test(bodyText)
  );
}
function tryParseLooseJSON(text = "") {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}
async function parseResponse(res) {
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  let text = "";
  try { text = await res.text(); } catch {}
  if (ct.includes("application/json")) {
    const data = tryParseLooseJSON(text);
    if (data && typeof data === "object") {
      const ok = !!(data.ok ?? data.success ?? true);
      const signNo = data.signNo ?? data.SIGNNO ?? data.signno ?? null;
      const message = data.message ?? data.msg ?? "";
      return { ok, signNo, message, _raw: data };
    }
    return { ok: false, signNo: null, message: "서버가 JSON을 반환하지 않았습니다.", _raw: null };
  }
  if (looksLikeLoginRedirect(res, text) || ct.includes("text/html") || /<html|<body/i.test(text)) {
    return { ok: false, signNo: null, message: "로그인 세션이 만료되었거나 JSON 응답이 아닙니다.", _raw: null };
  }
  if (res.ok && text.trim().length === 0) {
    return { ok: true, signNo: null, message: "" };
  }
  return { ok: res.ok, signNo: null, message: text || `HTTP ${res.status}`, _raw: null };
}
async function postJsonWithFallback(urls, payload) {
  const headers = buildCommonHeaders();
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const parsed = await parseResponse(res);
      if (!parsed.ok && (res.status === 404 || /JSON 응답/.test(parsed.message))) continue;
      return parsed;
    } catch {}
  }
  return { ok: false, signNo: null, message: "서버와 통신하지 못했습니다." };
}

/* ====== ENO 추출 유틸 ====== */
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
  Array.isArray(arr)
    ? arr.map(pickEno).filter((n) => Number.isFinite(n))
    : [];

/* ================= page ================= */
export default function ApprovalComposePage({
  currentUserName = "-",
  currentUserEno = null,   // (옵션) 프롭스로 들어오면 fallback
  onTempSave,
  onSubmitDraft,
}) {
  const nav = useNavigate();
  const q = useQuery();
  const sformno = q.get("sformno") || "신규양식";

  // ✅ Zustand 유저 스토어 사용
  const { user, isLoggedIn } = useUserStore();

  // user가 숫자(ENO) 또는 객체일 수 있으니 안전 파싱
  const storeEno = useMemo(() => {
    if (user == null) return null;
    const maybe = typeof user === "object"
      ? (user.eno ?? user.empNo ?? user.EMPNO ?? user.ENO ?? user.id)
      : user;
    const n = Number(String(maybe));
    return Number.isFinite(n) ? n : null;
  }, [user]);

  const storeName = useMemo(() => {
    if (typeof user === "object" && user) {
      return user.name ?? user.empName ?? user.EMP_NAME ?? null;
    }
    return null;
  }, [user]);

  const storeDeptName = useMemo(() => {
    if (typeof user === "object" && user) {
      return user.deptName ?? user.DEPTNAME ?? user.dept ?? user.DNAME ?? null;
    }
    return null;
  }, [user]);

  // 화면 바인딩용 상태
  const [loginEmp, setLoginEmp] = useState({
    eno: storeEno ?? (Number.isFinite(+currentUserEno) ? +currentUserEno : null),
    name: storeName ?? currentUserName ?? null,
    deptName: storeDeptName ?? null,
  });

  // 스토어/프롭스 변화에 동기화
  useEffect(() => {
    setLoginEmp((prev) => ({
      eno: storeEno ?? (Number.isFinite(+currentUserEno) ? +currentUserEno : prev.eno ?? null),
      name: storeName ?? currentUserName ?? prev.name ?? null,
      deptName: storeDeptName ?? prev.deptName ?? null,
    }));
  }, [storeEno, storeName, storeDeptName, currentUserEno, currentUserName]);

  // 나머지 UI 상태
  const [title, setTitle] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [assignee, setAssignee] = useState(null);
  const [refs, setRefs] = useState([]);
  const [dueDate, setDueDate] = useState(todayStr());
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const [orgModal, setOrgModal] = useState(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const topOffset = useTopOffset();

  const fileInputRef = useRef(null);
  const onFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);
  };

  // sformno로 폼 메타 로딩 (formName 표시)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sformno || sformno === "신규양식") return;
      const urls = [
        `/api/approval/forms.item.json?sformno=${encodeURIComponent(sformno)}`,
        `/approval/forms.item.json?sformno=${encodeURIComponent(sformno)}`
      ];
      for (const u of urls) {
        try {
          const res = await fetch(u, { credentials: "include", headers: { Accept: "application/json" } });
          const parsed = await parseResponse(res);
          if (parsed?.ok && parsed._raw) {
            const f = parsed._raw.form || parsed._raw.data || parsed._raw;
            const name = f?.formName || f?.FORMNAME || f?.name || "";
            if (alive) setFormName(String(name || "").trim());
            break;
          }
        } catch {}
      }
    })();
    return () => { alive = false; };
  }, [sformno]);

  /* ===== payload 구성: approvers/refs + 기안자 정보 포함 ===== */
  const effUserEno  = loginEmp?.eno ?? null;
  const effUserName = (loginEmp?.name ?? (effUserEno != null ? `ENO ${effUserEno}` : "")).trim();

  const buildPayload = () => {
    const s = (sformno || "").trim();
    const approverEnos = assignee ? [pickEno(assignee)].filter(Boolean) : [];
    const refEnos = toEnoArray(refs);

    // 백엔드 호환: 결재선/참조자 객체 배열
    const signLines = approverEnos.map((eno, idx) => ({
      eno, order: idx + 1, type: "APPROVER",
    }));
    const viewerList = refEnos.map((eno) => ({ eno }));

    const payload = {
      title: (title || "").trim(),
      content: content || "",
      signcontent: (content || "").trim(),
      emergency: emergency ? 1 : 0,

      // 결재선/참조자(기존 호환 + 신규 구조)
      approvers: approverEnos,
      refs: refEnos,
      signLines,
      viewerList,

      // 호환 alias
      approverEnos: approverEnos,
      refEnos: refEnos,

      // 기안자 표시(서버는 세션 사용하더라도 함께 전달)
      drafterEno: Number.isFinite(Number(effUserEno)) ? Number(effUserEno) : null,
      // drafterName은 선택 (없어도 서버가 세션으로 식별 가능)
      ...(effUserName ? { drafterName: effUserName } : {}),

      // (선택) 디버그용
      assignee: assignee ? { eno: pickEno(assignee), name: assignee.name } : null,
      refNames: refs.map(r => r?.name).filter(Boolean),
    };

    if (s) {
      payload.sformno = s;
      payload.sformNo = s;
      payload.formNo  = s;
    }
    // payload.dueDate = dueDate; // 필요 시 추가
    return payload;
  };

  const defaultTempSave = async (payload) =>
    postJsonWithFallback(
      ["/api/approval/temp-save", "/approval/temp-save"],
      payload
    );

  const defaultSubmit = async (payload) =>
    postJsonWithFallback(
      ["/api/approval/save", "/approval/save"],
      payload
    );

  const handleTemp = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      console.log("[compose] temp payload:", {
        approver: pickEno(assignee),
        refs: toEnoArray(refs),
        drafterEno: payload.drafterEno,
      });

      let result;
      try {
        const doSave = typeof onTempSave === "function" ? onTempSave : defaultTempSave;
        result = await doSave(payload);
      } catch (e) {
        console.error("[compose] custom temp-save failed, fallback:", e);
        result = await defaultTempSave(payload);
      }

      alert(result?.ok ? "임시저장 되었습니다." : (result?.message || "임시저장 실패"));
    } catch (e) {
      alert(`임시저장 중 오류가 발생했습니다.\n${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn || !effUserEno) {
      return alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
    }
    if (!title.trim()) return alert("제목을 입력해 주세요.");
    if (!assignee) return alert("담당자를 선택해 주세요.");
    const eno = pickEno(assignee);
    if (!eno) return alert("담당자 정보(사번/ENO)를 가져오지 못했습니다. 다시 선택해 주세요.");

    if (files?.length) {
      console.warn("첨부파일은 현재 JSON 저장에서는 전송되지 않습니다.");
    }

    if (saving) return;
    setSaving(true);
    try {
      const payload = buildPayload();

      console.log("[compose] submitting:", {
        approver: eno,
        refs: toEnoArray(refs),
        drafterEno: payload.drafterEno,
        sformno,
        title,
      });

      let result;
      try {
        if (typeof onSubmitDraft === "function") {
          result = await onSubmitDraft(payload);
        } else {
          result = await defaultSubmit(payload);
        }
      } catch (e) {
        console.error("[compose] custom submit failed, fallback to default:", e);
        try {
          result = await defaultSubmit(payload);
        } catch (e2) {
          console.error("[compose] default submit failed:", e2);
          alert(`결재요청 실패(네트워크/예외): ${e2?.message || e2 || "알 수 없는 오류"}`);
          return;
        }
      }

      if (result?.ok) {
        const id = result?.signNo;
        if (id) {
          nav(`/approval/detail/${encodeURIComponent(id)}`, { replace: true });
        } else {
          nav("/approval", { replace: true });
        }
      } else {
        alert(result?.message || "결재요청 실패");
      }
    } catch (e) {
      console.error("[compose] submit unexpected error:", e);
      alert(`결재요청 중 오류가 발생했습니다.\n${e?.message || e}`);
    } finally {
      setSaving(false);
    }
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
                    (loginEmp?.name
                      ? loginEmp.name
                      : (loginEmp?.eno != null ? `ENO ${loginEmp.eno}` : "")
                    ) + (loginEmp?.deptName ? ` (${loginEmp.deptName})` : "")
                  }
                  readOnly
                />
                <Badge $active={emergency} onClick={() => setEmergency(v => !v)}>긴급</Badge>
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

          <Footer>
            <Actions>
              <Ghost onClick={handleTemp} disabled={saving}>임시저장</Ghost>
              <Primary onClick={handleSubmit} disabled={saving}>결재요청</Primary>
            </Actions>
          </Footer>
        </Card>
      </Viewport>

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
