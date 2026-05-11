import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware, requireRole, paginate } from '../middleware'
import { store } from '../store'
import { AuthRequest, ApiResponse, UserRole, Merchant, Store as StoreType, Agent, Game, Banner, Member, Order, Device, Settlement, Feedback, Notification, GameCategory } from '../types'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 总运营后台
 *   description: 平台超管运营管理后台
 */

// ============================================================
//  数据中心 (3期)
// ============================================================

/**
 * @swagger
 * /api/platform/dashboard/kpi:
 *   get:
 *     summary: KPI指标卡
 *     description: 平台KPI指标卡数据（3期）
 *     tags: [总运营后台]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: KPI数据
 */
router.get('/dashboard/kpi', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({
    code: 200, message: 'ok',
    data: {
      totalStores: store.stores.length,
      activeStores: store.stores.filter(s => s.status === 'online').length,
      totalMerchants: store.merchants.length,
      totalMembers: store.members.length,
      todayRevenue: 52680,
      monthRevenue: 1256800,
      activeDevices: store.devices.filter(d => d.status === 'online').length,
      totalDevices: store.devices.length,
    },
  })
})

/**
 * @swagger
 * /api/platform/dashboard/revenue-trend:
 *   get:
 *     summary: 营收趋势
 *     description: 平台营收趋势图数据
 *     tags: [总运营后台]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [week, month, year] }
 *     responses: { '200': { description: 营收趋势数据 } }
 */
router.get('/dashboard/revenue-trend', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const days = Array.from({ length: 7 }, (_, i) => `5月${11 + i}日`)
  const data = days.map(d => ({ date: d, revenue: Math.floor(Math.random() * 50000 + 20000) }))
  res.json({ code: 200, message: 'ok', data })
})

/**
 * @swagger
 * /api/platform/dashboard/store-ranking:
 *   get:
 *     summary: 门店排行
 *     description: 门店排行+支付分布
 *     tags: [总运营后台]
 *     responses: { '200': { description: 排行数据 } }
 */
router.get('/dashboard/store-ranking', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const ranking = store.stores
    .map(s => ({ name: s.name, revenue: s.todayRevenue }))
    .sort((a, b) => b.revenue - a.revenue)
  res.json({
    code: 200, message: 'ok',
    data: { ranking, payDistribution: { wechat: 45, alipay: 35, cash: 12, balance: 8 } },
  })
})

// ============================================================
//  设备管理 (1期)
// ============================================================

/**
 * @swagger
 * /api/platform/devices:
 *   get:
 *     summary: 设备运行总览
 *     description: 主机/头显设备列表含状态（1期⭐）
 *     tags: [总运营后台]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [host, headset, third_party] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 设备列表
 */
router.get('/devices', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { type, status } = req.query as any
  let data = [...store.devices]
  if (type) data = data.filter(d => d.type === type)
  if (status) data = data.filter(d => d.status === status)
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/platform/devices/stats:
 *   get:
 *     summary: 设备状态统计
 *     description: 设备在线率/状态分布统计（1期）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 统计信息 } }
 */
router.get('/devices/stats', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const total = store.devices.length
  const online = store.devices.filter(d => d.status === 'online').length
  res.json({
    code: 200, message: 'ok',
    data: { total, online, offline: total - online, onlineRate: `${((online / total) * 100).toFixed(1)}%` },
  })
})

/**
 * @swagger
 * /api/platform/devices/configs:
 *   get:
 *     summary: 设备配置模板列表
 *     description: 主机/头显配置模板CRUD（1期）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 配置模板列表 } }
 */
router.get('/devices/configs', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({
    code: 200, message: 'ok',
    data: [
      { id: uuid(), name: '标准主机配置', type: 'host', params: { cpu: '8核', memory: '16GB', disk: '256GB' } },
      { id: uuid(), name: '高性能头显配置', type: 'headset', params: { ipd: '58-68', refreshRate: 120, brightness: 100 } },
    ],
  })
})

/**
 * @swagger
 * /api/platform/devices/configs:
 *   post:
 *     summary: 创建设备配置
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/devices/configs', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const config = { id: uuid(), ...req.body, createdAt: new Date().toISOString() }
  res.json({ code: 200, message: '配置创建成功', data: config })
})

/**
 * @swagger
 * /api/platform/devices/ota:
 *   post:
 *     summary: OTA升级
 *     description: 固件OTA升级管理（1期）
 *     tags: [总运营后台]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version: { type: string }
 *               deviceType: { type: string }
 *               firmwareUrl: { type: string }
 *     responses: { '200': { description: 升级任务已创建 } }
 */
router.post('/devices/ota', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'OTA升级任务已创建', data: { taskId: uuid(), ...req.body } })
})

// ============================================================
//  商家管理 (1期)
// ============================================================

/**
 * @swagger
 * /api/platform/merchants:
 *   get:
 *     summary: 商家列表
 *     description: 商家列表/搜索/筛选/统计（1期⭐）
 *     tags: [总运营后台]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, active, suspended] }
 *     responses: { '200': { description: 商家列表+统计 } }
 */
router.get('/merchants', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { keyword, status } = req.query as any
  let data = [...store.merchants]
  if (keyword) data = data.filter(m => m.name.includes(keyword) || m.contactPerson.includes(keyword))
  if (status) data = data.filter(m => m.status === status)
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({
    code: 200, message: 'ok',
    data: result.list,
    total: result.total,
  })
})

/**
 * @swagger
 * /api/platform/merchants/stats:
 *   get:
 *     summary: 商家统计
 *     description: 商家总数/营业数据/上月分润
 *     tags: [总运营后台]
 *     responses: { '200': { description: 统计 } }
 */
router.get('/merchants/stats', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({
    code: 200, message: 'ok',
    data: {
      total: store.merchants.length,
      active: store.merchants.filter(m => m.status === 'active').length,
      pending: store.merchants.filter(m => m.status === 'pending').length,
      totalProfit: store.merchants.reduce((s, m) => s + m.lastMonthProfit, 0),
    },
  })
})

/**
 * @swagger
 * /api/platform/merchants/{id}:
 *   get:
 *     summary: 商家详情
 *     tags: [总运营后台]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses: { '200': { description: 商家信息 } }
 */
router.get('/merchants/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const m = store.findById(store.merchants, req.params.id)
  if (!m) return res.status(404).json({ code: 404, message: '商家不存在' })
  res.json({ code: 200, message: 'ok', data: m })
})

/**
 * @swagger
 * /api/platform/merchants:
 *   post:
 *     summary: 新增商家
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/merchants', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const merchant: Merchant = { id: uuid(), totalStores: 0, lastMonthProfit: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body }
  store.create(store.merchants, merchant)
  res.json({ code: 200, message: '商家创建成功', data: merchant })
})

/**
 * @swagger
 * /api/platform/merchants/{id}:
 *   put:
 *     summary: 编辑商家
 *     tags: [总运营后台]
 *     responses: { '200': { description: 更新成功 } }
 */
router.put('/merchants/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.merchants, req.params.id, req.body)
  if (!updated) return res.status(404).json({ code: 404, message: '商家不存在' })
  res.json({ code: 200, message: '商家信息已更新', data: updated })
})

/**
 * @swagger
 * /api/platform/merchants/{id}:
 *   delete:
 *     summary: 删除商家
 *     tags: [总运营后台]
 *     responses: { '200': { description: 删除成功 } }
 */
router.delete('/merchants/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const ok = store.delete(store.merchants, req.params.id)
  if (!ok) return res.status(404).json({ code: 404, message: '商家不存在' })
  res.json({ code: 200, message: '商家已删除' })
})

/**
 * @swagger
 * /api/platform/merchants/{id}/audit:
 *   put:
 *     summary: 商家入驻审核
 *     description: 审核通过/驳回商家入驻申请（1期）
 *     tags: [总运营后台]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action: { type: string, enum: [approve, reject] }
 *               reason: { type: string }
 *     responses: { '200': { description: 审核完成 } }
 */
router.put('/merchants/:id/audit', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { action } = req.body
  const updated = store.update(store.merchants, req.params.id, { status: action === 'approve' ? 'active' : 'suspended' })
  if (!updated) return res.status(404).json({ code: 404, message: '商家不存在' })
  res.json({ code: 200, message: action === 'approve' ? '商家已通过审核' : '商家已驳回', data: updated })
})

// ============================================================
//  店铺管理 (1期)
// ============================================================

/**
 * @swagger
 * /api/platform/stores:
 *   get:
 *     summary: 店铺列表
 *     description: 店铺列表/搜索/筛选/统计（1期⭐）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 店铺列表 } }
 */
router.get('/stores', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { keyword, status, region } = req.query as any
  let data = [...store.stores]
  if (keyword) data = data.filter(s => s.name.includes(keyword) || s.manager.includes(keyword))
  if (status) data = data.filter(s => s.status === status)
  if (region) data = data.filter(s => s.region.includes(region))
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/platform/stores/stats:
 *   get:
 *     summary: 店铺统计
 *     description: 总店铺数/营业中/覆盖城市
 *     tags: [总运营后台]
 *     responses: { '200': { description: 统计 } }
 */
router.get('/stores/stats', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const regions = new Set(store.stores.map(s => s.region))
  res.json({
    code: 200, message: 'ok',
    data: {
      total: store.stores.length,
      online: store.stores.filter(s => s.status === 'online').length,
      maintain: store.stores.filter(s => s.status === 'maintain').length,
      cities: regions.size,
    },
  })
})

/**
 * @swagger
 * /api/platform/stores:
 *   post:
 *     summary: 新增店铺
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/stores', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const s: StoreType = { id: uuid(), deviceCount: 0, todayRevenue: 0, monthRevenue: 0, memberCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body }
  store.create(store.stores, s)
  res.json({ code: 200, message: '店铺创建成功', data: s })
})

/**
 * @swagger
 * /api/platform/stores/{id}:
 *   get:
 *     summary: 店铺详情
 *     tags: [总运营后台]
 *     responses: { '200': { description: 店铺信息 } }
 */
router.get('/stores/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const s = store.findById(store.stores, req.params.id)
  if (!s) return res.status(404).json({ code: 404, message: '店铺不存在' })
  res.json({ code: 200, message: 'ok', data: s })
})

/**
 * @swagger
 * /api/platform/stores/{id}:
 *   put:
 *     summary: 编辑店铺
 *     tags: [总运营后台]
 *     responses: { '200': { description: 更新成功 } }
 */
router.put('/stores/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.stores, req.params.id, req.body)
  if (!updated) return res.status(404).json({ code: 404, message: '店铺不存在' })
  res.json({ code: 200, message: '店铺信息已更新', data: updated })
})

/**
 * @swagger
 * /api/platform/stores/{id}:
 *   delete:
 *     summary: 删除店铺
 *     tags: [总运营后台]
 *     responses: { '200': { description: 删除成功 } }
 */
router.delete('/stores/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const ok = store.delete(store.stores, req.params.id)
  if (!ok) return res.status(404).json({ code: 404, message: '店铺不存在' })
  res.json({ code: 200, message: '店铺已删除' })
})

/**
 * @swagger
 * /api/platform/stores/{id}/pay-code:
 *   get:
 *     summary: 拉卡拉支付码
 *     tags: [总运营后台]
 *     responses: { '200': { description: 支付码信息 } }
 */
router.get('/stores/:id/pay-code', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const s = store.findById(store.stores, req.params.id)
  if (!s) return res.status(404).json({ code: 404, message: '店铺不存在' })
  res.json({ code: 200, message: 'ok', data: { storeId: s.id, storeName: s.name, qrUrl: `/api/qr/lakala/${s.id}`, payEnabled: s.payEnabled } })
})

/**
 * @swagger
 * /api/platform/stores/{id}/reg-rules:
 *   put:
 *     summary: 会员注册规则设置
 *     tags: [总运营后台]
 *     responses: { '200': { description: 保存成功 } }
 */
router.put('/stores/:id/reg-rules', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '注册规则已保存', data: { storeId: req.params.id, ...req.body } })
})

// ============================================================
//  代理商管理 (1期)
// ============================================================

/**
 * @swagger
 * /api/platform/agents:
 *   get:
 *     summary: 代理商列表
 *     description: 代理商列表/统计（1期⭐）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 代理商列表 } }
 */
router.get('/agents', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const result = paginate(store.agents, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/platform/agents:
 *   post:
 *     summary: 新增代理商
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/agents', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const agent: Agent = { id: uuid(), merchantCount: 0, storeCount: 0, lastMonthProfit: 0, monthGameCoinRecharge: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body }
  store.create(store.agents, agent)
  res.json({ code: 200, message: '代理商创建成功', data: agent })
})

/**
 * @swagger
 * /api/platform/agents/{id}:
 *   get:
 *     summary: 代理商详情
 *     tags: [总运营后台]
 *     responses: { '200': { description: ok } }
 */
router.get('/agents/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const a = store.findById(store.agents, req.params.id)
  if (!a) return res.status(404).json({ code: 404, message: '代理商不存在' })
  res.json({ code: 200, message: 'ok', data: a })
})

/**
 * @swagger
 * /api/platform/agents/{id}:
 *   put:
 *     summary: 编辑代理商
 *     tags: [总运营后台]
 *     responses: { '200': { description: 更新成功 } }
 */
router.put('/agents/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.agents, req.params.id, req.body)
  if (!updated) return res.status(404).json({ code: 404, message: '代理商不存在' })
  res.json({ code: 200, message: '代理商已更新', data: updated })
})

/**
 * @swagger
 * /api/platform/agents/{id}:
 *   delete:
 *     summary: 删除代理商
 *     tags: [总运营后台]
 *     responses: { '200': { description: 删除成功 } }
 */
router.delete('/agents/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const ok = store.delete(store.agents, req.params.id)
  if (!ok) return res.status(404).json({ code: 404, message: '代理商不存在' })
  res.json({ code: 200, message: '代理商已删除' })
})

// ============================================================
//  游戏管理 (1期)
// ============================================================

/**
 * @swagger
 * /api/platform/games:
 *   get:
 *     summary: 游戏列表
 *     description: 游戏库列表/分类筛选/统计（1期⭐）
 *     tags: [总运营后台]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, online, offline] }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *     responses: { '200': { description: 游戏列表 } }
 */
router.get('/games', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { categoryId, status, keyword } = req.query as any
  let data = [...store.games]
  if (categoryId) data = data.filter(g => g.categoryId === categoryId)
  if (status) data = data.filter(g => g.status === status)
  if (keyword) data = data.filter(g => g.name.includes(keyword))
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  const stats = {
    total: store.games.length,
    online: store.games.filter(g => g.status === 'online').length,
    draft: store.games.filter(g => g.status === 'draft').length,
    totalPlayCount: store.games.reduce((s, g) => s + g.playCount, 0),
  }
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total, stats })
})

/**
 * @swagger
 * /api/platform/games:
 *   post:
 *     summary: 新建游戏
 *     description: 创建新游戏(含上传封面/资源包)
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/games', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const game: Game = { id: uuid(), version: '1.0.0', playCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body }
  store.create(store.games, game)
  res.json({ code: 200, message: '游戏创建成功', data: game })
})

/**
 * @swagger
 * /api/platform/games/{id}:
 *   get:
 *     summary: 游戏详情
 *     tags: [总运营后台]
 *     responses: { '200': { description: ok } }
 */
router.get('/games/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const g = store.findById(store.games, req.params.id)
  if (!g) return res.status(404).json({ code: 404, message: '游戏不存在' })
  res.json({ code: 200, message: 'ok', data: g })
})

/**
 * @swagger
 * /api/platform/games/{id}:
 *   put:
 *     summary: 编辑游戏
 *     tags: [总运营后台]
 *     responses: { '200': { description: 更新成功 } }
 */
router.put('/games/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.games, req.params.id, req.body)
  if (!updated) return res.status(404).json({ code: 404, message: '游戏不存在' })
  res.json({ code: 200, message: '游戏已更新', data: updated })
})

/**
 * @swagger
 * /api/platform/games/{id}/status:
 *   put:
 *     summary: 上下架游戏
 *     tags: [总运营后台]
 *     responses: { '200': { description: 操作成功 } }
 */
router.put('/games/:id/status', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { status } = req.body
  const updated = store.update(store.games, req.params.id, { status })
  if (!updated) return res.status(404).json({ code: 404, message: '游戏不存在' })
  res.json({ code: 200, message: `游戏已${status === 'online' ? '上线' : status === 'offline' ? '下线' : '保存为草稿'}`, data: updated })
})

// ===== 游戏题材 =====

/**
 * @swagger
 * /api/platform/game-categories:
 *   get:
 *     summary: 游戏题材列表
 *     tags: [总运营后台]
 *     responses: { '200': { description: 题材列表 } }
 */
router.get('/game-categories', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.gameCategories })
})

/**
 * @swagger
 * /api/platform/game-categories:
 *   post:
 *     summary: 新建游戏题材
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/game-categories', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const cat: GameCategory = { id: uuid(), gameCount: 0, ...req.body }
  store.create(store.gameCategories, cat)
  res.json({ code: 200, message: '题材创建成功', data: cat })
})

/**
 * @swagger
 * /api/platform/game-categories/{id}:
 *   delete:
 *     summary: 删除游戏题材
 *     tags: [总运营后台]
 *     responses: { '200': { description: 删除成功 } }
 */
router.delete('/game-categories/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const ok = store.delete(store.gameCategories, req.params.id)
  if (!ok) return res.status(404).json({ code: 404, message: '题材不存在' })
  res.json({ code: 200, message: '题材已删除' })
})

// ===== 内容分发 =====

/**
 * @swagger
 * /api/platform/content/distribute:
 *   get:
 *     summary: 分发列表
 *     description: 游戏分发统计/列表/记录（1期）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 分发数据 } }
 */
router.get('/content/distribute', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({
    code: 200, message: 'ok',
    data: {
      stats: { total: 28, success: 25, progress: 2, failed: 1, withdrawn: 0 },
      records: store.games.slice(0, 5).map(g => ({
        id: g.id, gameName: g.name, currentVersion: g.version, distributedVersion: g.version,
        status: Math.random() > 0.2 ? 'success' : 'progress', distributedStores: Math.floor(Math.random() * 8) + 1,
      })),
    },
  })
})

/**
 * @swagger
 * /api/platform/content/distribute:
 *   post:
 *     summary: 执行游戏分发
 *     tags: [总运营后台]
 *     responses: { '200': { description: 分发任务已创建 } }
 */
router.post('/content/distribute', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '分发任务已创建', data: { taskId: uuid(), ...req.body } })
})

/**
 * @swagger
 * /api/platform/content/withdraw:
 *   post:
 *     summary: 撤回分发
 *     tags: [总运营后台]
 *     responses: { '200': { description: 撤回成功 } }
 */
router.post('/content/withdraw', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '分发已撤回', data: { taskId: uuid() } })
})

// ===== Banner管理 =====

/**
 * @swagger
 * /api/platform/banners:
 *   get:
 *     summary: Banner列表
 *     tags: [总运营后台]
 *     responses: { '200': { description: 列表 } }
 */
router.get('/banners', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.banners })
})

/**
 * @swagger
 * /api/platform/banners:
 *   post:
 *     summary: 新增Banner
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/banners', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const banner: Banner = { id: uuid(), createdAt: new Date().toISOString(), ...req.body }
  store.create(store.banners, banner)
  res.json({ code: 200, message: 'Banner已创建', data: banner })
})

/**
 * @swagger
 * /api/platform/banners/{id}:
 *   put:
 *     summary: 编辑Banner
 *     tags: [总运营后台]
 *     responses: { '200': { description: 更新成功 } }
 */
router.put('/banners/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const updated = store.update(store.banners, req.params.id, req.body)
  if (!updated) return res.status(404).json({ code: 404, message: 'Banner不存在' })
  res.json({ code: 200, message: 'Banner已更新', data: updated })
})

/**
 * @swagger
 * /api/platform/banners/{id}:
 *   delete:
 *     summary: 删除Banner
 *     tags: [总运营后台]
 *     responses: { '200': { description: 删除成功 } }
 */
router.delete('/banners/:id', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const ok = store.delete(store.banners, req.params.id)
  if (!ok) return res.status(404).json({ code: 404, message: 'Banner不存在' })
  res.json({ code: 200, message: 'Banner已删除' })
})

// ===== 会员管理 =====

/**
 * @swagger
 * /api/platform/members/overview:
 *   get:
 *     summary: 会员数据概览
 *     description: 会员总数/新增/储值/活跃/流失（1期）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 概览数据 } }
 */
router.get('/members/overview', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({
    code: 200, message: 'ok',
    data: {
      totalMembers: store.members.length,
      todayNew: 12,
      totalBalance: store.members.reduce((s, m) => s + m.balance, 0),
      totalGameCoins: store.members.reduce((s, m) => s + m.gameCoins, 0),
      activeToday: store.members.filter(m => m.status === 'active').length,
      churned: store.members.filter(m => m.status === 'inactive').length,
    },
  })
})

/**
 * @swagger
 * /api/platform/members:
 *   get:
 *     summary: 会员列表
 *     description: 会员列表/搜索/筛选（1期）
 *     tags: [总运营后台]
 *     responses: { '200': { description: 会员列表 } }
 */
router.get('/members', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { keyword, level, status } = req.query as any
  let data = [...store.members]
  if (keyword) data = data.filter(m => m.name.includes(keyword) || m.phone.includes(keyword))
  if (level) data = data.filter(m => m.level === level)
  if (status) data = data.filter(m => m.status === status)
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/platform/members/growth:
 *   get:
 *     summary: 会员增长数据
 *     tags: [总运营后台]
 *     responses: { '200': { description: 增长数据 } }
 */
router.get('/members/growth', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 30 }, (_, i) => ({
    date: `5月${i + 1}日`, newMembers: Math.floor(Math.random() * 20 + 5),
    active: Math.floor(Math.random() * 100 + 50), churned: Math.floor(Math.random() * 5),
  })) })
})

/**
 * @swagger
 * /api/platform/members/ranking:
 *   get:
 *     summary: 会员消费排行TOP50
 *     tags: [总运营后台]
 *     responses: { '200': { description: 排行 } }
 */
router.get('/members/ranking', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const ranking = store.members.sort((a, b) => b.totalConsumption - a.totalConsumption).slice(0, 50)
  res.json({ code: 200, message: 'ok', data: ranking })
})

/**
 * @swagger
 * /api/platform/members/deposit-log:
 *   get:
 *     summary: 会员储值变更记录
 *     tags: [总运营后台]
 *     responses: { '200': { description: 变更记录 } }
 */
router.get('/members/deposit-log', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 20 }, (_, i) => ({
    id: uuid(), memberName: `会员${i + 1}`, type: ['recharge', 'consume', 'refund', 'adjust'][Math.floor(Math.random() * 4)],
    amount: Math.floor(Math.random() * 5000) / 100, createdAt: new Date().toISOString(),
  })) })
})

// ===== 订单流水 =====

/**
 * @swagger
 * /api/platform/orders/{type}:
 *   get:
 *     summary: 订单列表（按类型）
 *     description: 收银/点播/手动扣费/修改储值/兑换/赠送订单查询+标记异常（2期）
 *     tags: [总运营后台]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [cashier, vod, manual, balance, gamebean, promo] }
 *     responses: { '200': { description: 订单列表 } }
 */
router.get('/orders/:type', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  let data = store.orders
  const typeMap: Record<string, string> = {
    cashier: 'cashier', vod: 'vod', manual: 'manual_deduct',
    balance: 'balance_modify', gamebean: 'gamecoin_exchange', promo: 'gift',
  }
  const t = typeMap[req.params.type]
  if (t) data = data.filter(o => o.type === t)
  const result = paginate(data, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/platform/orders/{id}/flag:
 *   put:
 *     summary: 标记订单异常
 *     tags: [总运营后台]
 *     responses: { '200': { description: 标记成功 } }
 */
router.put('/orders/:id/flag', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { abnormal } = req.body
  const updated = store.update(store.orders, req.params.id, { abnormalFlag: abnormal })
  if (!updated) return res.status(404).json({ code: 404, message: '订单不存在' })
  res.json({ code: 200, message: `订单已标记为${abnormal ? '异常' : '正常'}`, data: updated })
})

// ===== 财务管理 =====

/**
 * @swagger
 * /api/platform/finance/overview:
 *   get:
 *     summary: 营收总览
 *     tags: [总运营后台]
 *     responses: { '200': { description: 营收数据 } }
 */
router.get('/finance/overview', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { totalRevenue: 1256800, platformFee: 188520, pendingSettlement: 235000 } })
})

// ===== 系统设置/账号 =====

/**
 * @swagger
 * /api/platform/settings:
 *   get:
 *     summary: 系统参数列表
 *     tags: [总运营后台]
 *     responses: { '200': { description: 参数列表 } }
 */
router.get('/settings', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.systemParams.filter(p => p.scope === 'platform') })
})

/**
 * @swagger
 * /api/platform/settings:
 *   put:
 *     summary: 更新系统参数
 *     tags: [总运营后台]
 *     responses: { '200': { description: 保存成功 } }
 */
router.put('/settings', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const { key, value } = req.body
  const param = store.systemParams.find(p => p.key === key && p.scope === 'platform')
  if (param) param.value = value
  res.json({ code: 200, message: '参数已更新' })
})

/**
 * @swagger
 * /api/platform/users:
 *   get:
 *     summary: 平台账号列表
 *     tags: [总运营后台]
 *     responses: { '200': { description: 账号列表 } }
 */
router.get('/users', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { id: uuid(), account: 'admin', name: '超级管理员', role: 'platform_admin', status: 'active' },
    { id: uuid(), account: 'operator01', name: '运营小张', role: 'platform_admin', status: 'active' },
  ] })
})

/**
 * @swagger
 * /api/platform/users:
 *   post:
 *     summary: 新增平台账号
 *     tags: [总运营后台]
 *     responses: { '200': { description: 创建成功 } }
 */
router.post('/users', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '账号创建成功', data: { id: uuid(), ...req.body } })
})

/**
 * @swagger
 * /api/platform/roles:
 *   get:
 *     summary: 角色列表
 *     tags: [总运营后台]
 *     responses: { '200': { description: 角色 } }
 */
router.get('/roles', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: [
    { id: uuid(), name: '超级管理员', permissions: ['*'] },
    { id: uuid(), name: '运营专员', permissions: ['merchant:read', 'store:read', 'game:*'] },
    { id: uuid(), name: '财务', permissions: ['finance:*', 'settlement:*'] },
  ] })
})

/**
 * @swagger
 * /api/platform/account/profile:
 *   get:
 *     summary: 获取个人信息
 *     tags: [总运营后台]
 *     responses: { '200': { description: 个人信息 } }
 */
router.get('/account/profile', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { name: '超级管理员', account: 'admin', phone: '13800000000', email: 'admin@vrtouhao.com', avatar: '' } })
})

/**
 * @swagger
 * /api/platform/account/profile:
 *   put:
 *     summary: 修改个人信息
 *     tags: [总运营后台]
 *     responses: { '200': { description: 更新成功 } }
 */
router.put('/account/profile', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '个人信息已更新', data: req.body })
})

/**
 * @swagger
 * /api/platform/account/password:
 *   put:
 *     summary: 修改密码
 *     tags: [总运营后台]
 *     responses: { '200': { description: 修改成功 } }
 */
router.put('/account/password', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '密码修改成功' })
})

/**
 * @swagger
 * /api/platform/account/login-logs:
 *   get:
 *     summary: 登录记录
 *     tags: [总运营后台]
 *     responses: { '200': { description: 登录日志 } }
 */
router.get('/account/login-logs', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 10 }, (_, i) => ({
    id: uuid(), device: `Chrome/${120 - i}.0`, ip: `192.168.1.${100 + i}`, time: new Date(Date.now() - i * 86400000).toISOString(),
  })) })
})

/**
 * @swagger
 * /api/platform/notifications:
 *   get:
 *     summary: 系统通知列表
 *     tags: [总运营后台]
 *     responses: { '200': { description: 通知 } }
 */
router.get('/notifications', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const result = paginate(store.notifications, 1, 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/platform/feedbacks:
 *   get:
 *     summary: 全平台反馈汇总
 *     tags: [总运营后台]
 *     responses: { '200': { description: 反馈列表 } }
 */
router.get('/feedbacks', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const result = paginate(store.feedbacks, 1, 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

export default router
