import { create } from "zustand";

export const useCalendarStore = create((set) => ({
  events: [
    { id: 1, title: "팀 회의", date: "2025-09-10 10:00", content: "회의실 A" },
    { id: 2, title: "프로젝트 마감", date: "2025-09-15 18:00", content: "최종 보고" },
  ],
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { id: Date.now(), ...event }],
    })),
  updateEvent: (id, updated) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updated } : e)),
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
}));