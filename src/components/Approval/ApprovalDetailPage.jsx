// src/components/Approval/ApprovalDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { getApprovalDetail } from "../motiveOn/api";

/* ===== (기존 값 유지) 컴팩트 토큰 ===== */
const H = 30;
const FONT = 13;
const GAP = 8;
const PADX = 8;
/* 작성 페이지와 동일한 외부 패딩 값 */
const OUTPAD = 12;

export default function ApprovalDetailPage({
  doc: initialDoc = null,
  lines: initialLines = [],
  refs: initialRefs = [],
  headerOffset = 56,
  onBack,
  onList,
  onApprove,
  onReject,
}) {
  const nav = useNavigate();
  const { signNo: routeSignNo } = useParams();

  // ✅ 외부(바디) 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // 상세 데이터 상태
  const [doc, setDoc] = useState(initialDoc);
  const [lines, setLines] = useState(initialLines);
  const [refs, setRefs] = useState(initialRefs);
  const [loading, setLoading] = useState(!initialDoc); // 초기 데이터 없으면 로딩 시작
  const [errMsg, setErrMsg] = useState("");

  // 서버에서 상세 조회
  useEffect(() => {
    let alive = true;
    const signNo = routeSignNo;

    async function run() {
      if (!signNo) return;
      try {
        setLoading(true);
        setErrMsg("");
        const res = await getApprovalDetail(signNo);
        const ok = res?.data?.ok;
        if (!ok) throw new Error(res?.data?.message || "상세를 불러오지 못했습니다.");

        const d  = res?.data?.doc ?? null;
        const ls = Array.isArray(res?.data?.lines) ? res.data.lines : [];
        const rf = Array.isArray(res?.data?.refs)  ? res.data.refs  : [];

        if (!alive) return;
        setDoc(d);
        setLines(ls);
        setRefs(rf);
      } catch (e) {
        console.error("[detail] load fail:", e);
        if (!alive) return;
        setErrMsg("상세를 불러오지 못했습니다.");
        // 폴백: 초기 프롭이 있으면 그대로 유지
        if (!initialDoc) {
          setDoc(null);
          setLines([]);
          setRefs([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSignNo]);

  const stateText = useMemo(() => statusTextOf(doc?.docStatus), [doc?.docStatus]);
  const stateType = useMemo(() => statusTypeOf(doc?.docStatus), [doc?.docStatus]);

  const handleBack = () => (onBack ? onBack() : nav(-1));
  const handleList = () => (onList ? onList() : nav("/approval/approve"));
  const handlePrint = () => window.print();

  const submitApprove = async () => {
    if (!window.confirm("승인하시겠습니까?")) return;
    try {
      if (onApprove) await onApprove({ signNo: doc?.signNo, comment, action: "approve" });
      alert("승인되었습니다.");
    } catch {
      alert("승인 중 오류가 발생했습니다.");
    }
  };
  const submitReject = async () => {
    if (!window.confirm("반려하시겠습니까?")) return;
    try {
      if (onReject) await onReject({ signNo: doc?.signNo, comment, action: "reject" });
      alert("반려되었습니다.");
    } catch {
      alert("반려 중 오류가 발생했습니다.");
    }
  };

  const [comment, setComment] = useState("");

  return (
    <Wrapper style={{ top: headerOffset }}>
      <Card>
        <Topbar>
          <h3 className="title">전자결재</h3>
          <div className="actions">
            <Btn $variant="ghost" onClick={handleList}>목록</Btn>
          </div>
        </Topbar>

        <ScrollArea>
          {loading ? (
            <EmptyBox>불러오는 중…</EmptyBox>
          ) : errMsg ? (
            <EmptyBox>{errMsg}</EmptyBox>
          ) : !doc ? (
            <EmptyBox>문서를 찾을 수 없습니다.</EmptyBox>
          ) : (
            <>
              <Row>
                <Label>제목</Label>
                <TitleField>
                  <Read value={safe(doc?.title, "-")} readOnly />
                  {Number(doc?.emergency) === 1 && <BadgeEmIn>긴급</BadgeEmIn>}
                </TitleField>
              </Row>

              <Row2>
                <FormGroup>
                  <Label>문서번호</Label>
                  <Read value={safe(doc?.signNo, "-")} readOnly />
                </FormGroup>
                <FormGroup>
                  <Label>요청자</Label>
                  <Read value={safe(doc?.drafterName, "-")} readOnly />
                </FormGroup>
              </Row2>

              <Row2>
                <FormGroup>
                  <Label>기안일</Label>
                  <Read value={formatDateTime(doc?.draftAt) || "-"} readOnly />
                </FormGroup>
                <FormGroup>
                  <Label>완료일</Label>
                  <Read value={formatDateTime(doc?.completeAt) || "-"} readOnly />
                </FormGroup>
              </Row2>

              <Row2>
                <FormGroup>
                  <Label>상태</Label>
                  <StatusPill $type={stateType}>{stateText}</StatusPill>
                </FormGroup>
                <FormGroup>{/* 2열 정렬 유지용 빈 칸 */}</FormGroup>
              </Row2>

              <Row>
                <Label>내용</Label>
                <Viewer
                  dangerouslySetInnerHTML={{
                    __html:
                      (doc?.signcontent ?? "").trim() ||
                      `<div class="muted">본문 내용이 없습니다.</div>`,
                  }}
                />
              </Row>

              <Row>
                <Label>첨부파일</Label>
                {(!doc?.attachments || doc.attachments.length === 0) ? (
                  <EmptyBox>첨부파일이 없습니다.</EmptyBox>
                ) : (
                  <AttachBox>
                    {doc.attachments.map((f, i) => (
                      <AttachItem key={i}>
                        <span className="name" title={f.name}>{f.name}</span>
                        <span className="meta">{f.size || ""}</span>
                        {f.url ? (
                          <DlBtn href={f.url} target="_blank" rel="noreferrer">다운로드</DlBtn>
                        ) : null}
                      </AttachItem>
                    ))}
                  </AttachBox>
                )}
              </Row>

              <Row>
                <Label>결재선</Label>
                {(!lines || lines.length === 0) ? (
                  <EmptyBox>결재선 정보가 없습니다.</EmptyBox>
                ) : (
                  <ListBox>
                    {lines.map((ln, i, arr) => {
                      const last = i === arr.length - 1;
                      return (
                        <ListItem key={i} $last={last}>
                          <div className="left">
                            <strong>{safe(ln?.orderSeq, "-")}차</strong>&nbsp;{safe(ln?.approverName, "-")}
                            <span className="meta"> / 부서: {safe(ln?.approverDept, "-")}</span>
                          </div>
                          <div className="right meta">
                            {routeStatusText(ln?.routeStatus)}
                            {ln?.actionAt ? <span>&nbsp;·&nbsp;{formatDateTime(ln?.actionAt)}</span> : null}
                          </div>
                        </ListItem>
                      );
                    })}
                  </ListBox>
                )}
              </Row>

              <Row>
                <Label>참조자</Label>
                {(!refs || refs.length === 0) ? (
                  <EmptyBox>참조자가 없습니다.</EmptyBox>
                ) : (
                  <ListBox>
                    {refs.map((rf, i, arr) => {
                      const last = i === arr.length - 1;
                      return (
                        <ListItem key={i} $last={last}>
                          <div className="left">{safe(rf?.approverName, "-")}</div>
                          <div className="right meta">부서: {safe(rf?.approverDept, "-")}</div>
                        </ListItem>
                      );
                    })}
                  </ListBox>
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
            />
            <Btn $variant="ok" onClick={submitApprove} disabled={!doc}>승인</Btn>
            <Btn $variant="danger" onClick={submitReject} disabled={!doc}>반려</Btn>
          </FooterGrid>
        </Footer>
      </Card>
    </Wrapper>
  );
}

/* ===== helpers (그대로) ===== */
function statusTextOf(code){switch(Number(code)){case 0:return"작성/대기";case 1:return"진행중";case 2:return"완료";case 3:return"반려";case 4:return"회수/보류";default:return"-";}}
function statusTypeOf(code){switch(Number(code)){case 1:return"progress";case 2:return"done";case 3:return"reject";case 4:return"hold";case 0:return"draft";default:return"neutral";}}
function routeStatusText(code){switch(Number(code)){case 1:return"승인";case 2:return"반려";case 3:return"보류";default:return"대기";}}
function formatDateTime(v){if(!v)return"";const d=new Date(v);if(isNaN(+d))return String(v);const yyyy=d.getFullYear();const mm=String(d.getMonth()+1).padStart(2,"0");const dd=String(d.getDate()).padStart(2,"0");const HH=String(d.getHours()).padStart(2,"0");const MM=String(d.getMinutes()).padStart(2,"0");return`${yyyy}-${mm}-${dd} ${HH}:${MM}`;}
function safe(v,fallback=""){return(v===null||v===undefined||v==="")?fallback:v;}

/* ================= styled ================= */
/* ✅ 작성 페이지(Viewport)와 동일한 외부 패딩 */
const Wrapper = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: ${OUTPAD}px
           max(8px, env(safe-area-inset-left))
           calc(${OUTPAD}px + env(safe-area-inset-bottom))
           max(8px, env(safe-area-inset-right));
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

const Topbar = styled.header`
  padding: ${GAP + 4}px ${PADX + 4}px 0;
  display: flex; align-items: center; justify-content: space-between;
  .title { font-size: 16px; font-weight: 800; color: #2b2f3a; }
  .actions { display: flex; gap: ${GAP}px; }
`;

const Btn = styled.button`
  height: ${H}px; padding: 0 ${PADX + 4}px; border-radius: 8px; font-weight: 800;
  border: 1px solid transparent; cursor: pointer; font-size: ${FONT}px;
  ${({ $variant }) => $variant === "ghost" && `background:#fff;color:#3b4052;border-color:#DDE2EE;`}
  ${({ $variant }) => $variant === "primary" && `background:#487FC3;color:#fff;`}
  ${({ $variant }) => $variant === "ok" && `background:#2F9E63;color:#fff;`}
  ${({ $variant }) => $variant === "danger" && `background:#D75340;color:#fff;`}
`;

const ScrollArea = styled.div`
  min-height: 0;
  overflow: auto;
  padding: 0 ${PADX + 4}px ${PADX + 4}px;
  min-width: 0;

  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,.25) transparent;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.22);
    border-radius: 8px; border: 2px solid transparent; background-clip: content-box;
  }
`;

const Row = styled.div` margin-bottom: ${GAP}px; min-width: 0; `;
const Row2 = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${GAP}px;
  margin-bottom: ${GAP}px; min-width: 0; > * { min-width: 0; }
`;
const FormGroup = styled.div` min-width: 0; `;
const Label = styled.div` font-size: ${FONT - 1}px; color: #333; font-weight: 700; margin-bottom: ${Math.max(GAP-4,4)}px; `;

const TitleField = styled.div`
  position: relative;
  min-width: 0;
  > input { padding-right: ${PADX + 44}px; }
`;
const BadgeEmIn = styled.span`
  position: absolute; right: ${PADX}px; top: 50%; transform: translateY(-50%);
  height: ${H - 6}px; padding: 0 ${PADX}px;
  border-radius: 999px; font-size: ${FONT - 1}px; font-weight: 800;
  background: #FDE8E8; color: #B01818; border: 1px solid #F5C2C2;
  pointer-events: none;
`;

const Read = styled.input.attrs({ type: "text", readOnly: true })`
  width: 85%;
  height: ${H}px;
  padding: 0 ${PADX}px;
  border: 1px solid #e1e5ef;
  border-radius: 6px;
  background: #f7f8fb;
  font-size: ${FONT}px;
  color: #333;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  margin: 0 auto;
  text-align: center;
`;

const Viewer = styled.div`
  min-height: 140px; padding: ${Math.max(PADX-2,6)}px ${PADX + 2}px;
  border: 1px solid #e1e5ef; border-radius: 6px;
  font-size: ${FONT}px; line-height: 1.45; background: #fff; color: #222;
  word-break: break-word; min-width: 0;
  .muted { color: #98a0b3; } * { max-width: 100%; }
`;

const AttachBox = styled.div`
  border: 1px solid #e1e5ef;
  border-radius: 6px;
  background: #fff;
  min-width: 0;
`;

const AttachItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  column-gap: ${GAP}px;
  padding: 6px ${PADX}px;
  max-height: ${H}px;

  border-bottom: 1px solid #f1f2f4;
  &:last-child { border-bottom: 0; }

  .name {
    min-width: 0;
    font-size: ${FONT}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    font-size: ${FONT - 1}px;
    color: #6f7892;
  }
`;

const DlBtn = styled.a`
  all: unset;
  display: inline-flex; align-items: center; justify-content: center;
  height: ${H - 6}px; padding: 0 ${PADX}px;
  border-radius: 999px; border: 1px solid #d9dbe3; background: #f2f3f7;
  font-size: ${FONT - 1}px; color: #333; text-decoration: none; cursor: pointer; line-height: 1;
  -webkit-tap-highlight-color: transparent;
  &:hover { background: #eceff3; }
  &:active { transform: translateY(1px); }
`;
const EmptyBox = styled.div`
  border: 1px solid #e1e5ef; border-radius: 6px; background: #fafbfd;
  padding: ${PADX}px ${PADX + 2}px; color: #98a0b3; font-size: ${FONT}px; min-width: 0;
`;

const ListBox = styled.div`
  border: 1px solid #e1e5ef; border-radius: 6px; background: #fff; min-width: 0;
`;
const ListItem = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${GAP}px; padding: ${Math.max(GAP-2,6)}px ${PADX}px; font-size: ${FONT}px;
  border-bottom: ${({ $last }) => ($last ? "0" : "1px solid #f1f2f4")};
  .left { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .right { flex: 0 0 auto; }
  .meta { color: #6f7892; font-size: ${FONT - 1}px; }
`;

const StatusPill = styled.span`
  display: inline-flex; align-items: center;
  height: ${H - 6}px; padding: 0 ${PADX}px; border-radius: 999px;
  font-size: ${FONT - 1}px; font-weight: 800; border: 1px solid transparent;
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

const Footer = styled.div`
  border-top: 1px solid #e1e5ef;
  padding: ${GAP + 2}px ${PADX + 4}px calc(${GAP + 2}px + env(safe-area-inset-bottom));
  background: #fff;
`;
const FooterGrid = styled.div`
  display: grid; grid-template-columns: 1fr auto auto; gap: ${GAP}px; min-width: 0;
`;
const CommentInput = styled.input`
  height: ${H}px; padding: 0 ${PADX}px; border: 1px solid #E1E5EF;
  border-radius: 8px; font-size: ${FONT}px; min-width: 120px;
`;
