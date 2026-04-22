import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'

import './style.css'

// 全局错误捕获（调试用）
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error)
  const el = document.getElementById('app')
  if (el) {
    el.innerHTML = `<pre style="padding:24px;color:red;font-size:14px;white-space:pre-wrap;">${e.error?.stack || e.message}</pre>`
  }
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Rejection]', e.reason)
  const el = document.getElementById('app')
  if (el) {
    el.innerHTML = `<pre style="padding:24px;color:red;font-size:14px;white-space:pre-wrap;">Unhandled Rejection:\n${e.reason?.stack || e.reason}</pre>`
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)

app.mount('#app')
