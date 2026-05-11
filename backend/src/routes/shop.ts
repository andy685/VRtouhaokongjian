import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware, paginate } from '../middleware'
import { store } from '../store'
import { AuthRequest, ApiResponse, RechargePackage, TicketPackage, Coupon, Feedback } from '../types'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 店铺管理
 *   description: 商家门店运营管理后台
 */

// ===== 工作台 =====
router.get('/dashboard/kpi', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { todayRevenue: 8360, todayVisitors: 45, newMembersToday: 8, deviceOnlineRate: '92.5%' } })
})
router.get('/dashboard/revenue-trend', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const d = Array.from({ length: 15 }, (_, i) => ({ date: `5月${i + 1}日`, revenue: Math.floor(Math.random() * 10000 + 3000) }))
  res.json({ code: 200, message: 'ok', data: d })
})
router.get('/dashboard/member-ranking', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.members.slice(0, 10).map(m => ({ name: m.name, consumption: m.totalConsumption })) })
})

// ===== 单次消费项目 (1期) =====
/**
 * @swagger
 * /api/shop/products/single:
 *   get:
 *     summary: 单次消费项目列表
 *     description: 单次消费项目CRUD（1期⭐）
 *     tags: [店铺管理]
 *     responses: { '200': { description: 项目列表 } }
 */
router.get('/products/single', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { id: uuid(), name: 'VR射击体验', deviceType: 'HTC Vive', price: 68, storeId: 's1', status: 'active' },
    { id: uuid(), name: 'VR恐怖探险', deviceType: 'Pico 4', price: 88, storeId: 's1', status: 'active' },
    { id: uuid(), name: 'VR赛车竞速', deviceType: 'Quest 3', price: 78, storeId: 's1', status: 'inactive' },
  ]})
})
router.post('/products/single', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '项目已创建', data: { id: uuid(), ...req.body } })
})
router.put('/products/single/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '项目已更新', data: { id: req.params.id, ...req.body } })
})
router.delete('/products/single/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '项目已删除' })
})

// ===== 实物商品 (3期) =====
router.get('/products/physical', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { id: uuid(), name: 'VR清洁套装', price: 29.9, stock: 100, sales: 45, category: '配件', status: 'active' },
    { id: uuid(), name: '防眩晕眼镜', price: 59.9, stock: 50, sales: 28, category: '配件', status: 'active' },
  ]})
})
router.post('/products/physical', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '商品已创建', data: { id: uuid(), ...req.body } })
})
router.put('/products/physical/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '商品已更新' })
})

// ===== 充值套餐 (1期) =====
/**
 * @swagger
 * /api/shop/recharge/packages:
 *   get:
 *     summary: 充值套餐列表
 *     description: 充值套餐CRUD/统计（1期⭐）
 *     tags: [店铺管理]
 *     responses: { '200': { description: 套餐列表 } }
 */
router.get('/recharge/packages', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.rechargePackages })
})
router.post('/recharge/packages', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const pkg: RechargePackage = { id: uuid(), createdAt: new Date().toISOString(), ...req.body }
  store.create(store.rechargePackages, pkg)
  res.json({ code: 200, message: '套餐已创建', data: pkg })
})
router.put('/recharge/packages/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.rechargePackages, req.params.id, req.body)
  res.json({ code: 200, message: '套餐已更新', data: updated })
})
router.delete('/recharge/packages/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  store.delete(store.rechargePackages, req.params.id)
  res.json({ code: 200, message: '套餐已删除' })
})

// ===== 套票管理 (1期) =====
/**
 * @swagger
 * /api/shop/packages:
 *   get:
 *     summary: 套票列表
 *     description: 套票(计时/计次)CRUD（1期⭐）
 *     tags: [店铺管理]
 *     responses: { '200': { description: 套票列表 } }
 */
router.get('/packages', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.ticketPackages.length ? store.ticketPackages : [
    { id: uuid(), name: '1小时畅玩', type: 'time', price: 98, duration: 1, validityDays: 30, memberLevel: '全部', status: 'active', storeId: 's1' },
    { id: uuid(), name: '3小时畅玩', type: 'time', price: 228, duration: 3, validityDays: 90, memberLevel: '银卡', status: 'active', storeId: 's1' },
  ]})
})
router.post('/packages', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '套票已创建', data: { id: uuid(), ...req.body } })
})
router.put('/packages/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '套票已更新' })
})

// ===== 优惠券 (2期) =====
/**
 * @swagger
 * /api/shop/coupons:
 *   get:
 *     summary: 优惠券列表
 *     description: 4种券型(满减/折扣/特价/兑换)CRUD（2期）
 *     tags: [店铺管理]
 *     responses: { '200': { description: 优惠券列表 } }
 */
router.get('/coupons', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.coupons.length ? store.coupons : [
    { id: uuid(), name: '满100减20', type: 'full_reduction', value: 20, minAmount: 100, totalCount: 500, issuedCount: 120, usedCount: 45, status: 'active', storeId: 's1' },
    { id: uuid(), name: '9折优惠', type: 'discount', value: 0.9, totalCount: 300, issuedCount: 80, usedCount: 30, status: 'active', storeId: 's1' },
  ]})
})
router.post('/coupons', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const coupon: Coupon = { id: uuid(), issuedCount: 0, usedCount: 0, createdAt: new Date().toISOString(), ...req.body }
  store.create(store.coupons, coupon)
  res.json({ code: 200, message: '优惠券已创建', data: coupon })
})

// ===== 会员管理 (门店视角) =====
router.get('/members', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { keyword } = req.query as any
  let data = [...store.members]
  if (keyword) data = data.filter(m => m.name.includes(keyword) || m.phone.includes(keyword))
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

// ===== 店铺系统设置 =====
router.get('/settings/store', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.stores[0] || {} })
})
router.put('/settings/store', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '店铺信息已更新', data: req.body })
})
router.get('/settings/vod', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { rate: 0.3, settlementRatio: 0.7, contentSources: ['platform'], pcParams: { maxScreens: 4, defaultCoins: 100 } } })
})
router.put('/settings/vod', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '点播配置已更新' })
})

// ===== 店铺设备 =====
router.get('/devices', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const result = paginate(store.devices, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})
router.put('/devices/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.devices, req.params.id, req.body)
  if (!updated) return res.status(404).json({ code: 404, message: '设备不存在' })
  res.json({ code: 200, message: '设备信息已更新', data: updated })
})
router.post('/devices/bind', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { headsetId, hostId } = req.body
  store.update(store.devices, headsetId, { boundHostId: hostId })
  store.update(store.devices, hostId, { boundHeadsetId: headsetId })
  res.json({ code: 200, message: '头显已绑定到主机' })
})
router.get('/devices/online-stats', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const hosts = store.devices.filter(d => d.type === 'host')
  const headsets = store.devices.filter(d => d.type === 'headset')
  res.json({ code: 200, message: 'ok', data: {
    hosts: { total: hosts.length, online: hosts.filter(h => h.status === 'online').length },
    headsets: { total: headsets.length, online: headsets.filter(h => h.status === 'online' || h.status === 'busy').length },
  }})
})

// ===== 数据报表 =====
router.get('/reports/daily-sales', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    date: new Date().toISOString().slice(0, 10),
    totalRevenue: 8360, prepaidRevenue: 3200, gameVOD: 2800, packageSales: 1560,
    wechatPay: 4200, alipay: 2800, cash: 860, memberBalance: 500,
  }})
})
router.get('/reports/historical-revenue', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`, revenue: Math.floor(Math.random() * 500000 + 100000),
    orders: Math.floor(Math.random() * 2000 + 500),
  })) })
})
router.get('/reports/channel-revenue', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const result = paginate(store.stores.map(s => ({ storeName: s.name, date: '2024-06-01', revenue: Math.floor(Math.random() * 30000 + 5000) })))
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})
router.get('/reports/product-sales', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { productName: 'VR射击体验', salesCount: 45, revenue: 3060, date: '2024-06-01' },
    { productName: 'VR恐怖探险', salesCount: 32, revenue: 2816, date: '2024-06-01' },
  ]})
})
router.get('/reports/account-stats', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 30 }, (_, i) => ({
    date: `5月${i + 1}日`, income: Math.floor(Math.random() * 20000 + 5000),
  })) })
})
router.get('/reports/shifts', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { staffName: '收银员A', shiftStart: '09:00', shiftEnd: '18:00', revenue: 5230, orderCount: 28 },
    { staffName: '收银员B', shiftStart: '14:00', shiftEnd: '22:00', revenue: 3980, orderCount: 21 },
  ]})
})
router.get('/reports/staff-orders', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { staffName: '张收银', orderType: '点播', count: 15, totalAmount: 1250 },
    { staffName: '李收银', orderType: '充值', count: 8, totalAmount: 3200 },
  ]})
})

// ===== 点播数据 =====
const onDemandTypes = ['game-records', 'consumption', 'device-records', 'game-summary']
onDemandTypes.forEach(type => {
  router.get(`/reports/ondemand/${type.replace('-', '-')}`, authMiddleware, (_req, res: Response<ApiResponse>) => {
    res.json({ code: 200, message: 'ok', data: Array.from({ length: 10 }, (_, i) => ({
      id: uuid(), gameName: store.games[i % store.games.length]?.name || '未知游戏',
      memberName: `会员${i + 1}`, deviceName: `头显-${i + 1}`,
      startTime: new Date().toISOString(), duration: Math.floor(Math.random() * 60 + 10),
      coinsUsed: Math.floor(Math.random() * 50 + 10),
    })) })
  })
})

// ===== 订单相关 =====
const orderTypes = ['cashier', 'vod', 'manual-deduct', 'edit-balance', 'exchange', 'gift']
orderTypes.forEach(type => {
  router.get(`/orders/${type}`, authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
    const result = paginate(store.orders, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
    res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
  })
})

// ===== 账户相关 =====
router.get('/account/balance', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { operatingBalance: 125800, gameCoinBalance: 5600, totalRecharge: 280000 } })
})
router.get('/account/bills', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 20 }, (_, i) => ({
    id: uuid(), type: ['recharge', 'consume', 'withdraw'][Math.floor(Math.random() * 3)],
    amount: Math.floor(Math.random() * 10000 + 100) / 100, createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  })) })
})

export default router
