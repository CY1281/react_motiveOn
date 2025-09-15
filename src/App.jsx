// src/App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Common/Layout";
import ModalWrapper from "./components/common/ModalWrapper";

// 페이지들
import HomePage from "./components/Home/HomePage";
import CalendarPage from "./components/Calendar/CalendarPage";

// 업무
import WorkPage from "./components/Work/WorkPage";
import MyWorkPage from "./components/Work/MyWorkPage";
import RequestedWorkPage from "./components/Work/RequestedWorkPage";

// 전자결재
import ApprovalPage from "./components/Approval/ApprovalPage";
import ReferenceApprovalPage from "./components/Approval/ReferenceApprovalPage";
import DraftApprovalPage from "./components/Approval/DraftApprovalPage";
import TempApprovalPage from "./components/Approval/TempApprovalPage";
import CompleteApprovalPage from "./components/Approval/CompleteApprovalPage";
import ApprovalDetailPage from "./components/Approval/ApprovalDetailPage";
import FormPickerPage from "./components/Approval/FormPickerPage";
import ApprovalComposePage from "./components/Approval/ApprovalComposePage";

// 공지
import Notice from "./components/motiveOn/Notice";

/** compose 래퍼 */
function ComposeRoute() {
  const handleTempSave = async () => ({ ok: true });
  const handleSubmitDraft = async () => ({ ok: true, signNo: "A-2025-000123" });
  return <ApprovalComposePage onTempSave={handleTempSave} onSubmitDraft={handleSubmitDraft} />;
}

/** 전자결재 섹션 쉘 (중첩 라우트 Outlet) */
function ApprovalShell() {
  return <Outlet />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          {/* 홈 */}
          <Route index element={<HomePage />} />

          {/* 일정 */}
          <Route path="/calendar" element={<CalendarPage />} />

          {/* 업무 */}
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/my" element={<MyWorkPage />} />
          <Route path="/work/requests" element={<RequestedWorkPage />} />

          {/* 전자결재 (중첩) */}
          <Route path="/approval" element={<ApprovalShell />}>
            <Route index element={<ApprovalPage />} />
            <Route path="viewerList" element={<ReferenceApprovalPage />} />
            <Route path="draftList" element={<DraftApprovalPage />} />
            <Route path="tempList" element={<TempApprovalPage />} />
            <Route path="completeList" element={<CompleteApprovalPage />} />
            <Route path="detail/:signNo" element={<ApprovalDetailPage headerOffset={56} />} />
            <Route path="form-picker" element={<FormPickerPage />} />
            <Route path="compose" element={<ComposeRoute />} />
            {/* 섹션 내부 404 */}
            <Route path="*" element={<Navigate to="/approval" replace />} />
          </Route>

          {/* 공지 */}
          <Route path="/notice" element={<Notice />} />

          {/* 전체 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* 전역 모달: 항상 한 번만 마운트 */}
      <ModalWrapper />
    </>
  );
}
