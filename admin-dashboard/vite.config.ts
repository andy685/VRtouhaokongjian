import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: [],
    include: []
  },
  // 禁用依赖扫描（Vite 8 使用 rolldown，无法处理 .vue 文件导入）
  server: {
    fs: {
      strict: false
    }
  }
})
