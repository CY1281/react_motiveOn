import { create } from "zustand";

const useModalStore = create((set) => ({
  isOpen: false,
  content: null, // 모달 안에 들어갈 컴포넌트 or 텍스트

  openModal: (content) => set({ isOpen: true, content }),
  closeModal: () => set({ isOpen: false, content: null }),
}));

export default useModalStore;