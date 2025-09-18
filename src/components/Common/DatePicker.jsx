import React from "react";

const DatePicker = ({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  showTime = false, 
}) => {
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
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "13px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9",
          }}
        />
        {showTime && (
          <input
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            style={{
              width: "120px",
              padding: "10px",
              fontSize: "13px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "#f9f9f9",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DatePicker;