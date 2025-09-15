// src/components/Approval/ReferenceBoxPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

/** =========================================================
 *  ReferenceBoxPage (모바일 참조 문서함)
 *  - 화면 상단 헤더 아래에 "고정" (position: fixed)
 *  - 외부 스크롤 제거, 카드 내부 리스트만 스크롤
 *  - headerOffset: 상단 고정 헤더 높이(px) (기본 56)
 * ========================================================= */
export default function ReferenceBoxPage({
  items = MOCK_ITEMS,
  headerOffset = 56,
}) {
  const [tab, setTab] = useState("ALL");        // ALL | WAIT | ING | HOLD | DONE
  const [field, setField] = useState("title");  // title | form | drafter
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const kw = (keyword || "").trim().toLowerCase();
    return (items || []).filter((r) => {
      const code = statusCodeOf(r.docStatus);
      const tabOk = tab === "ALL" || code === tab;

      let val = "";
      if (field === "title") val = r.title || "";
      else if (field === "form") val = r.formName || r.formNo || "";
      else if (field === "drafter") val = r.drafterName || "";

      const kwOk = kw === "" || val.toLowerCase().includes(kw);
      return tabOk && kwOk;
    });
  }, [items, tab, field, keyword]);

  return (
    <Wrapper style={{ top: headerOffset }}>
      <Frame>
        <PageHeader>참조 문서함</PageHeader>

        <Content>
          <Section>
            <Card>
              <CardHeader>참조 문서 목록</CardHeader>

              <CardBody>
                <HeaderRow>
                  <Tabs>
                    <Tab $active={tab === "ALL"}  onClick={() => setTab("ALL")}>전체</Tab>
                    <Tab $active={tab === "WAIT"} onClick={() => setTab("WAIT")}>대기</Tab>
                    <Tab $active={tab === "ING"}  onClick={() => setTab("ING")}>진행</Tab>
                    <Tab $active={tab === "HOLD"} onClick={() => setTab("HOLD")}>보류</Tab>
                    <Tab $active={tab === "DONE"} onClick={() => setTab("DONE")}>완료</Tab>
                  </Tabs>

                  <SearchBar>
                    <Select value={field} onChange={(e) => setField(e.target.value)}>
                      <option value="title">제목</option>
                      <option value="form">결재양식</option>
                      <option value="drafter">기안자</option>
                    </Select>
                    <Input
                      value={keyword}
                      placeholder="검색어를 입력하세요."
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                    />
                    <SearchBtn type="button" title="검색">🔎</SearchBtn>
                  </SearchBar>
                </HeaderRow>

                {/* ✅ 카드 내부만 세로 스크롤 (스크롤바도 카드 라운드 안쪽) */}
                <ScrollArea>
                  {filtered.length === 0 ? (
                    <Empty>표시할 문서가 없습니다.</Empty>
                  ) : (
                    <MobileList>
                      {filtered.map((row) => (
                        <DocCard key={row.signNo} row={row} />
                      ))}
                    </MobileList>
                  )}
                </ScrollArea>
              </CardBody>
            </Card>
          </Section>
        </Content>
      </Frame>
    </Wrapper>
  );
}

/* ===================== Item Card ===================== */
function DocCard({ row }) {
  const navigate = useNavigate();
  return (
    <CardItem>
      {/* 1행: 제목 + 긴급 + 상태 */}
      <div className="titleRow">
        <div className="titleLeft">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate(`/approval/detail?signNo=${row.signNo}`); }}
            className="title"
            title={row.title}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {row.title}
          </a>
          {row.emergency === 1 && (
            <Badge className="emergency" $size="sm">⚡ 긴급</Badge>
          )}
        </div>
        <div className="right">
          <StatusPill docStatus={row.docStatus} />
        </div>
      </div>

      {/* 2행: 양식이름 | 날짜(~ yyyy.MM.dd) */}
      <div className="sub">
        <span>{row.formName ?? row.formNo}</span>
        <span className="date">{formatDotDate(row.draftAt || row.completeAt)}</span>
      </div>
    </CardItem>
  );
}

/* ===================== helpers ===================== */
function statusCodeOf(docStatus) {
  if (docStatus === 3) return "DONE";
  if (docStatus === 6) return "HOLD";
  if (docStatus === 0) return "WAIT";
  return "ING";
}
function formatDateLike(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(+d)) return String(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function formatDotDate(value) {
  const s = formatDateLike(value);
  return s ? `~ ${s.replaceAll("-", ".")}` : "";
}
function StatusPill({ docStatus }) {
  const code = statusCodeOf(docStatus);
  if (code === "DONE") return <Badge className="done">완료</Badge>;
  if (code === "HOLD") return <Badge className="hold">보류</Badge>;
  if (code === "WAIT") return <Badge className="wait">대기</Badge>;
  return <Badge className="prog">진행중</Badge>;
}

/* ===================== styled ===================== */
/* 페이지 자체를 헤더 아래에 "고정" */
const Wrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  /* top은 props에서 style로 주입 (headerOffset) */
  background: #fff;
  display: grid;
  place-items: center;    /* 가운데 정렬 */
  overflow: hidden;       /* 외부 스크롤 방지 */
  z-index: 0;
`;

const Frame = styled.div`
  width: 100%;
  max-width: 420px;       /* 필요시 440~480px 조절 */
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;       /* 외곽으로 새는 스크롤/바운스 방지 */
`;

const PageHeader = styled.header`
  flex: 0 0 auto;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 700;
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;       /* 외부 스크롤 없음 */
`;

const Section = styled.section`
  height: 90%;
  padding: 8px 0;         /* 좌우 여백 제거 */
  &:last-of-type { padding-bottom: 0; }
  min-height: 0;
`;

const Card = styled.div`
  height: 100%;
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  margin: 0 8px;          /* 카드 좌우만 살짝 여백 */
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;       /* 스크롤바를 카드 라운드 안쪽으로 가둠 */
`;

const CardHeader = styled.div`
  flex: 0 0 auto;
  padding: 8px 12px;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* 리스트만 세로 스크롤 */
const ScrollArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  /* 스크롤바 스타일 (카드 안쪽에 표시) */
  scrollbar-gutter: stable;
  scrollbar-width: thin;                 /* Firefox */
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

/* 상단 컨트롤 */
const HeaderRow = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  min-width: 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(0,0,0,.06);
  min-width: 0;
`;
const Tab = styled.button`
  appearance: none;
  border: 1px solid #ccc;
  border-bottom: none;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#6ec1e4" : "#ddd")};
  color: ${({ $active }) => ($active ? "#000" : "#333")};
  border-radius: 6px 6px 0 0;
  & + & { margin-left: -1px; }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  width: 100%;
  max-width: 420px;
  min-width: 0;
`;
const Select = styled.select`
  height: 36px; font-size: 14px; padding: 0 8px; flex: 0 0 110px;
  border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;
`;
const Input = styled.input`
  height: 36px; font-size: 14px; padding: 0 10px; flex: 1 1 auto;
  border: 1px solid #e5e7eb; border-radius: 8px; min-width: 0;
`;
const SearchBtn = styled.button`
  height: 36px; padding: 0 10px; border: none; border-radius: 8px;
  background: #2C3E50; color: #fff; cursor: pointer;
`;

/* 리스트 */
const MobileList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0 0 6px;        /* 마지막 아이템 하단 여유 */
  list-style: none;
  overflow-x: hidden;
`;

const CardItem = styled.li`
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16,24,40,.04);
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 4px;
  column-gap: 6px;
  min-width: 0;

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
    grid-column: 1 / span 2; display: flex; gap: 10px;
    font-size: 12px; color: #6B7280;
    min-width: 0; overflow: hidden;
  }
  .date { margin-left: auto; font-size: 12px; color: #6B7280; }
`;

const Empty = styled.div`
  color: #95A1AF;
  text-align: center;
  padding: 28px 0;
  font-size: 13px;
`;

const Badge = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: ${({ $size }) => ($size === "sm" ? "3px 8px" : "6px 12px")};
  border-radius: 999px; font-size: ${({ $size }) => ($size === "sm" ? "11px" : "12px")};
  font-weight: 800;

  &.emergency { background:#FDE8E8; color:#B01818; border:1px solid #F5C2C2; }
  &.wait { background:#EEF2F6; color:#6B7280; }
  &.prog { background:rgba(58,141,254,.12); color:#3A8DFE; }
  &.done { background:rgba(39,174,96,.12); color:#27AE60; }
  &.hold { background:rgba(244,180,0,.16); color:#C48A00; }
`;

/* ===================== demo mock ===================== */
const MOCK_ITEMS = [
  { signNo: 301, title: "지출 정산서 제목", formNo: "F-009", formName: "정산서",     drafterName: "최유진", completeAt: "2025-09-07", emergency: 0, docStatus: 3 },
  { signNo: 302, title: "지출 결의서 제목", formNo: "F-001", formName: "지출결의서", drafterName: "김민수", draftAt: "2025-09-10", emergency: 0, docStatus: 2 },
  { signNo: 303, title: "휴가 신청서 제목", formNo: "F-105", formName: "휴가신청서", drafterName: "이서준", draftAt: "2025-09-08", emergency: 1, docStatus: 0 },
  { signNo: 304, title: "출장 보고서 제목", formNo: "F-077", formName: "출장보고서", drafterName: "박지훈", draftAt: "2025-09-09", emergency: 0, docStatus: 6 },
  { signNo: 301, title: "지출 정산서 제목", formNo: "F-009", formName: "정산서",     drafterName: "최유진", completeAt: "2025-09-07", emergency: 0, docStatus: 3 },
  { signNo: 302, title: "지출 결의서 제목", formNo: "F-001", formName: "지출결의서", drafterName: "김민수", draftAt: "2025-09-10", emergency: 0, docStatus: 2 },
  { signNo: 303, title: "휴가 신청서 제목", formNo: "F-105", formName: "휴가신청서", drafterName: "이서준", draftAt: "2025-09-08", emergency: 1, docStatus: 0 },
  { signNo: 304, title: "출장 보고서 제목", formNo: "F-077", formName: "출장보고서", drafterName: "박지훈", draftAt: "2025-09-09", emergency: 0, docStatus: 6 },
];
