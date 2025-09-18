// src/components/Approval/CompleteApprovalPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getApprovalApproveList } from "../motiveOn/api";

export default function CompleteApprovalPage({ headerOffset = 56 }) {
  const [tab, setTab] = useState("mine");      // mine | wait | approved | rejected | all
  const [field, setField] = useState("title"); // title | drafter | dept | form
  const [keyword, setKeyword] = useState("");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 응답 키 정규화 (대문자/스네이크 → UI 표준)
  const normalizeRow = (r = {}) => {
    const pick = (...keys) => keys.find((k) => r[k] !== undefined);
    return {
      signNo:     r[pick("signNo","SIGNNO","signno")],
      title:      r[pick("title","TITLE")] ?? "",
      docName:    r[pick("docName","DOCNAME","DOC_NAME","we.NAME","EMP_NAME")] ?? "",
      docDept:    r[pick("docDept","DOCDEPT","DOC_DEPT","dd.NAME")] ?? "",
      ddate:      r[pick("ddate","DDATE")] ?? null,
      edate:      r[pick("edate","EDATE")] ?? null,
      draftAt:    r[pick("draftAt","DRAFTAT")] ?? r[pick("ddate","DDATE")] ?? null,
      completeAt: r[pick("completeAt","COMPLETEAT")] ?? r[pick("edate","EDATE")] ?? null,
      formNo:     r[pick("formNo","FORMNO","SFORMNO")] ?? "",
      formName:   r[pick("formName","FORMNAME")] ?? r[pick("formNo","FORMNO","SFORMNO")] ?? "",
      emergency:  Number(r[pick("emergency","EMERGENCY")]) || 0,
      myState:    r[pick("myState","MYSTATE")] != null ? Number(r[pick("myState","MYSTATE")]) : undefined,
      docStatus:  r[pick("docStatus","DOCSTATUS","DOC_STATE","STATE")] != null
                    ? Number(r[pick("docStatus","DOCSTATUS","DOC_STATE","STATE")]) : undefined,
    };
  };

  // 목록 조회 (탭별/전체)
  const fetchList = useCallback(async (override = {}) => {
    setLoading(true);
    setErrMsg("");
    const base = {
      period: "all",
      field,
      q: keyword,
      page: 1,
      size: 50,
      ...override,
    };
    try {
      if (tab === "all") {
        // JSP의 '전체'처럼 탭별 결과 병합 + 중복 제거
        const tabs = ["mine", "wait", "approved", "rejected"];
        const resps = await Promise.all(
          tabs.map((t) => getApprovalApproveList({ ...base, tab: t }))
        );
        const mergedRaw = resps.flatMap((res) =>
          Array.isArray(res?.data?.content) ? res.data.content :
          Array.isArray(res?.data?.list)    ? res.data.list :
          Array.isArray(res?.data)          ? res.data : []
        );
        const map = new Map();
        for (const r of mergedRaw) {
          const n = normalizeRow(r);
          if (n?.signNo != null && !map.has(n.signNo)) map.set(n.signNo, n);
        }
        const list = [...map.values()];
        setRows(list);
        setTotal(list.length);
      } else {
        const res = await getApprovalApproveList({ ...base, tab });
        let raw =
          Array.isArray(res?.data?.content) ? res.data.content :
          Array.isArray(res?.data?.list)    ? res.data.list :
          Array.isArray(res?.data)          ? res.data : [];
        const list = raw.map(normalizeRow);
        setRows(list);
        const totalVal =
          (typeof res?.data?.totalElements === "number" && res.data.totalElements) ||
          (typeof res?.data?.totalCount === "number" && res.data.totalCount) ||
          list.length;
        setTotal(totalVal);
      }
    } catch (e) {
      console.error("[CompleteApprovalPage] load fail:", e);
      setErrMsg("목록을 불러오지 못했습니다.");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tab, field, keyword]);

  // 최초 + 탭 변경 시
  useEffect(() => { fetchList(); }, [tab, fetchList]);

  // 검색 실행(엔터/버튼)
  const handleSearch = () => fetchList();

  // 클라이언트측 2차 필터(입력중 즉시)
  const filtered = useMemo(() => {
    const kw = (keyword || "").trim().toLowerCase();
    return (rows || []).filter((r) => {
      let val = "";
      if (field === "title")      val = r.title || "";
      else if (field === "drafter") val = r.docName || "";
      else if (field === "dept")    val = r.docDept || "";
      else if (field === "form")    val = r.formName || r.formNo || "";
      return kw === "" || String(val).toLowerCase().includes(kw);
    });
  }, [rows, field, keyword]);

  return (
    <Wrapper style={{ top: headerOffset }}>
      <Frame>
        <PageHeader>결재 문서함</PageHeader>

        <Content>
          <Section>
            <Card>
              <CardHeader>
                <span>결재 문서함</span>
                <CountText>(총 {total}건)</CountText>
              </CardHeader>

              <CardBody>
                <HeaderRow>
                  <Tabs>
                    <Tab $active={tab === "mine"}     onClick={() => setTab("mine")}>내 차례</Tab>
                    <Tab $active={tab === "wait"}     onClick={() => setTab("wait")}>대기</Tab>
                    <Tab $active={tab === "approved"} onClick={() => setTab("approved")}>승인</Tab>
                    <Tab $active={tab === "rejected"} onClick={() => setTab("rejected")}>반려</Tab>
                    <Tab $active={tab === "all"}      onClick={() => setTab("all")}>전체</Tab>
                  </Tabs>

                  <SearchBar>
                    <Select value={field} onChange={(e) => setField(e.target.value)}>
                      <option value="title">제목</option>
                      <option value="drafter">기안자</option>
                      <option value="dept">부서</option>
                      <option value="form">결재양식</option>
                    </Select>
                    <Input
                      value={keyword}
                      placeholder="검색어를 입력하세요."
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    />
                    <SearchBtn type="button" title="검색" onClick={handleSearch}>🔎</SearchBtn>
                  </SearchBar>
                </HeaderRow>

                <ScrollArea>
                  {loading ? (
                    <Empty>불러오는 중…</Empty>
                  ) : errMsg ? (
                    <Empty>{errMsg}</Empty>
                  ) : filtered.length === 0 ? (
                    <Empty>표시할 문서가 없습니다.</Empty>
                  ) : (
                    <MobileList>
                      {filtered.map((row) => (
                        <ApproveDocCard key={row.signNo} row={row} />
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

/* ====== 카드/헬퍼 ====== */
function ApproveDocCard({ row }) {
  const navigate = useNavigate();
  const code = statusCodeOf(row.docStatus, row.myState);
  const date = row.ddate ?? row.draftAt ?? row.completeAt;

  return (
    <CardItem>
      {/* 1행: 제목 + 긴급 + 상태 */}
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
          <StatusPill code={code} />
        </div>
      </div>

      {/* 2행: 기안자 · 부서 */}
      <div className="sub">
        <span>{row.docName || "-"}</span>
        <Dot>·</Dot>
        <span className="muted">{row.docDept || "-"}</span>
      </div>

      {/* 3행: 문서번호 | 날짜 */}
      <div className="meta">
        <span className="mono">문서번호 {row.signNo}</span>
        <span className="date">{formatDotDate(date)}</span>
      </div>
    </CardItem>
  );
}

function statusCodeOf(docStatus, myState) {
  if (docStatus === 3) return "DONE";
  if (docStatus === 6) return "HOLD";
  if (myState === 2) return "REJECT";
  if (myState === 1) return "PROG";
  return "WAIT";
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
function StatusPill({ code }) {
  if (code === "DONE") return <Badge className="done">완료</Badge>;
  if (code === "HOLD") return <Badge className="hold">보류</Badge>;
  if (code === "REJECT") return <Badge className="rej">반려</Badge>;
  if (code === "PROG") return <Badge className="prog">진행중</Badge>; // JSP와 동일
  return <Badge className="wait">대기</Badge>;
}

/* ===================== styled ===================== */
/* 페이지 전체를 헤더 아래에 고정해서 외부 스크롤 제거 */
const Wrapper = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  /* top은 props로 주입: headerOffset */
  background: #fff;
  display: grid;
  place-items: center;     /* 가운데 정렬 */
  overflow: hidden;        /* 외부 스크롤 방지 */
`;

const Frame = styled.div`
  width: 100%;
  max-width: 420px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
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
  overflow: hidden;        /* 외부 스크롤 없음 */
`;

const Section = styled.section`
  height: 90%;
  padding: 8px 0;          /* 좌우 여백 제거 */
  &:last-of-type { padding-bottom: 0; }
  min-height: 0;
`;

const Card = styled.div`
  height: 100%;
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  margin: 0 8px;           /* 카드 좌우만 살짝 여백 */
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;        /* 스크롤바를 카드 라운드 안쪽으로 */
`;

const CardHeader = styled.div`
  position: relative;
  flex: 0 0 auto;
  padding: 8px 12px;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;
const CountText = styled.span`
  margin-left: 8px;
  font-weight: 500;
  color: #8b90a0;
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 카드 내부만 스크롤 */
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

/* 리스트 */
const MobileList = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0 0 6px;
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
  row-gap: 6px;
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
    grid-column: 1 / span 2; display: flex; gap: 6px;
    font-size: 12px; color: #374151;
    min-width: 0; overflow: hidden;
  }
  .muted { color: #6B7280; }
  .meta {
    grid-column: 1 / span 2; display: flex; align-items: center;
    font-size: 12px; color: #6B7280;
  }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .date { margin-left: auto; }
`;

const Dot = styled.span`
  color: #c1c7d0; padding: 0 2px;
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
  &.rej  { background:#fde8e8; color:#b01818; }
`;
