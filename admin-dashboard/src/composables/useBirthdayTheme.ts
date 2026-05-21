import { ref } from 'vue'

export interface ExclusiveItem {
  id: number
  storeName: string
  merchant: string
  region: string
  starName: string
  createdAt: string
  updatedAt: string
  audioFile: string
}

export const merchantStoreMap: Record<string, string[]> = {
  '恒然集团': ['深圳福田旗舰店', '南山科技园店', '和民轩小黑厅'],
  '利民街商家': ['北京朝阳店'],
  '幻影星空': ['上海浦东店', '宝安中心店'],
}

export const storeRegionMap: Record<string, string> = {
  '深圳福田旗舰店': '深圳',
  '南山科技园店': '深圳',
  '和民轩小黑厅': '深圳',
  '北京朝阳店': '北京',
  '上海浦东店': '上海',
  '宝安中心店': '深圳',
}

// 模块级共享数据 —— 平台和商家后台操作同一份数据
const exclusiveData = ref<ExclusiveItem[]>([
  { id: 1, storeName: '深圳福田旗舰店', merchant: '恒然集团', region: '深圳', starName: '张小明', createdAt: '2026-04-15 10:30', updatedAt: '2026-05-10 14:20', audioFile: 'zhang_xm_birthday.mp3' },
  { id: 2, storeName: '南山科技园店', merchant: '恒然集团', region: '深圳', starName: '李小红', createdAt: '2026-04-20 09:15', updatedAt: '2026-05-12 11:00', audioFile: 'li_xh_birthday.mp3' },
  { id: 3, storeName: '北京朝阳店', merchant: '利民街商家', region: '北京', starName: '王大勇', createdAt: '2026-05-01 16:45', updatedAt: '2026-05-18 10:30', audioFile: 'wang_dy_birthday.mp3' },
  { id: 4, storeName: '上海浦东店', merchant: '幻影星空', region: '上海', starName: '陈小美', createdAt: '2026-05-05 13:20', updatedAt: '2026-05-20 09:00', audioFile: 'chen_xm_birthday.mp3' },
])

export function useExclusiveData() {
  const now = () => new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

  function add(item: { merchant: string; storeName: string; starName: string; audioFile: string }) {
    const nextId = Math.max(0, ...exclusiveData.value.map(r => r.id)) + 1
    const n = now()
    exclusiveData.value.unshift({
      id: nextId,
      storeName: item.storeName,
      merchant: item.merchant,
      region: storeRegionMap[item.storeName] || '',
      starName: item.starName,
      audioFile: item.audioFile,
      createdAt: n,
      updatedAt: n,
    })
  }

  function update(id: number, item: { merchant: string; storeName: string; starName: string; audioFile: string }) {
    const target = exclusiveData.value.find(r => r.id === id)
    if (target) {
      target.merchant = item.merchant
      target.storeName = item.storeName
      target.region = storeRegionMap[item.storeName] || ''
      target.starName = item.starName
      target.audioFile = item.audioFile
      target.updatedAt = now()
    }
  }

  function remove(id: number) {
    exclusiveData.value = exclusiveData.value.filter(r => r.id !== id)
  }

  return { exclusiveData, add, update, remove }
}
