// src/components/Approval/FormPickerPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * 서버에서 결재 양식 목록을 불러와 선택하는 컴포넌트
 * - 기본 endpoint: /api/approval/forms.json
 * - onPick(sformno) 호출로 선택 결과 전달
 */
export default function FormPickerPage({
  onPick,
  endpoint = "/api/approval/forms.json", // 필요하면 부모에서 오버라이드
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

        // q 파라미터 지원(백엔드에서 무시해도 OK)
        const url = new URL(endpoint, window.location.origin);
        if (q) url.searchParams.set("q", q);

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // 다양한 응답 포맷(content/list/array) 수용
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.list)
          ? data.list
          : [];

        // 키 표준화 (formName에 CLASSNAME 계열까지 흡수, 없으면 sformno로 폴백)
        const norm = raw
          .map((f) => {
            const sformno = f.sformno || f.SFORMNO || f.formNo || f.FORMNO;
            const formName =
              f.formName ||
              f.FORMNAME ||
              f.formname ||
              f.FORM_NAME ||
              f.CLASSNAME ||
              f.CLASS_NAME ||
              // JSON 키에 점(.)은 잘 안 오지만 혹시 모를 대비
              f["CLS.CLASSNAME"] ||
              f["cls.CLASSNAME"] ||
              sformno;
            return { sformno, formName };
          })
          .filter((x) => x.sformno);

        if (alive) setForms(norm); // ✅ BUGFIX: setForms(rows) → setForms(norm)
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
    onPick?.(sformno); // ✅ 부모로 즉시 전달 (모달이면 닫히도록)
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 280 }}>
      {/* 검색바 (백엔드 q 파라미터도 지원, 프론트 필터도 병행) */}
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
