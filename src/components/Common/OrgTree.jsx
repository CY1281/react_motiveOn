import React, { useState, useEffect } from "react";
import useOrgStore from "../../store/orgStore";
import dropdownIcon from "../../assets/img/dropdown.png";

const OrgTree = ({ onSelect, selectedAssignees }) => {
  const { orgData, fetchOrgData } = useOrgStore();
  const [search, setSearch] = useState("");
  const [openDepts, setOpenDepts] = useState({});

  // ✅ 데이터 불러오기 + 확인
  useEffect(() => {
    if (fetchOrgData) {
      fetchOrgData();
    }
  }, [fetchOrgData]);

  useEffect(() => {
    console.log("조직도 데이터:", orgData);
  }, [orgData]);

  const toggleDept = (deptName) => {
    setOpenDepts((prev) => ({
      ...prev,
      [deptName]: !prev[deptName],
    }));
  };

  const filteredData = orgData
    .map((dept) => {
      const matchedEmployees = dept.employees?.filter(
        (emp) =>
          emp.name.includes(search) ||
          emp.position.includes(search) ||
          dept.deptName.includes(search)
      );
      return { ...dept, employees: matchedEmployees || [] };
    })
    .filter(
      (dept) => dept.employees.length > 0 || dept.deptName.includes(search)
    );

  const isSelected = (emp) =>
    selectedAssignees?.some((a) => a.value === emp.eno);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        width: "100%",
        maxWidth: "340px",
        background: "#fff",
        fontSize: "11px",
        lineHeight: "1.5",
        boxSizing: "border-box",
      }}
    >
      <h4 style={{ marginBottom: "10px", fontSize: "14px" }}>조직도</h4>

      <input
        type="text"
        placeholder="검색(이름/부서)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "14px",
          padding: "6px 8px",
          fontSize: "12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxSizing: "border-box",
        }}
      />

      <ul style={{ listStyle: "none", paddingLeft: "0", margin: 0 }}>
        {filteredData.map((dept) => {
          const isOpen =
            search !== "" ? true : openDepts[dept.deptName] ?? true;

          return (
            <li key={dept.deptName} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  userSelect: "none",
                  padding: "4px 0",
                }}
                onClick={() => toggleDept(dept.deptName)}
              >
                <span style={{ flex: 1 }}>{dept.deptName}</span>
                <img
                  src={dropdownIcon}
                  alt="toggle"
                  style={{
                    width: "14px",
                    height: "14px",
                    transform: isOpen ? "rotate(180deg)" : "rotate(90deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>

              {isOpen && (
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: "18px",
                    marginTop: "6px",
                    marginBottom: "6px",
                  }}
                >
                  {dept.employees.map((emp) => (
                    <li
                      key={emp.eno}
                      style={{
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "baseline",
                        gap: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: isSelected(emp) ? "bold" : "normal",
                        color: isSelected(emp) ? "#007bff" : "#333",
                      }}
                      onClick={() => {
                        if (onSelect) {
                          if (isSelected(emp)) {
                            // ✅ 이미 선택 → 해제
                            onSelect({ value: emp.eno, label: emp.name, remove: true });
                          } else {
                            // ✅ 새로 선택
                            onSelect({ value: emp.eno, label: emp.name });
                          }
                        }
                      }}
                    >
                      <span>{emp.name}</span>
                      <span style={{ color: "#777", fontSize: "10px" }}>
                        {emp.position}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrgTree;