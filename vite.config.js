import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
//   plugins: [react()],
// })
 plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/', // 톰캣 서버 호스트 + 포트
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/motiveOn/api'), 
        // '/api/project/list/stu' → '/campus/api/project/list/stu'로 매핑
      },
    },
  },
});