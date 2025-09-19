import axios from "axios";

export function getnoticemain() {
  return axios.get('/api/notice/main');
}
export function getCalendarList() {
  const loginUser = JSON.parse(sessionStorage.getItem("user-storage"));
  const eno = loginUser?.state?.user?.eno;

  return axios.get(`/api/calendar/list?Eno=${eno}`);
}

//  일정 등록
export function registCalendar(calendar) {
  const loginUser = JSON.parse(sessionStorage.getItem("user-storage"));
  const eno = loginUser?.state?.user?.eno;
  return axios.post(`/api/calendar/regist?Eno=${eno}`, calendar);
}

// 일정 수정
export function modifyCalendar(calendar) {
  const loginUser = JSON.parse(sessionStorage.getItem("user-storage"));
  const eno = loginUser?.state?.user?.eno;

  return axios.post(`/api/calendar/modify?Eno=${eno}`, calendar);
}


// 일정 삭제

export function deleteCalendar(ccode) {
  const loginUser = JSON.parse(sessionStorage.getItem("user-storage"));
  const eno = loginUser?.state?.user?.eno;

  return axios.post("/api/calendar/delete", { ccode, eno });
}


// ---------------------------------------------------------------------------//
// 로그인 사용자 eno 가져오기
function getEno() {
  const loginUser = JSON.parse(sessionStorage.getItem("user-storage"));
  return loginUser?.state?.user?.eno;   // ✅ eno만 반환
}

// 요청한 업무 리스트
export function getRequestedWork() {
  const eno = getEno();
  return axios.get(`/api/work/toReqList?Eno=${eno}`);
}

// 내가 담당자인 업무 리스트
export function getMyWorkList() {
  const eno = getEno();
  return axios.get(`/api/work/myWorkList?eno=${eno}`);
}

// 부서 업무 리스트
export function getDepWorkList(dno) {
  return axios.get(`/api/work/depWorkList?dno=${dno}`);
}

// 업무 상세 조회
export function getWorkDetail(wcode) {
  return axios.get(`/api/work/detail?wcode=${wcode}`);
}
// 업무 등록
export function registWork(workData, ownerEnos = []) {
  const eno = getEno(); // 로그인 사용자 eno
  return axios.post(`/api/work/regist`, workData, {
    params: {
      requesterEno: eno,
      ownerEno: ownerEnos, // 👉 배열 그대로 넘기기
    },
  });
}


// ✅ 업무 수정 (Calendar modify와 동일 스타일)
export function modifyWork(workData) {
  const eno = getEno();
  return axios.post(`/api/work/modify?Eno=${eno}`, workData);
}


// 업무 삭제 API
export const deleteWork = (wcode) => {
  return axios.post(`/api/work/delete?wcode=${wcode}`);
};


// 업무 상태 변경
export function updateWorkStatus(wcode, status) {
  const eno = getEno();
  return axios.post(`/api/work/updateStatus?wcode=${wcode}&status=${status}&eno=${eno}`);
}

// 승인
export function approveWork(wcode) {
  const eno = getEno();
  return axios.post(`/api/work/approve?wcode=${wcode}&eno=${eno}`);
}

// 반려
export function rejectWork(wcode, reason) {
  const eno = getEno();
  return axios.post(`/api/work/reject?wcode=${wcode}&reason=${reason}&eno=${eno}`);
}

// 이의 제기
export function objectionWork(wcode, reason) {
  const eno = getEno();
  return axios.post(`/api/work/objection?wcode=${wcode}&reason=${reason}&eno=${eno}`);
}

// 협업 요청
export function requestCollab(wcode, enos) {
  const eno = getEno();
  return axios.post(`/api/work/requestCollab?wcode=${wcode}&requesterEno=${eno}`, null, {
    params: { enos },
  });
}

// 대리 요청
export function requestDelegate(wcode, delegateEno) {
  const eno = getEno();
  return axios.post(`/api/work/requestDelegate?wcode=${wcode}&eno=${delegateEno}&requesterEno=${eno}`);
}






// ================== 조직도 ================== //

export function getOrgTree() {
  return axios.get("/api/org/tree");   // 👉 프록시 + 컨트롤러 매핑 일치
}

export function getOrgChildren(parent = "#") {
  return axios.get("/api/org/children", { params: { parent } });
}


// ---------------------------------------------------------------------------------------------//


/* ======== 전자결재(Approval) API 추가 ======== */

// 대시보드 홈(카운트 + 최근작성 + 결재할 문서)
export function getApprovalHome() {
  return axios.get(`/api/approval/home.json`);
}

// 열람함 목록
export function getApprovalViewerList(params = {}) {
  const p = {
    period: "all",
    field: "title",
    q: "",
    page: 1,
    size: 10,
    ...params,
  };
  const qs = new URLSearchParams(p).toString();
  return axios.get(`/api/approval/viewerList.json?${qs}`);
}

// 기안함 목록
export function getApprovalDraftList(params = {}) {
  const p = {
    period: "all",
    field: "title",
    q: "",
    page: 1,
    size: 10,
    ...params,
  };
  const qs = new URLSearchParams(p).toString();
  return axios.get(`/api/approval/draftList.json?${qs}`);
}

export async function getApprovalApproveList(params = {}) {
  const p = {
    tab: "mine",
    period: "all",
    field: "title",
    q: "",
    urgent: 0,
    page: 1,
    size: 10,
    ...params,
  };
  const qs = new URLSearchParams(p).toString();

  try {
    // 기본 경로
    return await axios.get(`/api/approval/approveList.json?${qs}`, {
      headers: { Accept: "application/json" },
      withCredentials: true,
    });
  } catch (err) {
    // 혹시 컨텍스트/매핑 차이로 404면 폴백 경로 한번 더 시도
    if (err?.response?.status === 404) {
      return await axios.get(`/approval/approveList.json?${qs}`, {
        headers: { Accept: "application/json" },
        withCredentials: true,
      });
    }
    throw err;
  }
}

// 상세
export function getApprovalDetail(signNo) {
  return axios.get(`/api/approval/detail.json?signNo=${encodeURIComponent(signNo)}`);
}


/* ======== 임시문서함 목록(템플릿) ======== */
// 컨트롤러: ApprovalController2.tempListJson (GET /api/approval/tempList.json)
// PageResponse 형태: { content, page, size, totalElements, totalPages }
export function getApprovalTempList(params = {}) {
  const p = {
    period: "all",
    field: "title",
    q: "",
    page: 1,
    size: 50,   // 모바일은 한번에 넉넉히
    ...params,
  };
  const qs = new URLSearchParams(p).toString();
  return axios.get(`/api/approval/tempList.json?${qs}`);
}


// 임시저장(JSON 바디)
export function tempSaveApproval(vo) {
  return axios.post(`/api/approval/temp-save`, vo);
}

// 임시보관함 다건 삭제(JSON 바디: ids 배열)
export function deleteTempApprovals(ids) {
  return axios.post(`/api/approval/temp/delete.json`, { ids });
}

// 본 저장(JSON 바디)
export function saveApproval(vo) {
  return axios.post(`/api/approval/save`, vo);
}

// 결재선 처리(승인/반려) — 서버가 폼 POST + 리다이렉트하는 엔드포인트
export function actApprovalLine({ signNo, action, comment = "" }) {
  const form = new URLSearchParams();
  form.append("signNo", signNo);
  form.append("action", action); // "approve" | "reject"
  if (comment) form.append("comment", comment);

  return axios.post(`/api/approval/line/act`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

/** 양식 분류 목록 */
export function getFormClasses() {
  return client.get("/api/approval/formClasses.json");
}

/** 양식 목록 (검색/분류/페이징) */
export function getForms({ q = "", classNo, page = 1, size = 50 } = {}) {
  const qs = toQuery({ q, classNo, page, size });
  return client.get(`/api/approval/forms.json?${qs}`);
}

/** 양식 단건 조회 */
export function getFormByNo(sformno) {
  return client.get(`/api/approval/form.json?${toQuery({ sformno })}`);
}