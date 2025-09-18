import React from "react";

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  required = false 
}) => {
  return (
    <div style={{ marginBottom: "16px", width: "100%" }}>
      {label && (
        <label 
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "6px",
            color: "#333"
          }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "14px",
          outline: "none"
        }}
      />
    </div>
  );
};

export default InputField;