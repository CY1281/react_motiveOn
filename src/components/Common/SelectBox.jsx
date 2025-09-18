import React from "react";
import dropdownIcon from "../../assets/img/dropdown.png";

const SelectBox = ({ label, options, value, onChange, multiple = false, placeholder }) => {
  return (
    <div style={{ marginBottom: "12px" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "13px",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        multiple={multiple}
        style={{
          width: "100%",
          padding: "10px",
          paddingRight: "40px", // 아이콘 자리 확보
          fontSize: "13px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#f9f9f9",
          outline: "none",

          //기본 화살표 제거
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",

         
          backgroundImage: `url(${dropdownIcon})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center", // 오른쪽에서 12px 띄우기
          backgroundSize: "10px", // 아이콘 크기 조정
        }}
      >
        {placeholder && !multiple && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBox;