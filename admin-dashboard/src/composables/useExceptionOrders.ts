import { ref } from 'vue'

export interface ExceptionOrder {
  id: number
  orderNo: string
  store: string
  amount: string
  type: string
  reason: string
  time: string
  status: string
  handleRemark: string
  source: string
}

export const exceptionTypes = ['金额异常', '重复支付', '未到账'] as const

// 商家后台共享的异常订单列表
const exceptionOrders = ref<ExceptionOrder[]>([
  {
    id: 1, orderNo: 'VR20260420001', store: '我的旗舰店', amount: '¥88.00',
    type: '金额异常', reason: '渠道到账 ¥88.00，店铺订单 ¥98.00，差额 ¥10.00',
    time: '2026-04-20 10:30', status: 'pending', handleRemark: '', source: '自动对账',
  },
  {
    id: 2, orderNo: 'VR20260420002', store: '我的旗舰店', amount: '¥56.00',
    type: '重复支付', reason: '订单 #VR20260420002 在微信渠道出现 2 笔到账记录',
    time: '2026-04-20 09:15', status: 'pending', handleRemark: '', source: '自动对账',
  },
  {
    id: 3, orderNo: 'VR20260420003', store: '我的旗舰店', amount: '¥156.00',
    type: '金额异常', reason: '已提交平台审核，差额 ¥156.00 与渠道对账不一致',
    time: '2026-04-21 14:20', status: 'rejected', handleRemark: '经核查，差额为优惠券抵扣，非实际异常，请商家确认后修正重新提交',
    source: '商家提交',
  },
])

// 标记异常弹窗状态（共享给 MarkExceptionDialog 组件使用）
const markDialogVisible = ref(false)
const markTarget = ref<{ orderNo: string; store: string; amount: string; source: string }>({
  orderNo: '', store: '', amount: '', source: '商家提交',
})
const markType = ref<string>('')
const markReason = ref('')

export function useExceptionOrders() {
  /**
   * 打开「标记异常」弹窗（由列表页按钮触发）
   * 返回 false 表示该订单已存在异常列表中，不应重复标记
   */
  function openMarkDialog(order: { orderNo: string; store: string; amount: string; source?: string }): boolean {
    const exists = exceptionOrders.value.some(o => o.orderNo === order.orderNo)
    if (exists) return false
    markTarget.value = {
      orderNo: order.orderNo,
      store: order.store,
      amount: order.amount,
      source: order.source || '商家提交',
    }
    markType.value = ''
    markReason.value = ''
    markDialogVisible.value = true
    return true
  }

  /**
   * 确认标记（由弹窗确定按钮触发）
   */
  function confirmMark() {
    if (!markType.value) return
    exceptionOrders.value.unshift({
      id: Date.now(),
      orderNo: markTarget.value.orderNo,
      store: markTarget.value.store,
      amount: markTarget.value.amount,
      type: markType.value,
      reason: markReason.value || `${markType.value} — 手动标记`,
      time: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      handleRemark: '',
      source: markTarget.value.source,
    })
    markDialogVisible.value = false
  }

  /** 检查订单是否已在异常列表中 */
  function isMarked(orderNo: string): boolean {
    return exceptionOrders.value.some(o => o.orderNo === orderNo)
  }

  /** 取消标记：从异常列表中移除该订单 */
  function unmarkOrder(orderNo: string): boolean {
    const idx = exceptionOrders.value.findIndex(o => o.orderNo === orderNo)
    if (idx === -1) return false
    exceptionOrders.value.splice(idx, 1)
    return true
  }

  return { exceptionOrders, openMarkDialog, isMarked, unmarkOrder, markDialogVisible, markTarget, markType, markReason, confirmMark }
}
