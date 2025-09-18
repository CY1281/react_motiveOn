import { create } from "zustand";

const useOrgStore = create((set) => ({
  orgData: [
    {
      deptName: "경영지원팀",
      employees: [
        { eno: 1, name: "이민진", position: "사원" },
        { eno: 2, name: "차영석", position: "경영지원팀장" },
      ],
    },
    {
      deptName: "기술기획팀",
      employees: [{ eno: 3, name: "강민규", position: "팀장" }],
    },
    {
      deptName: "디자인팀",
      employees: [{ eno: 4, name: "최세빈", position: "사원" }],
    },
    {
      deptName: "품질관리팀",
      employees: [{ eno: 5, name: "장혁진", position: "사원" }],
    },
  ],
  fetchOrgData: async () => {
    // 나중에 STS API 연결 시 axios.get("/api/org/tree")로 교체
  },
}));

export default useOrgStore;




// import { create } from "zustand";

// // Zustand 전역 상태 관리
// export const useOrgStore = create((set) => ({
//   // 초기 Mock 데이터 (백엔드 없이 테스트 가능)
//   orgData: [
//     {
//       id: "dept-1",
//       name: "경영지원팀",
//       type: "department",
//       children: [
//         { id: "emp-1", name: "이민진", type: "employee", position: "사원" },
//         { id: "emp-2", name: "차영석", type: "employee", position: "팀장" }
//       ]
//     },
//     {
//       id: "dept-2",
//       name: "기술기획팀",
//       type: "department",
//       children: [
//         { id: "emp-3", name: "강민규", type: "employee", position: "팀장" }
//       ]
//     }
//   ],

//   // ✅ fetch 함수 (나중에 API 연결 시 교체)
//   fetchOrgData: async () => {
//     console.log("현재는 mock 데이터 사용 중입니다.");
//     // 백엔드 API 연결 시 아래 주석 풀고 사용
//     /*
//     try {
//       const res = await axios.get("http://localhost:8080/api/org/tree");
//       set({ orgData: res.data });
//     } catch (err) {
//       console.error("조직도 데이터 불러오기 실패:", err);
//     }
//     */
//   },
// }));