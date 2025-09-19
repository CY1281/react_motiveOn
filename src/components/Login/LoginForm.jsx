import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'
import logo from "../../assets/img/motiveon-login.png";
import Button from '../common/Button'
import InputField from '../common/InputField'
import bgImage from "../../assets/img/빌딩.jpg";
import axios from 'axios';

// ✅ 별도 파일로 분리된 Zustand store 불러오기
import { useUserStore } from "../../store/userStore";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: url(${bgImage}) no-repeat center center/cover;
  background-position: 30% 20%;  /* X축 30%, Y축 20% 위치 기준 */
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Box = styled.div`
  width: 390px;
  height: 844px;
  background-color: rgba(255, 255, 255, 0.75);
  padding: 2em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

const Logo = styled.img` 
  width: 65%;
  margin-bottom: 20px;
`;

const LinkText = styled.a`
  font-size: 13px;
  color: #444;
  margin-top: 10px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function Login() {
  const navigate = useNavigate();
  const [eno, setEno] = useState("");
  const [password, setPassword] = useState("");
  const buttonRef = useRef(null);

  const { login } = useUserStore();

  async function handleSubmit(e) {
    if (e) e.preventDefault(); // form 제출 기본 동작 방지

    try {
      const res = await axios.post("/api/commons/login", {
        eno: eno,
        pwd: password,
      });

      // ✅ 로그인 성공 시 실행
      if (res.status === 200 && res.data) {
        login(res.data);     // Zustand store에 전체 user 객체 저장
        navigate("/home");   // 홈 화면으로 이동
      }
    } catch (error) {
      alert("로그인 실패: 사번 또는 비밀번호를 확인하세요.");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(); // 바로 실행
    }
  }

  return (
    <Container>
      <Box>
        <Logo src={logo} alt="logo" />
        {/* ✅ form으로 묶어서 Enter 자동 처리 */}
        <form
          style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}
          onSubmit={handleSubmit}
        >
          <InputField
            type="text"
            value={eno}
            onChange={(e) => setEno(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=" 사번을 입력하세요."
          />
          <InputField
            type="password"
            value={password}
            autoComplete="off"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=" 비밀번호를 입력하세요."
          />
          <Button ref={buttonRef} type="submit" label="로그인" />
        </form>
        <LinkText onClick={() => navigate("/Login/PasswordFind")}>
          비밀번호를 잊으셨나요?
        </LinkText>
      </Box>
    </Container>
  );
}

export default Login;