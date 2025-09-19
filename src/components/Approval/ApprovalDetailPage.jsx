// src/components/Approval/ApprovalDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { getApprovalDetail } from "../motiveOn/api";

/* ===== tokens ===== */
const H = 30;
const FONT = 13;
const GAP = 10;
const PADX = 12;
const OUTPAD = 12;

/* ===== CSRF & 네트워크 유틸 (Compose와 동일 컨벤션) ===== */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
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
function buildJsonHeaders() {
  const t = getCsrfToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(t ? { "X-CSRF-TOKEN": t, "X-XSRF-TOKEN": t } : {}),
  };
}
function buildFormHeaders() {
  const t = getCsrfToken();
  return {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    ...(t ? { "X-CSRF-TOKEN": t, "X-XSRF-TOKEN": t } : {}),
  };
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
    const data = tryParseLooseJSON(text) || {};
    const ok = !!(data.ok ?? data.success ?? true);
    const signNo = data.signNo ?? data.SIGNNO ?? null;
    const message = data.message ?? data.msg ?? "";
    return { ok, signNo, message, _raw: data };
  }
  if (res.redirected || res.status === 302 || res.status === 303) {
    return { ok: true, signNo: null, message: "" };
  }
  if (ct.includes("text/html") || /<html|<body/i.test(text)) {
    return { ok: false, signNo: null, message: "로그인 세션이 만료되었거나 JSON 응답이 아닙니다." };
  }
  return { ok: res.ok, signNo: null, message: text || `HTTP ${res.status}` };
}
async function postJsonWithFallback(urls, payload) {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: buildJsonHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const parsed = await parseResponse(res);
      if (parsed.ok || res.status !== 404) return parsed;
    } catch {}
  }
  return { ok: false, message: "요청 실패" };
}
async function postForm(url, payload) {
  try {
    const body = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => body.set(k, v ?? ""));
    const res = await fetch(url, {
      method: "POST",
      headers: buildFormHeaders(),
      credentials: "include",
      body: body.toString(),
    });
    return await parseResponse(res);
  } catch {
    return { ok: false, message: "네트워크 오류" };
  }
}

/* ====== helpers ====== */
function statusTextOf(code){switch(Number(code)){case 0:return"작성/대기";case 1:return"진행중";case 2:return"완료";case 3:return"반려";case 4:return"회수/보류";default:return"-";}}
function statusTypeOf(code){switch(Number(code)){case 1:return"progress";case 2:return"done";case 3:return"reject";case 4:return"hold";case 0:return"draft";default:return"neutral";}}
function formatDateTime(v){if(!v)return"";const d=new Date(v);if(isNaN(+d))return String(v);const yyyy=d.getFullYear();const mm=String(d.getMonth()+1).padStart(2,"0");const dd=String(d.getDate()).padStart(2,"0");const HH=String(d.getHours()).padStart(2,"0");const MM=String(d.getMinutes()).padStart(2,"0");return`${yyyy}-${mm}-${dd} ${HH}:${MM}`;}
function safe(v,fallback=""){return(v===null||v===undefined||v==="")?fallback:v;}

/* ====== component ====== */
export default function ApprovalDetailPage({
  doc: initialDoc = null,
  lines: initialLines = [],
  refs: initialRefs = [],
  headerOffset = 56,
  onList,
  onApprove,
  onReject,
}) {
  const nav = useNavigate();
  const { signNo: routeSignNo } = useParams();

  // 바깥 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  const [doc, setDoc] = useState(initialDoc);
  const [lines, setLines] = useState(initialLines);
  const [refs, setRefs] = useState(initialRefs);
  const [loading, setLoading] = useState(!initialDoc);
  const [errMsg, setErrMsg] = useState("");
  const [comment, setComment] = useState("");

  /* ---------- 응답 정규화 유틸 ---------- */
  const pick = (obj, ...keys) => keys.find((k) => obj?.[k] !== undefined);
  const asInt = (v, d = 0) => (v == null ? d : Number.isFinite(+v) ? +v : d);

  const normalizeDoc = (raw = {}) => {
    const d = raw || {};
    const signNoKey  = pick(d, "signNo", "SIGNNO", "signno", "SIGN_NO");
    const titleKey   = pick(d, "title", "TITLE");
    const drafterKey = pick(d, "drafterName", "DOC_NAME", "DOCNAME", "NAME", "EMP_NAME");
    const emKey      = pick(d, "emergency", "EMERGENCY");
    const statusKey  = pick(d, "docStatus", "DOC_STATUS", "DOCSTATUS", "STATE");
    const contentKey = pick(d, "signcontent", "SIGNCONTENT", "content", "CONTENT", "CONTENTS");
    const draftAtKey = pick(d, "draftAt", "DRAFTAT", "ddate", "DDATE", "REGDATE");
    const doneAtKey  = pick(d, "completeAt", "COMPLETEAT", "edate", "EDATE", "ENDDATE");

    let atts = d.attachments ?? d.ATTACHMENTS ?? d.files ?? d.FILES ?? d.fileList ?? d.FILELIST ?? [];
    if (!Array.isArray(atts)) atts = [];
    const attMap = atts.map((f) => ({
      name: f?.name ?? f?.filename ?? f?.FILENAME ?? f?.orgNm ?? f?.ORGNM ?? "파일",
      size: f?.size ?? f?.SIZE ?? "",
      url:  f?.url ?? f?.URL ?? f?.path ?? f?.PATH ?? undefined,
    }));

    return {
      signNo: d[signNoKey],
      title: d[titleKey],
      drafterName: d[drafterKey],
      emergency: asInt(d[emKey], 0),
      docStatus: asInt(d[statusKey], 0),
      signcontent: d[contentKey] ?? "",
      draftAt: d[draftAtKey],
      completeAt: d[doneAtKey],
      attachments: attMap,
    };
  };

  const normalizeLine = (ln = {}) => {
    const orderKey  = pick(ln, "orderSeq", "ORDERSEQ", "ORDER_SEQ", "order", "SEQ");
    const nameKey   = pick(ln, "approverName", "APPROVERNAME", "DOCNAME", "EMP_NAME", "NAME");
    const deptKey   = pick(ln, "approverDept", "APPROVERDEPT", "DEPTNAME", "DEPT_NAME", "DNAME");
    const statusKey = pick(ln, "routeStatus", "ROUTESTATUS", "ROUTE_STATUS", "STATUS");
    const atKey     = pick(ln, "actionAt", "ACTIONAT", "ACTION_AT", "ADATE");
    const enoKey    = pick(ln, "approverEno", "APPROVERENO", "ENO", "EMP_NO", "EMP_NO");
    const typeKey   = pick(ln, "type", "TYPE", "ROUTE_TYPE");

    return {
      orderSeq: ln[orderKey],
      approverName: ln[nameKey],
      approverDept: ln[deptKey],
      routeStatus: asInt(ln[statusKey], 0), // 0 대기, 1 진행, 2 승인, 3 반려 등 사내 규칙
      actionAt: ln[atKey],
      approverEno: ln[enoKey],
      type: ln[typeKey] || "APPROVER",
    };
  };

  const normalizeRef = (rf = {}) => {
    const nameKey = pick(rf, "approverName", "APPROVERNAME", "NAME", "EMP_NAME");
    const deptKey = pick(rf, "approverDept", "APPROVERDEPT", "DEPTNAME", "DEPT_NAME", "DNAME");
    return { approverName: rf[nameKey], approverDept: rf[deptKey] };
  };

  // 상세 로드
  useEffect(() => {
    let alive = true;
    const signNo = routeSignNo;
    if (!signNo) return;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");
        const res = await getApprovalDetail(signNo);
        if (!res?.data?.ok) throw new Error(res?.data?.message || "상세 조회 실패");
        if (!alive) return;

        const d  = normalizeDoc(res.data.doc ?? {});
        const ls = Array.isArray(res.data.lines) ? res.data.lines.map(normalizeLine) : [];
        const rf = Array.isArray(res.data.refs)  ? res.data.refs.map(normalizeRef)   : [];

        setDoc(d);
        setLines(ls.sort((a,b)=>Number(a.orderSeq)-Number(b.orderSeq)));
        setRefs(rf);
      } catch (e) {
        console.error("[detail] load fail:", e);
        if (!alive) return;
        setErrMsg("상세를 불러오지 못했습니다.");
        if (!initialDoc) {
          setDoc(null); setLines([]); setRefs([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSignNo]);

  const stateText = useMemo(() => statusTextOf(doc?.docStatus), [doc?.docStatus]);
  const stateType = useMemo(() => statusTypeOf(doc?.docStatus), [doc?.docStatus]);

  // ✅ 담당자: '대기(0)' 상태 결재자 → 없으면 1차 결재자
  const assignee = useMemo(() => {
    if (!Array.isArray(lines) || lines.length === 0) return null;
    const pending = lines.find((l) => Number(l.routeStatus) === 0);
    const target = pending || lines[0];
    return target ? { name: target.approverName, dept: target.approverDept } : null;
  }, [lines]);

  // 목록
  const handleList = () => {
    if (onList) return onList();
    if (window.history.length > 1) nav(-1);
    else nav("/approval/draftList", { replace: true });
  };

  // 기본 승인/반려 (JSON → 실패 시 form POST 폴백)
  const defaultAct = async ({ signNo, action, comment }) => {
    const payload = { signNo, action, comment: comment || "" };
    const res1 = await postJsonWithFallback(
      ["/api/approval/line/act", "/api/approval/line/act.json"],
      payload
    );
    if (res1.ok) return res1;
    return await postForm("/approval/line/act", payload);
  };

  const submitApprove = async () => {
    if (!doc) return;
    if (!window.confirm("승인하시겠습니까?")) return;
    try {
      const doApprove = onApprove || defaultAct;
      const r = await doApprove({ signNo: doc?.signNo, comment, action: "approve" });
      if (r?.ok) {
        alert("승인되었습니다.");
        handleList();
      } else {
        alert(r?.message || "승인 실패");
      }
    } catch {
      alert("승인 중 오류가 발생했습니다.");
    }
  };
  const submitReject = async () => {
    if (!doc) return;
    if (!window.confirm("반려하시겠습니까?")) return;
    try {
      const doReject = onReject || defaultAct;
      const r = await doReject({ signNo: doc?.signNo, comment, action: "reject" });
      if (r?.ok) {
        alert("반려되었습니다.");
        handleList();
      } else {
        alert(r?.message || "반려 실패");
      }
    } catch {
      alert("반려 중 오류가 발생했습니다.");
    }
  };

  // 결재선 뱃지/상태 텍스트
  const routeStatusText = (s) => {
    switch (Number(s)) {
      case 0: return "대기";
      case 1: return "진행";
      case 2: return "승인";
      case 3: return "반려";
      case 4: return "보류";
      default: return "-";
    }
  };
  const routeChipType = (s) => {
    switch (Number(s)) {
      case 2: return "done";
      case 3: return "reject";
      case 4: return "hold";
      case 1: return "progress";
      case 0: default: return "draft";
    }
  };

  return (
    <Wrapper style={{ top: headerOffset }}>
      <Shell>
        <Topbar>
          <TitleBar>전자결재</TitleBar>
          <div className="actions">
            <Btn $variant="ghost" onClick={handleList}>목록</Btn>
          </div>
        </Topbar>

        <ScrollArea>
          {loading ? (
            <Muted>불러오는 중…</Muted>
          ) : errMsg ? (
            <Muted>{errMsg}</Muted>
          ) : !doc ? (
            <Muted>문서를 찾을 수 없습니다.</Muted>
          ) : (
            <>
              {/* 문서 제목 */}
              <PageTitle>
                {safe(doc?.title, "-")}
                {Number(doc?.emergency) === 1 && <EmBadge>긴급</EmBadge>}
              </PageTitle>

              {/* 상태 */}
              <Row>
                <FieldLabel>상태</FieldLabel>
                <Status $type={stateType}>{stateText}</Status>
              </Row>

              {/* 메타 */}
              <Row>
                <FieldLabel>문서번호</FieldLabel>
                <FieldValue>{safe(doc?.signNo, "-")}</FieldValue>
              </Row>
              <Row>
                <FieldLabel>요청자</FieldLabel>
                <FieldValue>{safe(doc?.currentUserName, "-")}</FieldValue>
              </Row>

              {/* ✅ 담당자 */}
              <Row>
                <FieldLabel>담당자</FieldLabel>
                {assignee ? (
                  <FieldValue>
                    {assignee.name}
                    {assignee.dept ? <span className="meta"> · {assignee.dept}</span> : null}
                  </FieldValue>
                ) : (
                  <Muted>없음</Muted>
                )}
              </Row>

              <MetaGrid>
                <div>
                  <FieldLabel>기안일</FieldLabel>
                  <FieldValue>{formatDateTime(doc?.draftAt) || "-"}</FieldValue>
                </div>
                <div>
                  <FieldLabel>완료일</FieldLabel>
                  <FieldValue>{formatDateTime(doc?.completeAt) || "-"}</FieldValue>
                </div>
              </MetaGrid>

              {/* ✅ 결재선 */}
              <Row>
                <FieldLabel>결재선</FieldLabel>
                {!lines?.length ? (
                  <Muted>없음</Muted>
                ) : (
                  <RouteList>
                    {lines.map((ln, i) => (
                      <li key={`${ln.orderSeq ?? i}-${ln.approverName ?? i}`}>
                        <div className="left">
                          <span className="idx">{ln.orderSeq ?? i + 1}</span>
                          <span className="name">{ln.approverName || "-"}</span>
                          {ln.approverDept && <span className="meta"> · {ln.approverDept}</span>}
                          {ln.type && ln.type !== "APPROVER" && (
                            <span className="type">({ln.type})</span>
                          )}
                        </div>
                        <div className="right">
                          <Chip $type={routeChipType(ln.routeStatus)}>
                            {routeStatusText(ln.routeStatus)}
                          </Chip>
                          {ln.actionAt && (
                            <span className="meta dt">{formatDateTime(ln.actionAt)}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </RouteList>
                )}
              </Row>

              {/* 본문 */}
              <Row>
                <FieldLabel>내용</FieldLabel>
                <Content
                  dangerouslySetInnerHTML={{
                    __html:
                      (doc?.signcontent ?? "").trim() ||
                      `<div class="muted">본문 내용이 없습니다.</div>`,
                  }}
                />
              </Row>

              {/* ✅ 첨부 */}
              <Row>
                <FieldLabel>첨부파일</FieldLabel>
                {!doc?.attachments || doc.attachments.length === 0 ? (
                  <Muted>없음</Muted>
                ) : (
                  <List>
                    {doc.attachments.map((f, i) => (
                      <li key={i}>
                        {f.url ? (
                          <a href={f.url} target="_blank" rel="noreferrer" className="link">
                            {f.name || "파일"}
                          </a>
                        ) : (
                          <span>{f.name || "파일"}</span>
                        )}
                        {f.size ? <span className="meta"> · {f.size}</span> : null}
                      </li>
                    ))}
                  </List>
                )}
              </Row>

              {/* ✅ 참조자 */}
              <Row>
                <FieldLabel>참조자</FieldLabel>
                {!refs?.length ? (
                  <Muted>없음</Muted>
                ) : (
                  <List>
                    {refs.map((rf, i) => (
                      <li key={i}>
                        {safe(rf?.approverName, "-")}
                        {rf?.approverDept ? (
                          <span className="meta"> · {rf.approverDept}</span>
                        ) : null}
                      </li>
                    ))}
                  </List>
                )}
              </Row>
            </>
          )}
        </ScrollArea>

        <Footer>
          <FooterGrid>
            <CommentInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="결재 의견(선택)"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitApprove();
              }}
            />
            <Btn $variant="ok" onClick={submitApprove} disabled={!doc}>승인</Btn>
            <Btn $variant="danger" onClick={submitReject} disabled={!doc}>반려</Btn>
          </FooterGrid>
        </Footer>
      </Shell>
    </Wrapper>
  );
}

/* ===== styled ===== */
const Wrapper = styled.div`
  position: fixed; left: 0; right: 0; bottom: 0;
  display: grid; place-items: center;
  overflow: hidden;
  padding: ${OUTPAD}px max(8px, env(safe-area-inset-left))
           calc(${OUTPAD}px + env(safe-area-inset-bottom))
           max(8px, env(safe-area-inset-right));
`;

const Shell = styled.div`
  width: 100%; max-width: 680px; height: 100%;
  background: #fff;
  border: 1px solid #eef1f6; border-radius: 12px; box-shadow: 0 1px 2px rgba(16,24,40,.04);
  display: grid; grid-template-rows: auto 1fr auto; overflow: hidden;
`;

const Topbar = styled.header`
  padding: ${GAP + 2}px ${PADX + 2}px 0;
  display: flex; align-items: center; justify-content: space-between;
  .actions { display: flex; gap: 8px; }
`;
const TitleBar = styled.h3`
  font-size: 16px; font-weight: 800; color: #2b2f3a; margin: 0;
`;
const Btn = styled.button`
  height: ${H}px; padding: 0 12px; border-radius: 8px; font-weight: 800;
  border: 1px solid transparent; cursor: pointer; font-size: ${FONT}px;
  ${({ $variant }) => $variant === "ghost" && `background:#fff;color:#3b4052;border-color:#DDE2EE;`}
  ${({ $variant }) => $variant === "ok" && `background:#2F9E63;color:#fff;`}
  ${({ $variant }) => $variant === "danger" && `background:#D75340;color:#fff;`}
`;

const ScrollArea = styled.div`
  min-height: 0; overflow: auto;
  padding: 4px ${PADX + 2}px ${PADX + 2}px;
  overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.25) transparent;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,.22); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
`;

const PageTitle = styled.h1`
  font-size: 18px; font-weight: 800; line-height: 1.35; margin: 6px 0 12px;
  color: #111827; word-break: keep-all; display: flex; align-items: center; gap: 8px;
`;
const EmBadge = styled.span`
  padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 800;
  background: #fde8e8; color: #b01818; border: 1px solid #f5c2c2;
`;
const Row = styled.div` margin: ${GAP + 2}px 0; `;
const MetaGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px ${PADX}; margin: ${GAP}px 0;
`;

const FieldLabel = styled.div`
  font-size: 12px; font-weight: 800; color: #1f2937; letter-spacing: .02em;
`;
const FieldValue = styled.div`
  margin-top: 4px; font-size: 15px; color: #111827; line-height: 1.5; word-break: break-word;
  .meta { color:#6f7892; font-size:12px; }
`;

const Status = styled.span`
  margin-top: 6px; display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 800;
  border: 1px solid transparent;
  ${({ $type }) => {
    switch ($type) {
      case "progress": return css`background:#E7F1FF; color:#0B5ED7; border-color:#CFE2FF;`;
      case "done":     return css`background:#E6F7EE; color:#18794E; border-color:#C6F0DA;`;
      case "reject":   return css`background:#FDE8E8; color:#B01818; border-color:#F5C2C2;`;
      case "hold":     return css`background:#FFF4E5; color:#AD5A00; border-color:#FFE1BF;`;
      case "draft":    return css`background:#EEF1F6; color:#445069; border-color:#E3E7EF;`;
      default:         return css`background:#EEF1F6; color:#445069; border-color:#E3E7EF;`;
    }
  }}
`;

const Content = styled.div`
  margin-top: 6px; font-size: 15px; line-height: 1.6; color: #111827;
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 10px 18px; }
  h1, h2, h3 { margin: 14px 0 8px; line-height: 1.3; }
  .muted { color: #98a0b3; }
  * { max-width: 100%; }
`;
const List = styled.ul`
  margin: 6px 0 0; padding: 0; list-style: none;
  li { padding: 6px 0; }
  .meta { color: #6f7892; font-size: 12px; }
  .link { color: #2563eb; text-decoration: none; }
`;
const Muted = styled.div` color: #95a1af; font-size: 13px; margin-top: 6px; `;

/* 결재선 리스트 */
const RouteList = styled.ul`
  margin: 8px 0 0; padding: 0; list-style: none; border: 1px solid #eef1f6; border-radius: 8px;
  overflow: hidden;
  li {
    display: grid; grid-template-columns: 1fr auto; align-items: center;
    padding: 10px 12px; border-top: 1px solid #f4f6fb;
    &:first-child { border-top: 0; }
    .left { min-width: 0; }
    .right { display: flex; align-items: center; gap: 8px; }
    .idx {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 999px;
      background: #f3f5fa; color: #556070; font-size: 11px; font-weight: 800; margin-right: 8px;
      flex: 0 0 auto;
    }
    .name { font-weight: 800; color: #1f2937; }
    .type { margin-left: 6px; font-size: 12px; color: #6f7892; }
    .meta { color: #6f7892; font-size: 12px; }
    .dt { white-space: nowrap; }
  }
`;
const Chip = styled.span`
  display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 800; border: 1px solid transparent;
  ${({ $type }) => {
    switch ($type) {
      case "done":     return css`background:#E6F7EE; color:#18794E; border-color:#C6F0DA;`;
      case "reject":   return css`background:#FDE8E8; color:#B01818; border-color:#F5C2C2;`;
      case "hold":     return css`background:#FFF4E5; color:#AD5A00; border-color:#FFE1BF;`;
      case "progress": return css`background:#E7F1FF; color:#0B5ED7; border-color:#CFE2FF;`;
      case "draft":
      default:         return css`background:#EEF1F6; color:#445069; border-color:#E3E7EF;`;
    }
  }}
`;

const Footer = styled.div`
  border-top: 1px solid #e1e5ef;
  padding: ${GAP}px ${PADX + 2}px calc(${GAP}px + env(safe-area-inset-bottom));
  background: #fff;
`;
const FooterGrid = styled.div`
  display: grid; grid-template-columns: 1fr auto auto; gap: 8px; min-width: 0;
`;
const CommentInput = styled.input`
  height: ${H}px; padding: 0 10px; border: 1px solid #E1E5EF;
  border-radius: 8px; font-size: ${FONT}px; min-width: 120px;
`;
