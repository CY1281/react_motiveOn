// src/components/Approval/FormPickerPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * 서버에서 결재 양식 목록을 불러와 선택하는 컴포넌트
 * - 기본 endpoint: /api/approval/forms.list.json  (컨트롤러2에 맞춤)
 * - onPick(sformno) 호출로 선택 결과 전달
 */
export default function FormPickerPage({
  onPick,
  endpoint = "/api/approval/forms.list.json", // ✅ 컨트롤러2 스펙에 맞춤
  q: initialQ = "",
}) {
  const [forms, setForms] = useState([]);
  const [q, setQ] = useState(initialQ);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 서버 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const url = new URL(endpoint, window.location.origin);
        if (q) url.searchParams.set("q", q);

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
          credentials: "include", // ✅ 세션 유지
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));

        // 다양한 응답 포맷(content/list/forms/array) 수용
        const raw = Array.isArray(data?.forms)
          ? data.forms
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.list)
          ? data.list
          : Array.isArray(data)
          ? data
          : [];

        // 키 표준화
        const norm = raw
          .map((f) => {
            const sformno =
              f.sformno ?? f.sformNo ?? f.SFORMNO ?? f.formNo ?? f.FORMNO;
            const formName =
              f.formName ??
              f.FORMNAME ??
              f.formname ??
              f.FORM_NAME ??
              f.className ??
              f.CLASSNAME ??
              sformno;
            return sformno ? { sformno, formName } : null;
          })
          .filter(Boolean);

        if (alive) setForms(norm);
      } catch (e) {
        console.error("[FormPickerPage] load fail:", e);
        if (alive) setErr("양식 목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [endpoint, q]);

  const filtered = useMemo(() => {
    const kw = (q || "").trim().toLowerCase();
    if (!kw) return forms;
    return forms.filter(
      (f) =>
        (f.formName && f.formName.toLowerCase().includes(kw)) ||
        (f.sformno && String(f.sformno).toLowerCase().includes(kw))
    );
  }, [forms, q]);

  const handlePick = (sformno) => {
    setSelected(sformno);
    onPick?.(sformno); // 부모로 즉시 전달(모달이면 닫히도록)
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 280 }}>
      {/* 검색바 */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="양식명 또는 코드로 검색"
          style={{
            flex: 1,
            height: 36,
            padding: "0 10px",
            border: "1px solid #e1e5ef",
            borderRadius: 8,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      </div>

      <div
        style={{
          border: "1px solid #e1e5ef",
          borderRadius: 12,
          maxHeight: 400,
          overflowY: "auto",
          padding: 8,
        }}
      >
        {loading ? (
          <div style={{ padding: 12, color: "#8a94a6" }}>불러오는 중…</div>
        ) : err ? (
          <div style={{ padding: 12, color: "#b01818" }}>{err}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 12, color: "#8a94a6" }}>표시할 양식이 없습니다.</div>
        ) : (
          filtered.map((f) => (
            <label
              key={f.sformno}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafcff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onDoubleClick={() => handlePick(f.sformno)}
            >
              <input
                type="radio"
                name="form"
                checked={selected === f.sformno}
                onChange={() => handlePick(f.sformno)}
              />
              <span style={{ fontWeight: 700 }}>{f.formName}</span>
              <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 12 }}>
                {f.sformno}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
