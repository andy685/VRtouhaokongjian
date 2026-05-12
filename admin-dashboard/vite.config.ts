import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 核心和路由拆为独立 chunk
          'vue-core': ['vue', 'vue-router', 'pinia'],
          // 将 Naive UI 拆为独立 chunk（体积较大）
          'naive-ui': ['naive-ui'],
          // 图标库单独拆分
          icons: ['@vicons/ionicons5'],
          // 图表库单独拆分
          charts: ['echarts', 'vue-echarts'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
