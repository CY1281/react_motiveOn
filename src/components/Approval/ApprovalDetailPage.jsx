// src/components/Approval/ApprovalDetailPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

/* ===== (기존 값 유지) 컴팩트 토큰 ===== */
const H = 28;
const FONT = 12;
const GAP = 8;
const PADX = 8;
/* 작성 페이지와 동일한 외부 패딩 값 */
const OUTPAD = 12;

export default function ApprovalDetailPage({
  doc = MOCK_DOC,
  lines = MOCK_LINES,
  refs = MOCK_REFS,
  headerOffset = 56,
  onBack,
  onList,
  onApprove,
  onReject,
}) {
  const nav = useNavigate();
  const [comment, setComment] = useState("");

  const stateText = useMemo(() => statusTextOf(doc?.docStatus), [doc?.docStatus]);
  const stateType = useMemo(() => statusTypeOf(doc?.docStatus), [doc?.docStatus]);

  const handleBack = () => (onBack ? onBack() : nav(-1));
  const handleList = () => (onList ? onList() : nav("/approval/approve"));
  const handlePrint = () => window.print();

  const submitApprove = async () => {
    if (!window.confirm("승인하시겠습니까?")) return;
    try { if (onApprove) await onApprove({ signNo: doc?.signNo, comment, action: "approve" }); alert("승인되었습니다."); }
    catch { alert("승인 중 오류가 발생했습니다."); }
  };
  const submitReject = async () => {
    if (!window.confirm("반려하시겠습니까?")) return;
    try { if (onReject) await onReject({ signNo: doc?.signNo, comment, action: "reject" }); alert("반려되었습니다."); }
    catch { alert("반려 중 오류가 발생했습니다."); }
  };

  return (
    <Wrapper style={{ top: headerOffset }}>
      <Card>
        <Topbar>
          <h3 className="title">전자결재</h3>
          <div className="actions">
            <Btn $variant="ghost" onClick={handleList}>목록</Btn>
            <Btn $variant="ghost" onClick={handleBack}>뒤로</Btn>
            <Btn $variant="primary" onClick={handlePrint}>인쇄</Btn>
          </div>
        </Topbar>

        <ScrollArea>
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
        </ScrollArea>

        <Footer>
          <FooterGrid>
            <CommentInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="결재 의견(선택)"
            />
            <Btn $variant="ok" onClick={submitApprove}>승인</Btn>
            <Btn $variant="danger" onClick={submitReject}>반려</Btn>
          </FooterGrid>
        </Footer>
      </Card>
    </Wrapper>
  );
}

/* ===== helpers (생략 없이 그대로) ===== */
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

/* Read-only input (컴팩트, 중앙 정렬) */
const Read = styled.input.attrs({ type: "text", readOnly: true })`
  width: 80%;
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

  display: block;     /* ← 블록으로 바꾸고 */
  margin: 0 auto;     /* ← 좌우 가운데 정렬 */

  text-align: center; /* ← 텍스트도 가운데(원치 않으면 이 줄 제거) */
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
  padding: 6px ${PADX}px;       /* ⬅ 컴팩트 패딩 */
  max-height: ${H}px;           /* ⬅ 행 높이 하한 */

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

/* 🔒 전역 .btn 영향을 완전히 차단 */
const DlBtn = styled.a`
  all: unset;                          /* 전역 버튼 스타일 초기화 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${H - 6}px;                  /* 컴팩트 높이 */
  padding: 0 ${PADX}px;
  border-radius: 999px;
  border: 1px solid #d9dbe3;
  background: #f2f3f7;
  font-size: ${FONT - 1}px;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  line-height: 1;                      /* 라인하이트로 인한 늘어남 방지 */
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

