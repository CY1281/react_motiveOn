import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

// ===== Login =====
import LoginForm from './components/Login/LoginForm';
import PasswordConfirm from './components/Login/PasswordComfirm';
import PasswordError from './components/Login/PasswordError';
import PasswordFind from './components/Login/PasswordFind';

// ===== Work =====
import MyWorkPage from './components/Work/MyWorkPage';
import RequestedWorkPage from './components/Work/RequestedWorkPage';
import WorkDetail from './components/Work/WorkDetail';
import WorkDetailEdit from './components/Work/WorkDetailEdit';
import WorkPage from './components/Work/WorkPage';
import WorkRegist from './components/Work/WorkRegist';

// ===== Common =====
import Layout from './components/common/Layout';
import OrgTree from './components/common/OrgTree';
import HomePage from './components/Home/HomePage';

// 전자결재
import ApprovalPage from "./components/Approval/ApprovalPage";
import ReferenceApprovalPage from "./components/Approval/ReferenceApprovalPage";
import DraftApprovalPage from "./components/Approval/DraftApprovalPage";
import TempApprovalPage from "./components/Approval/TempApprovalPage";
import CompleteApprovalPage from "./components/Approval/CompleteApprovalPage";
import ApprovalDetailPage from "./components/Approval/ApprovalDetailPage";
import FormPickerPage from "./components/Approval/FormPickerPage";
import ApprovalComposePage from "./components/Approval/ApprovalComposePage";


const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Poppins;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <Routes>

        {/* ===== Login 관련 (Layout 없음) ===== */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/login/passwordConfirm" element={<PasswordConfirm />} />
        <Route path="/login/passwordError" element={<PasswordError />} />
        <Route path="/login/passwordFind" element={<PasswordFind />} />

        {/* ===== Work 관련 (Layout 포함) ===== */}
        <Route element={<Layout />}>
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/myworklist" element={<MyWorkPage />} />
          <Route path="/work/reqlist" element={<RequestedWorkPage />} />
          <Route path="/work/detail/:wcode" element={<WorkDetail />} />
          <Route path="/work/detailedit" element={<WorkDetailEdit />} />
          <Route path="/work/regist" element={<WorkRegist />} />
          <Route path="/common/OrgTree" element={<OrgTree />} />

            {/* 전자결재 (중첩) */}
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/approval/viewerList" element={<ReferenceApprovalPage />} />
            <Route path="/approval/draftList" element={<DraftApprovalPage />} />
            <Route path="/approval/tempList" element={<TempApprovalPage />} />
            <Route path="/approval/ApprovalList" element={<CompleteApprovalPage />} />
            <Route path="/approval/detail/:signNo" element={<ApprovalDetailPage headerOffset={56} />} />
            <Route path="/approval/form-picker" element={<FormPickerPage />} />
            <Route path="/approval/compose" element={<ApprovalComposePage />} />
        
          </Route>

        <Route element={<Layout />}>
          <Route path='/home' element={<HomePage />} />
        </Route>

        {/* ===== 기본 경로 처리 (로그인으로 리디렉션) ===== */}
        <Route path="*" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;


