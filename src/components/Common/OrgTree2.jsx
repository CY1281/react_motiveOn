// src/components/common/OrgTree2.jsx
import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "jstree";
import { getOrgTree } from "../motiveOn/api";
import "jstree/dist/themes/default/style.min.css";

export default function OrgTree2({ onSelect }) {
  const treeRef = useRef(null); 

  useEffect(() => {
    const treeEl = $(treeRef.current);

    getOrgTree()
      .then((res) => {
        console.log(" 원본 데이터:", res.data);

        const data = res.data.map((node) => {
          const id = String(node.id || node.ID);
          const parent =
            node.parent === "#" || node.PARENT === "#"
              ? "#"
              : String(node.parent || node.PARENT);
          const text = node.text || node.TEXT;
          const type = node.type || node.TYPE;

          // 부서 → children 배열 (하위 가능)
          if (type === "department") {
            return {
              id,
              parent,
              text,
              type,
              icon: "jstree-folder",
            };
          }

          // 사원 → leaf node (children 없음)
          return {
            id,
            parent,
            text,
            type,
            icon: "jstree-file",
          };
        });

        console.log(" 변환된 데이터:", data);

        // 기존 트리 초기화
        if (treeEl.jstree(true)) {
          treeEl.jstree("destroy");
        }

        // jstree 초기화
        treeEl
          .jstree({
            core: {
              data,
              check_callback: true,
            },
            themes: { dots: true, icons: true },
            plugins: ["search"],
          })
          .on('select_node.jstree', function() {
            console.log(data);          
            $(this).jstree("open_all");
            // if (data.node.id.startsWith("e-")) {
            //   console.log(data.node.text);
            //   const eno = data.node.id.replace("e-", "");
            //   const name = data.node.text;
            //   onSelect({ value: eno, label: name });
            // }
          });
      })
      .catch((err) => {
        console.error("❌ 조직도 불러오기 실패:", err);
      });

      return () => {
        if (treeEl.jstree(true)) {
          treeEl.jstree("destroy");
        }
      }
  }, [onSelect]);

  const handleSearch = (e) => {
    $(treeRef.current).jstree(true).search(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        id="orgSearch"
        placeholder="검색(이름/부서)"
        onKeyUp={handleSearch}
        style={{ marginBottom: "8px", width: "100%" }}
      />
      <div ref={treeRef}></div>
    </div>
  );
}