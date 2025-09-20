// src/components/Approval/DraftApprovalPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import FormPickerPage from "./FormPickerPage";
import BottomSheetModal from "../Common/BottomSheetModal"; // ← 경로/대소문자 확인
import { getApprovalDraftList } from "../motiveOn/api";

export default function DraftApprovalPage({ headerOffset = 56, onNewDraft }) {
  const navigate = useNavigate();

  // ✅ 바텀시트(폼 피커) - 단일 상태만 사용

  
  const [showFormPicker, setShowFormPicker] = useState(false);

  const [tab, setTab] = useState("ALL");        // ALL | WAIT | ING | HOLD | DONE
  const [field, setField] = useState("title");  // title | form | drafter
  const [keyword, setKeyword] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 페이지 전체 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // 응답 키 정규화
  const normalizeRow = (r = {}) => {
    const pick = (...keys) => keys.find((k) => r[k] !== undefined);
    return {
      signNo:       r[pick("signNo","SIGNNO","signno","SIGN_NO")] ?? r.signNo,
      title:        r[pick("title","TITLE")] ?? "",
      formName:
  r[pick("formName","FORMNAME","form_name",
         "CLASSNAME","CLASS_NAME","CLS.CLASSNAME","cls.CLASSNAME")]
  ?? r[pick("formNo","FORMNO","SFORMNO")]
  ?? "",
      formNo:       r[pick("formNo","FORMNO","SFORMNO")] ?? "",
      draftAt:      r[pick("draftAt","DRAFTAT","ddate","DDATE","UPDATED_OR_END")] ?? null,
      completeAt:   r[pick("completeAt","COMPLETEAT","edate","EDATE")] ?? null,
      emergency:    Number(r[pick("emergency","EMERGENCY")]) || 0,
      docStatus:    Number(r[pick("docStatus","DOCSTATUS","STATE","DOC_STATE")]) || 0,
      drafterName:  r[pick("drafterName","DRAFTERNAME","drafter_name","DOC_NAME","EMP_NAME")] ?? "",
    };
  };

  // 서버 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErrMsg("");
        const res = await getApprovalDraftList({
          page: 1, size: 50, period: "all", field: "title", q: ""
        });

        const raw = Array.isArray(res?.data?.content)
          ? res.data.content
          : Array.isArray(res?.data?.list)
          ? res.data.list
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const list = raw.map(normalizeRow);
        if (alive) setData(list);
      } catch (e) {
        console.error("[DraftApprovalPage] load fail:", e);
        if (alive) setErrMsg("목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const kw = (keyword || "").trim().toLowerCase();
    return (data || []).filter((r) => {
      const code = statusCodeOf(r.docStatus);
      const tabOk = tab === "ALL" || code === tab;

      let val = "";
      if (field === "title") val = r.title || "";
      else if (field === "form") val = r.formName || r.formNo || "";
      else if (field === "drafter") val = r.drafterName || "";

      const kwOk = kw === "" || String(val).toLowerCase().includes(kw);
      return tabOk && kwOk;
    });
  }, [data, tab, field, keyword]);

  // ✅ 서버 작성화면 이동 유틸
  const goCompose = (sformno) => {
    const url = `/approval/compose?sformno=${encodeURIComponent(sformno)}`;
    try {
      window.location.assign(url); // 서버 페이지로 이동
    } catch {
      navigate(url, { replace: true }); // (SPA 라우트가 있을 때만)
    }
  };

  // “새 결재” 버튼 → 바텀시트 열기
  const handleNewDraft = () => {
    if (typeof onNewDraft === "function") {
      onNewDraft();
      return;
    }
    setShowFormPicker(true); // ← 여기만 켜면 됨
  };

  // 폼 선택 시 작성화면으로 이동
  const handlePickForm = (picked) => {
    const sformno =
      typeof picked === "string"
        ? picked
        : picked?.sformno || picked?.SFORMNO || picked?.formNo || picked?.FORMNO;

    if (!sformno) {
      alert("양식 번호(sformno)를 확인할 수 없습니다.");
      return;
    }
    setShowFormPicker(false);
    goCompose(sformno);
  };

  return (
    <>
      <Wrapper style={{ top: headerOffset }}>
        <Frame>
          <PageHeader>기안 문서함</PageHeader>

          <Content>
            <Section>
              <Card>
                <CardHeader>
                  기안문서 목록
                  <BtnNewDraft type="button" onClick={handleNewDraft}>
                    ＋ 새 결재
                  </BtnNewDraft>
                </CardHeader>

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

      {/* ✅ 바텀시트 모달: 양식 선택을 바로 표시 */}
      <BottomSheetModal
        isOpen={showFormPicker}
        title="결재 양식 선택"
        onCancel={() => setShowFormPicker(false)}
      >
        <FormPickerPage onPick={handlePickForm} />
      </BottomSheetModal>
    </>
  );
}

/* ===================== Item Card & helpers ===================== */


function DocCard({ row }) {
  const navigate = useNavigate();
  return (
    <CardItem>
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
          {row.emergency === 1 && (
            <Badge className="emergency" $size="sm">⚡ 긴급</Badge>
          )}
        </div>
        <div className="right">
          <StatusPill docStatus={row.docStatus} />
        </div>
      </div>
      <div className="sub">
        <span>{row.formName ?? row.formNo}</span>
        <span className="date">{formatDotDate(row.draftAt || row.completeAt)}</span>
      </div>
    </CardItem>
  );
}

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
const Wrapper = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
  z-index: 1;
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
  overflow: hidden;
`;
const Section = styled.section`
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px 0;
  &:last-of-type { padding-bottom: 0; }
`;
const Card = styled.div`
  height: 100%;
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  margin: 0 8px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;
const CardHeader = styled.div`
  position: relative;
  flex: 0 0 auto;
  padding: 8px 12px;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;
const BtnNewDraft = styled.button`
  position: absolute; right: 10px; top: 6px;
  height: 25px; padding: 0 10px;
  border-radius: 8px; border: 1px solid #3A8DFE;
  background: #fff; color: #3A8DFE; font-weight: 700;
  cursor: pointer; z-index: 5; pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
`;
const CardBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
