import axios from "axios";

export function getnoticemain() {
  return axios.get('/api/notice/main');
}