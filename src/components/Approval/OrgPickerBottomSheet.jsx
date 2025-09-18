// src/components/Approval/OrgPickerBottomSheet.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import useOrgStore from "../../store/orgStore";
import BottomSheetModal from "../common/BottonSheetModal"; // ✅ Common (대문자)
import dropdownIcon from "../../assets/img/dropdown.png";

export default function OrgPickerBottomSheet({
  isOpen,
  onClose,
  multiple = false,
  initial = [],
  onApply,
  title = "조직도 선택",
}) {
  const { orgData = [] } = useOrgStore();
  const [search, setSearch] = useState("");
  const [openDepts, setOpenDepts] = useState({}); // 기본 접힘
  const [selectedMap, setSelectedMap] = useState(new Map());

  // 초기 선택 동기화
  useEffect(() => {
    if (!isOpen) return;
    const map = new Map();
    (initial || []).forEach((p) => map.set(p.eno, p));
    setSelectedMap(map);
  }, [isOpen, initial]);

  // 검색 필터링
  const filtered = useMemo(() => {
    const s = (search || "").trim();
    return orgData
      .map((dept) => {
        const matched = (dept.employees || []).filter(
          (emp) =>
            emp.name.includes(s) ||
            (emp.position || "").includes(s) ||
            dept.deptName.includes(s)
        );
        return { ...dept, employees: matched };
      })
      .filter((d) => d.employees.length > 0 || d.deptName.includes(s));
  }, [orgData, search]);

  const toggleDept = (deptName) =>
    setOpenDepts((prev) => ({ ...prev, [deptName]: !prev[deptName] }));

  const isChecked = (emp) => selectedMap.has(emp.eno);

  const toggleSelect = (emp) =>
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (multiple) {
        next.has(emp.eno) ? next.delete(emp.eno) : next.set(emp.eno, emp);
      } else {
        next.clear();
        next.set(emp.eno, emp);
      }
      return next;
    });

  const handleApply = () => {
    onApply(Array.from(selectedMap.values()));
    onClose?.();
  };

  // === BottomSheetModal 수정 없이 message로 전체 UI 전달 ===
  const body = (
    <Wrap>
      {/* 선택 요약 (심플) */}
      <SelectBar>
        {selectedMap.size === 0 ? (
          <Hint>선택된 인원이 없습니다.</Hint>
        ) : (
          [...selectedMap.values()].map((p) => (
            <Chip key={p.eno} title={`${p.name} ${p.position || ""}`}>
              <span className="nm">{p.name}</span>
              {p.position && <span className="pos">{p.position}</span>}
              <button
                className="x"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMap((prev) => {
                    const n = new Map(prev);
                    n.delete(p.eno);
                    return n;
                  });
                }}
                aria-label="remove"
              >
                ×
              </button>
            </Chip>
          ))
        )}
      </SelectBar>

      {/* 검색 (sticky) */}
      <Sticky>
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색(이름/부서)"
        />
      </Sticky>

      {/* 리스트 */}
      <List>
        {filtered.length === 0 ? (
          <Empty>표시할 조직이 없습니다.</Empty>
        ) : (
          filtered.map((dept) => {
            // ✅ 기본 접힘: openDepts[dept]가 undefined면 false로 처리
            const opened = search ? true : openDepts[dept.deptName] ?? false;
            return (
              <section key={dept.deptName} className="dept-block">
                <DeptRow onClick={() => toggleDept(dept.deptName)}>
                  <strong className="name" title={dept.deptName}>
                    {dept.deptName}
                  </strong>
                  <span className="count">{(dept.employees || []).length}</span>
                  <img
                    src={dropdownIcon}
                    alt="toggle"
                    className={`chev ${opened ? "open" : ""}`}
                  />
                </DeptRow>

                {opened && (
                  <ul className="emps">
                    {(dept.employees || []).map((emp, idx, arr) => {
                      const checked = isChecked(emp);
                      const isLast = idx === arr.length - 1;
                      return (
                        <li key={emp.eno}>
                          <EmpRow
                            $last={isLast}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleSelect(emp)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleSelect(emp);
                              }
                            }}
                          >
                            <div className="col-ctrl">
                              <input
                                type={multiple ? "checkbox" : "radio"}
                                readOnly
                                checked={checked}
                              />
                            </div>
                            {/* ✅ 이름 중앙정렬 */}
                            <div className="col-name" title={emp.name}>
                              {emp.name}
                            </div>
                            <div className="col-pos">
                              {emp.position && <Pill>{emp.position}</Pill>}
                            </div>
                          </EmpRow>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </List>
    </Wrap>
  );

  return (
    <BottomSheetModal
      isOpen={isOpen}
      title={title}
      message={body}
      onCancel={onClose}
      onConfirm={handleApply}
    />
  );
}

/* ================= styles ================= */

/* 컨테이너 */
const Wrap = styled.div`
  width: 100%;
  font-size: 13px;
`;

/* 선택 요약(컴팩트) */
const SelectBar = styled.div`
  min-height: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
`;
const Hint = styled.span`
  color: #98a0b3;
`;
const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #e6eaf0;
  background: #f7f9fc;
  font-size: 12px;
  .nm { font-weight: 700; }
  .pos { color: #6f7892; }
  .x {
    width: 16px; height: 16px;
    border: 0; border-radius: 50%;
    background: #e9edf5; cursor: pointer; line-height: 16px;
  }
`;

/* 검색 sticky */
const Sticky = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  padding-bottom: 6px;
  background: #fff;
`;
const Search = styled.input`
  width: 100%;
  height: 30px;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid #d7dbe5;
  border-radius: 6px;
`;

/* 리스트: 얇은 실선으로만 구분 + 부서 간간격 */
const List = styled.div`
  max-height: min(60vh, 520px);
  overflow-y: auto;

  .dept-block + .dept-block {
    margin-top: 8px; /* ✅ 부서 블록 간 살짝 간격 */
    border-top: 1px solid #eaecef;
  }

  .emps {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;

/* 부서 행(실선, 배경 없음) */
const DeptRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 16px;
  align-items: center;
  column-gap: 8px;
  height: 36px;
  padding: 0 2px;
  border-bottom: 1px solid #eaecef;
  cursor: pointer;
  user-select: none;

  .name {
    font-size: 13px;
    font-weight: 800;
    color: #222;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .count { font-size: 11px; color: #98a0b3; }
  .chev {
    width: 14px; height: 14px;
    transform: rotate(90deg);
    transition: .2s;
    opacity: .7;
  }
  .chev.open { transform: rotate(180deg); }
`;

/* 사원 행: 컨트롤 / 이름(중앙정렬) / 직급(우측) */
const EmpRow = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  column-gap: 8px;
  height: 34px;
  padding: 4px 2px;
  border-bottom: 1px solid #f1f2f4;

  /* ✅ 마지막 직원 밑에 여백을 주어 다음 부서와 간격 확보 */
  ${({ $last }) => $last && `
    border-bottom: none;
    padding-bottom: 10px;   /* 이름과 다음 부서 사이 간격 */
  `}

  &:hover { background: #fafbfd; }

  .col-ctrl {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .col-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 600;
    color: #333;
    text-align: center;     /* ✅ 이름 중앙정렬 */
  }
  .col-pos {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  input { width: 14px; height: 14px; }
`;

const Pill = styled.span`
  font-size: 11px;
  color: #556070;
  background: #edf1f7;
  padding: 2px 6px;
  border-radius: 999px;
`;

/* 빈 상태 */
const Empty = styled.span`
  display: block;
  padding: 16px 8px;
  color: #98a0b3;
  font-size: 13px;
  text-align: center;
`;