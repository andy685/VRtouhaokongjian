import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import SortableDataTable from './components/SortableDataTable.vue'

import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)
app.component('n-data-table', SortableDataTable)
app.component('NDataTable', SortableDataTable)

app.mount('#app')
