// src/components/Approval/ApprovalPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

/** =========================================================
 *  ApprovalPage (모바일 전자결재 홈) - 모바일 전용
 * ========================================================= */
export default function ApprovalPage() {
  // TODO: API 연동 시 useEffect로 counts / recentDrafts / toApprove를 불러오세요.
  const counts = { urgentCount: 2, returnedCount: 1, holdCount: 3, waitingCount: 4 };

  const recentDrafts = [
    {
      signNo: 101,
      title: "지출 결의서 제목",
      formNo: "F-001",
      formName: "지출결의서",
      draftAt: "2025-09-10",
      emergency: 0,
      docStatus: 2,
    },
    {
      signNo: 102,
      title: "휴가 신청서 제목",
      formNo: "F-105",
      formName: "휴가신청서",
      draftAt: "2025-09-08",
      emergency: 1,
      docStatus: 2,
    },
  ];

  const toApprove = [
    {
      signNo: 201,
      title: "출장 보고서 제목",
      formNo: "F-077",
      formName: "출장보고서",
      draftAt: "2025-09-09",
      emergency: 0,
      docStatus: 4,
    },
  ];

  return (
    <ApprovalHomeMobile counts={counts} recentDrafts={recentDrafts} toApprove={toApprove} />
  );
}

/* ===================== styled ===================== */
const Wrapper = styled.div`
  background: #fff;
  color: #2b2f3a;
  min-height: 100vh;
`;

const PageHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 700;
`;

const Section = styled.section`
  padding: 8px 0; /* 좌우 여백 제거 */
`;

const Card = styled.div`
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  margin: 0 8px; /* 카드 좌우만 살짝 여백 */
`;

const CardHeader = styled.div`
  padding: 8px 12px;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const CardBody = styled.div`
  padding: 8px 10px;
`;

const MobileList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;          /* ✅ ul 기본 margin 제거 */
  padding: 0;         /* ✅ ul 기본 padding 제거 */
  list-style: none;   /* ✅ 불릿 제거 */
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
  .titleLeft {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .title {
    font-weight: 700;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .right {
    justify-self: end;
  }
  .sub {
    font-size: 12px;
    color: #6b7280;
    grid-column: 1 / span 2;
    display: flex;
    gap: 10px;
  }
  .date {
    margin-left: auto;
    font-size: 12px;
    color: #6b7280;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 10px 8px;
  cursor: pointer;

  .cap {
    font-weight: 700;
    color: #4b5563;
    font-size: 13px;
  }
  .num {
    margin-top: 2px;
    font-weight: 800;
    color: #111827;
    font-size: 17px;
  }
  .u {
    margin-left: 2px;
    color: #6b7280;
    font-weight: 700;
    font-size: 12px;
  }

  &.agree {
    background: #f4d4ed;
  }
  &.prog {
    background: #f6d6c6;
  }
  &.done {
    background: #fff7ae;
  }
  &.wait {
    background: #e3e7ef;
  }
`;

const Empty = styled.div`
  color: #95a1af;
  text-align: center;
  padding: 28px 0;
  font-size: 13px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${(p) => (p.$size === "sm" ? "3px 8px" : "6px 12px")};
  border-radius: 999px;
  font-size: ${(p) => (p.$size === "sm" ? "11px" : "12px")};
  font-weight: 800;

  &.emergency {
    background: #fde8e8;
    color: #b01818;
    border: 1px solid #f5c2c2;
  }
  &.wait {
    background: #eef2f6;
    color: #6b7280;
  }
  &.prog {
    background: rgba(58, 141, 254, 0.12);
    color: #3a8dfe;
  }
  &.done {
    background: rgba(39, 174, 96, 0.12);
    color: #27ae60;
  }
  &.hold {
    background: rgba(244, 180, 0, 0.16);
    color: #c48a00;
  }
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
  if (!s) return "";
  return "~ " + s.replaceAll("-", ".");
}

function StatusPill({ docStatus }) {
  if (docStatus === 3) return <Badge className="done">완료</Badge>;
  if (docStatus === 4) return <Badge className="wait">반려</Badge>;
  if (docStatus === 6) return <Badge className="hold">보류</Badge>;
  return <Badge className="prog">진행중</Badge>;
}

/* ===================== UI ===================== */
function ApprovalHomeMobile({ counts, recentDrafts, toApprove }) {
  const navigate = useNavigate();

  const renderList = (list) => (
    <MobileList>
      {list.map((row) => (
        <CardItem key={row.signNo}>
          {/* 제목 + 긴급 + 상태 */}
          <div className="titleRow">
            <div className="titleLeft">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/approval/detail?signNo=${row.signNo}`);
                }}
                className="title"
                title={row.title}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {row.title}
              </a>
              {row.emergency === 1 && (
                <Badge className="emergency" $size="sm">
                  ⚡ 긴급
                </Badge>
              )}
            </div>
            <div className="right">
              <StatusPill docStatus={row.docStatus} />
            </div>
          </div>

          {/* 양식 이름 + 날짜 */}
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

      {/* 결재 현황 */}
      <Section>
        <Card>
          <CardHeader>결재 현황</CardHeader>
          <CardBody>
            <StatusGrid>
              <Stat
                className="agree"
                onClick={() => navigate("/approval?tab=mine&urgent=1")}
                aria-label="긴급 결재"
              >
                <div className="cap">긴급 결재</div>
                <div className="num">
                  {counts.urgentCount}
                  <span className="u">건</span>
                </div>
              </Stat>

              <Stat
                className="prog"
                onClick={() => navigate("/approval?tab=rejected")}
                aria-label="반려 문서"
              >
                <div className="cap">반려 문서</div>
                <div className="num">
                  {counts.returnedCount}
                  <span className="u">건</span>
                </div>
              </Stat>

              <Stat
                className="done"
                onClick={() => navigate("/approval?tab=hold")}
                aria-label="보류 문서"
              >
                <div className="cap">보류 문서</div>
                <div className="num">
                  {counts.holdCount}
                  <span className="u">건</span>
                </div>
              </Stat>

              <Stat
                className="wait"
                onClick={() => navigate("/approval?tab=mine")}
                aria-label="대기 문서"
              >
                <div className="cap">대기 문서</div>
                <div className="num">
                  {counts.waitingCount}
                  <span className="u">건</span>
                </div>
              </Stat>
            </StatusGrid>
          </CardBody>
        </Card>
      </Section>

      {/* 최근 작성한 문서 */}
      <Section>
        <Card>
          <CardHeader>최근 작성한 문서</CardHeader>
          <CardBody>
            {recentDrafts.length === 0 ? (
              <Empty>최근 작성중인 문서가 없습니다.</Empty>
            ) : (
              renderList(recentDrafts)
            )}
          </CardBody>
        </Card>
      </Section>

      {/* 승인할 결재 문서 */}
      <Section>
        <Card>
          <CardHeader>승인할 결재 문서</CardHeader>
          <CardBody>
            {toApprove.length === 0 ? (
              <Empty>승인할 문서가 없습니다.</Empty>
            ) : (
              renderList(toApprove)
            )}
          </CardBody>
        </Card>
      </Section>
    </Wrapper>
  );
}