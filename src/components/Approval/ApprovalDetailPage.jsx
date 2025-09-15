// src/components/Approval/ApprovalDetailPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

/** =========================================================
 *  ApprovalDetailPage (모바일 전자결재 상세)
 *  - 헤더 아래 고정(position: fixed), 외부 스크롤 제거
 *  - 내부 카드만 세로 스크롤
 *  - JSP 로직 반영: 상태 텍스트, 긴급, 결재선/참조자, 본문(HTML)
 *  - onApprove / onReject 콜백으로 서버 연동 가능
 *  - headerOffset: 상단 고정 헤더 높이(px) — 기본 56
 * ========================================================= */
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

  const handleBack = () => {
    if (onBack) return onBack();
    nav(-1);
  };

  const handleList = () => {
    if (onList) return onList();
    // 필요 시 실제 목록 경로로 변경하세요.
    nav("/approval/approve");
  };

  const handlePrint = () => window.print();

  const submitApprove = async () => {
    if (!window.confirm("승인하시겠습니까?")) return;
    try {
      if (onApprove) await onApprove({ signNo: doc?.signNo, comment, action: "approve" });
      alert("승인되었습니다.");
    } catch (e) {
      console.error(e);
      alert("승인 중 오류가 발생했습니다.");
    }
  };

  const submitReject = async () => {
    if (!window.confirm("반려하시겠습니까?")) return;
    try {
      if (onReject) await onReject({ signNo: doc?.signNo, comment, action: "reject" });
      alert("반려되었습니다.");
    } catch (e) {
      console.error(e);
      alert("반려 중 오류가 발생했습니다.");
    }
  };

  const paperTitle =
    (doc?.formName?.trim?.() ? doc.formName : "") ||
    (doc?.sformno ? `${doc.sformno} 양식` : "전자결재");

  return (
    <Wrapper style={{ top: headerOffset }}>
      <Frame>
        <Topbar>
          <h3 className="title">전자결재</h3>
          <div className="actions">
            <Btn $variant="ghost" onClick={handleList}>목록</Btn>
            <Btn $variant="ghost" onClick={handleBack}>뒤로</Btn>
            <Btn $variant="primary" onClick={handlePrint}>인쇄</Btn>
          </div>
        </Topbar>

        <Content>
          <Section>
            <Card>
              <CardHeader>결재 상세</CardHeader>
              <CardBody>
                {/* 카드 내부만 스크롤 */}
                <ScrollArea>
                  {/* 본문 카드 */}
                  <PaperBox>
                    <PaperTitle>{paperTitle}</PaperTitle>

                    <Table>
                      <colgroup>
                        <col style={{ width: 120 }} />
                        <col />
                        <col style={{ width: 120 }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <Th>문서번호</Th>
                          <Td><Badge>{safe(doc?.signNo, "-")}</Badge></Td>
                          <Th>긴급</Th>
                          <Td>{Number(doc?.emergency) === 1 ? <BadgeEm>긴급</BadgeEm> : "일반"}</Td>
                        </tr>
                        <tr>
                          <Th>기안일</Th>
                          <Td>{formatDateTime(doc?.draftAt) || "-"}</Td>
                          <Th>완료일</Th>
                          <Td>{formatDateTime(doc?.completeAt) || "-"}</Td>
                        </tr>
                        <tr>
                          <Th>상태</Th>
                          <Td colSpan={3}>{stateText}</Td>
                        </tr>
                        <tr>
                          <Th>제목</Th>
                          <Td colSpan={3}>{safe(doc?.title, "-")}</Td>
                        </tr>
                      </tbody>
                    </Table>

                    {/* 본문 HTML */}
                    <Editor
                      dangerouslySetInnerHTML={{
                        __html:
                          (doc?.signcontent ?? "").trim() ||
                          `<div class="muted">본문 내용이 없습니다.</div>`,
                      }}
                    />

                    {/* 승인/반려 */}
                    <ActionBar>
                      <CommentInput
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="결재 의견(선택)"
                      />
                      <Btn $variant="ok" onClick={submitApprove}>승인</Btn>
                      <Btn $variant="danger" onClick={submitReject}>반려</Btn>
                    </ActionBar>
                  </PaperBox>

                  {/* 우측 정보 섹션(모바일에선 아래로) */}
                  <InfoPanel>
                    <Tabs>
                      <Tab className="on">문서정보</Tab>
                    </Tabs>
                    <InfoBody>
                      <InfoCard>
                        <InfoGrid>
                          <div>문서번호</div>
                          <div><Badge>{safe(doc?.signNo, "-")}</Badge></div>

                          <div>양식번호</div>
                          <div>{safe(doc?.sformno, "-")}</div>

                          <div>상태</div>
                          <div>{stateText}</div>

                          <div>긴급여부</div>
                          <div>{Number(doc?.emergency) === 1 ? <BadgeEm>긴급</BadgeEm> : "일반"}</div>

                          <div>기안일</div>
                          <div>{formatDateTime(doc?.draftAt) || "-"}</div>

                          <div>완료일</div>
                          <div>{formatDateTime(doc?.completeAt) || "-"}</div>
                        </InfoGrid>
                      </InfoCard>

                      <BlockTitle>결재선</BlockTitle>
                      {(!lines || lines.length === 0) ? (
                        <Muted>결재선 정보가 없습니다.</Muted>
                      ) : (
                        <Pills>
                          {lines.map((ln, idx) => (
                            <Pill key={idx}>
                              <div>
                                <strong>{safe(ln?.orderSeq, "-")}차</strong>&nbsp;
                                {safe(ln?.approverName, "-")}
                                <span className="meta"> / 부서: {safe(ln?.approverDept, "-")}</span>
                              </div>
                              <div className="meta">
                                {routeStatusText(ln?.routeStatus)}
                                {ln?.actionAt ? (
                                  <span>&nbsp;·&nbsp;{formatDateTime(ln?.actionAt)}</span>
                                ) : null}
                              </div>
                            </Pill>
                          ))}
                        </Pills>
                      )}

                      <BlockTitle>참조자</BlockTitle>
                      {(!refs || refs.length === 0) ? (
                        <Muted>참조자가 없습니다.</Muted>
                      ) : (
                        <Pills>
                          {refs.map((rf, idx) => (
                            <Pill key={idx}>
                              <div>{safe(rf?.approverName, "-")}</div>
                              <div className="meta">부서: {safe(rf?.approverDept, "-")}</div>
                            </Pill>
                          ))}
                        </Pills>
                      )}
                    </InfoBody>
                  </InfoPanel>
                </ScrollArea>
              </CardBody>
            </Card>
          </Section>
        </Content>
      </Frame>
    </Wrapper>
  );
}

/* ===================== helpers ===================== */
function statusTextOf(code) {
  // 0 작성/대기, 1 진행중, 2 완료, 3 반려, 4 회수/보류
  switch (Number(code)) {
    case 0: return "작성/대기";
    case 1: return "진행중";
    case 2: return "완료";
    case 3: return "반려";
    case 4: return "회수/보류";
    default: return "-";
  }
}
function routeStatusText(code) {
  // 1 승인, 2 반려, 3 보류, 그 외 대기
  switch (Number(code)) {
    case 1: return "승인";
    case 2: return "반려";
    case 3: return "보류";
    default: return "대기";
  }
}
function formatDateTime(v) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(+d)) return String(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}`;
}
function safe(v, fallback = "") {
  return (v === null || v === undefined || v === "") ? fallback : v;
}

/* ===================== styled ===================== */
const Wrapper = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  /* top은 props로 주입(headerOffset) */
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden; /* 외부 스크롤 제거 */
`;

const Frame = styled.div`
  width: 100%;
  max-width: 420px;       /* 모바일 폭 */
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const Topbar = styled.header`
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #E9ECF3;
  .title { font-size: 18px; font-weight: 800; color: #222; }
  .actions { display: flex; gap: 8px; }
`;

const Btn = styled.button`
  height: 34px; padding: 0 14px; border-radius: 8px; font-weight: 700;
  border: 1px solid transparent; cursor: pointer; font-size: 14px;

  ${({ $variant }) =>
    $variant === "ghost" && `
      background:#fff; color:#3b4052; border-color:#DDE2EE;
    `}
  ${({ $variant }) =>
    $variant === "primary" && `
      background:#487FC3; color:#fff;
    `}
  ${({ $variant }) =>
    $variant === "ok" && `
      background:#32a05f; color:#fff;
    `}
  ${({ $variant }) =>
    $variant === "danger" && `
      background:#D75340; color:#fff;
    `}
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden; /* 외부 스크롤 방지 */
`;

const Section = styled.section`
  height: 100%;
  padding: 8px 0;
  min-height: 0;
`;

const Card = styled.div`
  height: 100%;
  margin: 0 8px;
  border: 1px solid #E1E5EF;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(25,32,56,.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 10px 12px;
  font-weight: 800;
  color: #222;
  border-bottom: 1px solid #E9ECF3;
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
`;

const ScrollArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

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

const PaperBox = styled.div`
  border: 1px solid #E1E5EF;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
`;

const PaperTitle = styled.h2`
  margin: 0 0 12px;
  text-align: center;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: .06em;
  color: #1e2439;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-bottom: 8px;
`;
const Th = styled.th`
  width: 120px;
  text-align: center;
  background: #FAFBFE;
  color: #4B5164;
  border: 1px solid #E1E5EF;
  padding: 10px 12px;
  font-weight: 700;
  font-size: 14px;
`;
const Td = styled.td`
  border: 1px solid #E1E5EF;
  padding: 10px 12px;
  font-size: 14px;
  vertical-align: middle;
`;

const Editor = styled.div`
  min-height: 220px;
  border: 1px solid #E1E5EF;
  border-radius: 12px;
  padding: 14px;
  margin-top: 12px;
  background: #fff;
  color: #222;
  line-height: 1.6;
  word-break: break-word;
  .muted { color: #8b90a0; }
  * { max-width: 100%; }
`;

const ActionBar = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;
const CommentInput = styled.input`
  flex: 1 1 180px;
  min-width: 140px;
  height: 36px;
  padding: 8px 10px;
  border: 1px solid #E1E5EF;
  border-radius: 8px;
  font-size: 14px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  background: #EEF2FF;
  font-size: 12px;
  font-weight: 700;
  color: #2e3ea8;
`;
const BadgeEm = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 800;
  background: #FDE8E8; color: #B01818; border: 1px solid #F5C2C2;
`;

const InfoPanel = styled.div`
  margin-top: 12px;
  border: 1px solid #E1E5EF;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
`;
const Tabs = styled.div`
  display: flex; border-bottom: 1px solid #E9ECF3;
`;
const Tab = styled.div`
  padding: 12px 14px; font-weight: 800; color: #222;
  border-bottom: 2px solid #487FC3;
`;
const InfoBody = styled.div`
  padding: 12px;
`;
const InfoCard = styled.div`
  border: 1px solid #E1E5EF; border-radius: 12px; background: #fff; padding: 12px;
  margin-bottom: 16px;
`;
const InfoGrid = styled.div`
  display: grid; grid-template-columns: 96px 1fr; gap: 10px; align-items: center; color: #222;
`;

const BlockTitle = styled.div`
  font-weight: 700; margin: 6px 0 8px;
`;

const Pills = styled.div`
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;
`;
const Pill = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 10px 12px; border: 1px solid #E1E5EF; border-radius: 12px; background: #FAFBFE;
  font-size: 13px;
  .meta { color: #6f7892; font-size: 12px; }
`;
const Muted = styled.div`
  color: #8b90a0; font-size: 13px; margin-bottom: 16px;
`;

/* ===================== demo mock ===================== */
const MOCK_DOC = {
  signNo: 91001,
  emergency: 1,
  draftAt: "2025-09-10T10:20:00",
  completeAt: "",
  docStatus: 1, // 0 작성/대기, 1 진행중, 2 완료, 3 반려, 4 회수/보류
  title: "지출 결의서 – 장비 도입",
  formName: "지출결의서",
  sformno: "F-001",
  signcontent: "<p>지출 내역 및 첨부 문서 참고 바랍니다.</p>",
};
const MOCK_LINES = [
  { orderSeq: 1, approverName: "김팀장", approverDept: "영업1팀", routeStatus: 1, actionAt: "2025-09-10T12:10:00" },
  { orderSeq: 2, approverName: "이이사", approverDept: "영업본부", routeStatus: 0, actionAt: "" },
];
const MOCK_REFS = [
  { approverName: "박대리", approverDept: "경영지원" },
  { approverName: "최사원", approverDept: "재무팀" },
];
