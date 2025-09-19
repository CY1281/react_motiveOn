import React, { Component } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction"; // ✅ 날짜/이벤트 클릭 추가
import { getCalendarList } from "../motiveOn/api";

class CalendarPage extends Component {
  state = {
    currentTitle: "",
    events: [],
  };

  touchStartX = 0;

  // ✅ 일정 불러오기 함수 분리
  fetchCalendarList = async () => {
    try {
      const res = await getCalendarList(); // api.js에서 로그인 사용자 eno 자동 추출
      const data = res.data.calendarList || [];

      const events = data.map((event) => {
        const startDate = new Date(event.sdate);
        const endDate = new Date(event.edate);

        // FullCalendar는 end를 exclusive로 해석 → 하루 보정
        endDate.setDate(endDate.getDate() + 1);

        // catecode 에 따라 색상 매핑
        let color = "#9bc59c";
        if (event.catecode === "C") color = "#f76258"; // 회사
        else if (event.catecode === "D") color = "#71b2e7"; // 부서
        else if (event.catecode === "P") color = "#94c296"; // 개인

        return {
          id: event.ccode,
          title: `${event.title}`,
          start: startDate.toLocaleDateString("sv-SE"),
          end: endDate.toLocaleDateString("sv-SE"),
          color,
          content: event.content,
        };
      });

      this.setState({ events });
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    }
  };

  // 달력 타이틀(YYYY/MM) 업데이트
  handleDatesSet = (info) => {
    const year = info.view.currentStart.getFullYear();
    const month = String(info.view.currentStart.getMonth() + 1).padStart(2, "0");
    this.setState({ currentTitle: `${year}/${month}` });

    if (this.props.setSelectedDate) {
      this.props.setSelectedDate(new Date());
    }
  };

  handleTouchStart = (e) => {
    this.touchStartX = e.changedTouches[0].clientX;
  };

  handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - this.touchStartX;
    const calendarApi = this.calendarRef.getApi();

    if (diff > 50) {
      calendarApi.prev();
    } else if (diff < -50) {
      calendarApi.next();
    }
  };
async componentDidMount() {
  await this.fetchCalendarList();
  window.addEventListener("calendar:refresh", () => this.fetchCalendarList());
}

componentWillUnmount() {
  // 컴포넌트가 언마운트될 때 이벤트 해제도 꼭 해줘야 함
  window.removeEventListener("calendar:refresh", () => this.fetchCalendarList());
}

  render() {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onTouchStart={this.handleTouchStart}
        onTouchEnd={this.handleTouchEnd}
      >
        {/* 스타일 (유지) */}
        <style>
          {`
            .fc {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              overflow-x: hidden !important;
              box-sizing: border-box;
            }

            .fc-view-harness,
            .fc-scrollgrid,
            .fc-scrollgrid-sync-table,
            .fc-col-header,
            .fc-daygrid-body {
              width: 100% !important;
              table-layout: fixed !important;
              margin: 0 !important;
              padding: 0 !important;
              border-spacing: 0 !important;
              border-collapse: collapse !important;
            }

            .fc-scrollgrid {
              border-left: none !important;
              border-right: none !important;
            }

            .fc-theme-standard td,
            .fc-theme-standard th {
              padding: 0 !important;
              margin: 0 !important;
              border-left: none !important;
              border-right: none !important;
            }

            .fc-col-header-cell-cushion {
              font-size: 10.8px !important;
              font-weight: 500 !important;
              padding: 2px 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              height: 100% !important;
              line-height: 2.1 !important;
            }

            .fc-daygrid-day-number {
              font-size: 11px;
            }

            .fc-header-toolbar {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 16px 12px !important;
              margin-bottom: 2px !important;
            }

            .fc-toolbar-title {
              font-size: 18px !important;
              font-weight: 600 !important;
              color: #444 !important;
              padding-left: 12px;
            }

            .fc-today-button {
              background: #fff !important;
              border: 1px solid #e6e6e6 !important;
              border-radius: 6px !important;
              font-size: 10px !important;
              padding: 4px 10px !important;
              color: #333 !important;
              cursor: pointer;
            }

            .fc-toolbar {
              margin-bottom: 0 !important;
            }

            .fc-header-toolbar {
              padding-top: 13px !important;
            }
          `}
        </style>

        {/* 달력 영역 */}
        <div style={{ flex: 2, minHeight: 0 }}>
          <FullCalendar
            ref={(el) => (this.calendarRef = el)}
            plugins={[dayGridPlugin, interactionPlugin]} // ✅ 클릭 가능
            initialView="dayGridMonth"
            locale="ko"
            headerToolbar={{
              left: "title",
              center: "",
              right: "today",
            }}
            buttonText={{ today: "오늘" }}
            datesSet={this.handleDatesSet}
            titleFormat={() => this.state.currentTitle}
            dayHeaderFormat={{ weekday: "short" }}
            dayCellContent={(arg) => arg.date.getDate()}
            height="100%"
            contentHeight="100%"
            events={this.state.events}
            eventClick={(arg) => {
              if (this.props.setSelectedDate && arg.event?.start) {
                this.props.setSelectedDate(new Date(arg.event.start));
              }
            }}
            dateClick={(info) => {
              if (this.props.setSelectedDate) {
                this.props.setSelectedDate(new Date(info.dateStr));
              }
            }}
            eventContent={(arg) => {
              const color = arg.event.backgroundColor || "#9bc59c";
              return {
                html: `
                  <div style="
                    display:flex;
                    align-items:center;
                    font-size:10px;
                    font-weight:500;
                    overflow:hidden;
                    white-space:nowrap;
                    text-overflow:ellipsis;
                  ">
                    <span style="
                      display:inline-block;
                      width:2px;
                      height:6px;
                      border-radius:50%;
                      background:${color};
                      opacity:1;
                      margin-right:4px;
                    "></span>
                    ${arg.event.title}
                  </div>
                `,
              };
            }}
          />
        </div>

        {/* 이벤트 리스트 영역 */}
        <div
          style={{
            flex: 1,
            background: "#ffffff",
            overflowY: "auto",
            padding: "8px",
          }}
        ></div>
      </div>
    );
  }
}

export default CalendarPage;