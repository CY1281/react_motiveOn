// src/components/Approval/OrgPickerBottomSheet.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import useOrgStore from "../../store/orgStore";
import BottomSheetModal from "../Common/BottomSheetModal"; // 프로젝트 경로 그대로 사용
import dropdownIcon from "../../assets/img/dropdown.png";

/* ========= helpers ========= */
const toEno = (x) => {
  const raw =
    x?.eno ?? x?.ENO ?? x?.value ?? x?.empNo ?? x?.EMPNO ?? x?.EMP_NO ?? x?.id ?? x?.userId ?? x?.no;
  if (raw == null) return null;
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const normalizePerson = (p) => {
  const eno = toEno(p);
  if (eno == null) return null;
  const name =
    p?.name ?? p?.label ?? p?.empName ?? p?.EMP_NAME ?? p?.EMPNAME ?? "";
  const position =
    p?.position ?? p?.pos ?? p?.rank ?? p?.POSITION ?? "";
  const deptName =
    p?.deptName ?? p?.dept ?? p?.DEPTNAME ?? p?.DEPT_NAME ?? "";
  return {
    eno,
    name,
    position,
    deptName,
    value: eno,
    label: name || String(eno),
  };
};

export default function OrgPickerBottomSheet({
  isOpen,
  onClose,
  multiple = false,
  initial = [],
  onApply,
  title = "조직도 선택",
}) {
  const { orgData = [], fetchOrgData } = useOrgStore();

  const [search, setSearch] = useState("");
  const [openDepts, setOpenDepts] = useState({});
  const [selectedMap, setSelectedMap] = useState(new Map());

  /* ---- 조직도 데이터 로딩 (필요 시 1회) ---- */
  useEffect(() => {
    if (!isOpen) return;
    if (typeof fetchOrgData === "function" && (!Array.isArray(orgData) || orgData.length === 0)) {
      fetchOrgData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---- 초기 선택 동기화 ---- */
  useEffect(() => {
    if (!isOpen) return;
    const map = new Map();
    (initial || []).forEach((p) => {
      const n = normalizePerson(p);
      if (n) map.set(n.eno, n);
    });
    setSelectedMap(map);
    setSearch("");
    setOpenDepts({});
  }, [isOpen, initial]);

  /* ---- 검색 필터링 (대소문자 무시) ---- */
  const filtered = useMemo(() => {
    const kw = (search || "").trim().toLowerCase();
    if (!Array.isArray(orgData)) return [];
    return (orgData || [])
      .map((dept) => {
        const dName = String(dept?.deptName || "");
        const dNameL = dName.toLowerCase();
        const matched = (dept?.employees || []).filter((emp) => {
          const nm = String(emp?.name || "").toLowerCase();
          const pos = String(emp?.position || "").toLowerCase();
          return !kw || nm.includes(kw) || pos.includes(kw) || dNameL.includes(kw);
        });
        return { deptName: dName, employees: matched };
      })
      .filter(
        (d) =>
          (d.employees || []).length > 0 ||
          String(d.deptName || "").toLowerCase().includes(kw)
      );
  }, [orgData, search]);

  const toggleDept = (deptName) =>
    setOpenDepts((prev) => ({ ...prev, [deptName]: !prev[deptName] }));

  const isChecked = (eno) => selectedMap.has(eno);

  const toggleSelect = (emp, deptName) => {
    const eno = toEno(emp);
    if (eno == null) return;
    const person = normalizePerson({ ...emp, deptName });
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (multiple) {
        if (next.has(eno)) next.delete(eno);
        else next.set(eno, person);
      } else {
        // 단일 선택: 동일 클릭 시 토글 해제
        if (next.has(eno)) next.clear();
        else {
          next.clear();
          next.set(eno, person);
        }
      }
      return next;
    });
  };

  const handleApply = () => {
    const list = Array.from(selectedMap.values());
    onApply?.(list);
    onClose?.();
  };

  /* ---- 렌더 ---- */
  const body = (
    <Wrap>
      {/* 선택 요약 */}
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

      {/* 검색 */}
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
          <Empty>
            {Array.isArray(orgData) && orgData.length === 0 && !search
              ? "조직도를 불러오는 중…"
              : "표시할 조직이 없습니다."}
          </Empty>
        ) : (
          filtered.map((dept) => {
            const opened = search ? true : openDepts[dept.deptName] ?? false;
            return (
              <section key={dept.deptName} className="dept-block">
                <DeptRow
                  onClick={() => toggleDept(dept.deptName)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleDept(dept.deptName);
                  }}
                >
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
                      const eno = toEno(emp);
                      if (eno == null) return null;
                      const checked = isChecked(eno);
                      const isLast = idx === arr.length - 1;

                      return (
                        <li key={eno}>
                          <EmpRow
                            $last={isLast}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleSelect(emp, dept.deptName)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleSelect(emp, dept.deptName);
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

                            {/* 이름 중앙정렬 */}
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
  onCancel={onClose}
  onConfirm={handleApply}
>
  {body}                  {/* ✅ children으로 넘기기: <p> 래핑 안 함 */}
</BottomSheetModal>
  );
}

/* ================= styles ================= */
const Wrap = styled.div`
  width: 100%;
  font-size: 13px;
`;

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

const List = styled.div`
  max-height: min(60vh, 520px);
  overflow-y: auto;

  .dept-block + .dept-block {
    margin-top: 8px;
    border-top: 1px solid #eaecef;
  }

  .emps {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;

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
    overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
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

const EmpRow = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  column-gap: 8px;
  height: 34px;
  padding: 4px 2px;
  border-bottom: 1px solid #f1f2f4;

  ${({ $last }) => $last && `
    border-bottom: none;
    padding-bottom: 10px;
  `}

  &:hover { background: #fafbfd; }

  .col-ctrl {
    display: flex; align-items: center; justify-content: center;
  }
  .col-name {
    overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    font-weight: 600; color: #333; text-align: center;
  }
  .col-pos {
    display: flex; align-items: center; justify-content: flex-end;
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

const Empty = styled.span`
  display: block;
  padding: 16px 8px;
  color: #98a0b3;
  font-size: 13px;
  text-align: center;
`;
