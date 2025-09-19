import React from "react";

export const Button = ({ label, variant = "primary", onClick, disabled }) => {
  const styles = {
    primary: {
      backgroundColor: "#3A8DFE",
      color: "#fff",
    },
    secondary: {
      backgroundColor: "#E5E7EB",
      color: "#333",
    },
    danger: {
      backgroundColor: "#EF4444",
      color: "#fff",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: "10px 10px",
        borderRadius: "6px",
        border: "none",
        fontSize: "13px",
        fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        marginTop: "8px",
        opacity: disabled ? 0.6 : 1,
        
      }}
    >
      {label}
    </button>
  );
};

export default Button;