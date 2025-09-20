// src/components/Approval/ApprovalPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getApprovalHome } from "../motiveOn/api";

/** =========================================================
 *  ApprovalPage (모바일 전자결재 홈) - 모바일 전용
 * ========================================================= */
export default function ApprovalPage() {
  const [counts, setCounts] = useState({ urgentCount: 0, returnedCount: 0, holdCount: 0, waitingCount: 0 });
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [toApprove, setToApprove] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ 외부 스크롤(바디) 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // 서버 응답 행 정규화 (대소문자/별칭 포괄)
  const normalizeRow = (r = {}) => {
    const pick = (...keys) => keys.find((k) => r[k] !== undefined);
    return {
      signNo:     r[pick("signNo", "SIGNNO", "signno")],
      title:      r[pick("title", "TITLE")] ?? "",
      formNo:     r[pick("formNo", "FORMNO", "SFORMNO")] ?? "",
      formName:   r[pick("formName", "FORMNAME")] ?? r[pick("formNo", "FORMNO", "SFORMNO")] ?? "",
      draftAt:    r[pick("draftAt", "DRAFTAT", "ddate", "DDATE", "regDate", "REGDATE")] ?? null,
      completeAt: r[pick("completeAt", "COMPLETEAT", "edate", "EDATE")] ?? null,
      emergency:  Number(r[pick("emergency", "EMERGENCY")]) || 0,
      docStatus:  Number(r[pick("docStatus", "DOCSTATUS", "STATE")]) || 2,
    };
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await getApprovalHome();
        const ct = (res?.headers?.["content-type"] || "").toLowerCase();
        if (!ct.includes("application/json")) throw new Error("JSON이 아닌 응답");

        const c  = res?.data?.counts || {};
        const rd = Array.isArray(res?.data?.recentDrafts) ? res.data.recentDrafts : [];
        const ta = Array.isArray(res?.data?.toApprove)    ? res.data.toApprove    : [];

        if (!alive) return;
        setCounts({
          urgentCount:   Number(c.urgentCount   ?? 0),
          returnedCount: Number(c.returnedCount ?? 0),
          holdCount:     Number(c.holdCount     ?? 0),
          waitingCount:  Number(c.waitingCount  ?? 0),
        });
        setRecentDrafts(rd.map(normalizeRow));
        setToApprove(ta.map(normalizeRow));
      } catch (e) {
        console.error("[ApprovalHome] load fail:", e);
        if (alive) setErrMsg("목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <ApprovalHomeMobile
      counts={counts}
      recentDrafts={recentDrafts}
      toApprove={toApprove}
      loading={loading}
      errMsg={errMsg}
    />
  );
}

/* ===================== styled ===================== */
/* ✅ 화면 전체 고정 + 외부 스크롤 차단 */
const Wrapper = styled.div`
  position: fixed;
  inset: 0;              /* top:0; right:0; bottom:0; left:0; */
  background: #fff;
  color: #2b2f3a;
  overflow: hidden;      /* 외부 스크롤 잠금 */
  display: flex;
  flex-direction: column;
`;

/* 상단 헤더는 그대로 */
const PageHeader = styled.header`
  flex: 0 0 auto;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 700;
`;

/* 본문 컨테이너: 자체 스크롤 없음, 내부 카드들만 스크롤 */
const PageBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;    /* 외부 스크롤 방지 */
`;

const Section = styled.section`
  padding: 8px 0;
`;

const Card = styled.div`
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  margin: 0 8px;
`;

/* ✅ 높이 고정 카드 (내부 스크롤용) */
const FixedCard = styled(Card)`
  height: 200px;               /* 필요시 220~300px 조절 가능 */
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const CardHeader = styled.div`
  padding: 8px 12px;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const CardBody = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;     /* 자식 스크롤 허용 */
`;

const ScrollArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  /* 스크롤바 스타일 */
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

const MobileList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const CardItem = styled.li`
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 4px;
  column-gap: 6px;

  .titleRow {
    grid-column: 1 / span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }
  .titleLeft { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .title {
    font-weight: 700; font-size: 15px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .right { justify-self: end; }
  .sub {
    font-size: 12px; color: #6b7280;
    grid-column: 1 / span 2; display: flex; gap: 10px;
  }
  .date { margin-left: auto; font-size: 12px; color: #6b7280; }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0 8px;
`;

const Stat = styled.button`
  appearance: none;
  border: 0;
  width: 100%;
  min-height: 76px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column;
  padding: 10px 8px;
  cursor: pointer;

  .cap { font-weight: 700; color: #4b5563; font-size: 13px; }
  .num { margin-top: 2px; font-weight: 800; color: #111827; font-size: 17px; }
  .u { margin-left: 2px; color: #6b7280; font-weight: 700; font-size: 12px; }

  &.agree { background: #f4d4ed; }
  &.prog  { background: #f6d6c6; }
  &.done  { background: #fff7ae; }
  &.wait  { background: #e3e7ef; }
`;

const Empty = styled.div`
  color: #95a1af;
  text-align: center;
  padding: 28px 0;
  font-size: 13px;
`;

const Badge = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: ${(p) => (p.$size === "sm" ? "3px 8px" : "6px 12px")};
  border-radius: 999px;
  font-size: ${(p) => (p.$size === "sm" ? "11px" : "12px")};
  font-weight: 800;

  &.emergency { background: #fde8e8; color: #b01818; border: 1px solid #f5c2c2; }
  &.wait      { background: #eef2f6; color: #6b7280; }
  &.prog      { background: rgba(58, 141, 254, 0.12); color: #3a8dfe; }
  &.done      { background: rgba(39, 174, 96, 0.12); color: #27ae60; }
  &.hold      { background: rgba(244, 180, 0, 0.16); color: #c48a00; }
`;

/* ===================== helper ===================== */
function formatDateLike(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (!isNaN(d)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch {}
  return String(value);
}
function formatDotDate(value) {
  const s = formatDateLike(value);
  return s ? "~ " + s.replaceAll("-", ".") : "";
}
function StatusPill({ docStatus }) {
  if (docStatus === 3) return <Badge className="done">완료</Badge>;
  if (docStatus === 6) return <Badge className="hold">보류</Badge>;
  return <Badge className="prog">진행중</Badge>;
}

/* ===================== UI ===================== */
function ApprovalHomeMobile({ counts, recentDrafts, toApprove, loading, errMsg }) {
  const navigate = useNavigate();

  const renderList = (list) => (
    <MobileList>
      {list.map((row) => (
        <CardItem key={row.signNo}>
          <div className="titleRow">
            <div className="titleLeft">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate(`/approval/detail/${row.signNo}`); }}
                className="title"
                title={row.title}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {row.title}
              </a>
              {row.emergency === 1 && <Badge className="emergency" $size="sm">⚡ 긴급</Badge>}
            </div>
            <div className="right">
              <StatusPill docStatus={row.docStatus} />
            </div>
          </div>
          <div className="sub">
            <span>{row.formName ?? row.formNo}</span>
            <span className="date">{formatDotDate(row.draftAt)}</span>
          </div>
        </CardItem>
      ))}
    </MobileList>
  );

  return (
    <Wrapper>
      <PageHeader>전자결재 홈</PageHeader>
      <PageBody>
        {/* 결재 현황 (외부 스크롤 없음) */}
        <Section>
          <Card>
            <CardHeader>결재 현황</CardHeader>
            <CardBody>
              <StatusGrid>
                <Stat className="agree" onClick={() => navigate("/approval/approvalList")} aria-label="긴급 결재">
                  <div className="cap">긴급 결재</div>
                  <div className="num">{counts.urgentCount}<span className="u">건</span></div>
                </Stat>
                <Stat className="prog" onClick={() => navigate("/approval/approvalList")} aria-label="반려 문서">
                  <div className="cap">반려 문서</div>
                  <div className="num">{counts.returnedCount}<span className="u">건</span></div>
                </Stat>
                <Stat className="done" onClick={() => navigate("/approval/approvalList")} aria-label="보류 문서">
                  <div className="cap">보류 문서</div>
                  <div className="num">{counts.holdCount}<span className="u">건</span></div>
                </Stat>
                <Stat className="wait" onClick={() => navigate("/approval/approvalList")} aria-label="대기 문서">
                  <div className="cap">대기 문서</div>
                  <div className="num">{counts.waitingCount}<span className="u">건</span></div>
                </Stat>
              </StatusGrid>
            </CardBody>
          </Card>
        </Section>

        {/* 최근 작성한 문서: 고정 높이 + 내부 스크롤 */}
        <Section>
          <FixedCard>
            <CardHeader>최근 작성한 문서</CardHeader>
            <CardBody>
              <ScrollArea>
                {loading ? (
                  <Empty>불러오는 중…</Empty>
                ) : errMsg ? (
                  <Empty>{errMsg}</Empty>
                ) : recentDrafts.length === 0 ? (
                  <Empty>최근 작성중인 문서가 없습니다.</Empty>
                ) : (
                  renderList(recentDrafts)
                )}
              </ScrollArea>
            </CardBody>
          </FixedCard>
        </Section>

        {/* 승인할 결재 문서: 고정 높이 + 내부 스크롤 */}
        <Section>
          <FixedCard>
            <CardHeader>승인할 결재 문서</CardHeader>
            <CardBody>
              <ScrollArea>
                {loading ? (
                  <Empty>불러오는 중…</Empty>
                ) : errMsg ? (
                  <Empty>{errMsg}</Empty>
                ) : toApprove.length === 0 ? (
                  <Empty>승인할 문서가 없습니다.</Empty>
                ) : (
                  renderList(toApprove)
                )}
              </ScrollArea>
            </CardBody>
          </FixedCard>
        </Section>
      </PageBody>
    </Wrapper>
  );
}
