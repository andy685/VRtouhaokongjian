import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware, paginate } from '../middleware'
import { store } from '../store'
import { AuthRequest, ApiResponse } from '../types'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 代理商系统
 *   description: 代理商运营后台
 */

/**
 * @swagger
 * /api/agent/dashboard/kpi:
 *   get:
 *     summary: 代理商KPI指标
 *     tags: [代理商系统]
 *     responses: { '200': { description: KPI } }
 */
router.get('/dashboard/kpi', authMiddleware, (_req, res: Response<ApiResponse>) => {
  const a = store.agents[0]
  res.json({ code: 200, message: 'ok', data: {
    merchantCount: store.merchants.length, storeCount: store.stores.length,
    monthGameCoinRecharge: a?.monthGameCoinRecharge || 0, lastMonthProfit: a?.lastMonthProfit || 0,
  }})
})

/**
 * @swagger
 * /api/agent/merchants:
 *   get:
 *     summary: 辖区商家列表
 *     description: 代理商辖区商家管理（1期）
 *     tags: [代理商系统]
 *     responses: { '200': { description: 商家列表 } }
 */
router.get('/merchants', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const result = paginate(store.merchants, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/agent/stores:
 *   get:
 *     summary: 辖区店铺列表
 *     description: 代理商店铺概览（1期）
 *     tags: [代理商系统]
 *     responses: { '200': { description: 店铺 } }
 */
router.get('/stores', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const result = paginate(store.stores, parseInt(req.query.page as string) || 1, parseInt(req.query.pageSize as string) || 10)
  res.json({ code: 200, message: 'ok', data: result.list, total: result.total })
})

/**
 * @swagger
 * /api/agent/commission/details:
 *   get:
 *     summary: 分润明细
 *     description: 分润数据统计+明细（2期）
 *     tags: [代理商系统]
 *     responses: { '200': { description: 分润数据 } }
 */
router.get('/commission/details', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    stats: { totalProfit: 156800, monthProfit: 28500, yesterdayProfit: 890 },
    details: Array.from({ length: 20 }, (_, i) => ({
      id: uuid(), merchantName: store.merchants[i % store.merchants.length]?.name,
      orderNo: `ORD${String(i + 1).padStart(8, '0')}`, amount: Math.floor(Math.random() * 10000) / 100,
      profitAmount: Math.floor(Math.random() * 2000) / 100, profitRate: `${(Math.random() * 0.15 + 0.05).toFixed(2)}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    })),
  }})
})

router.get('/settlements', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    stats: { totalSettled: 285000, pendingSettlement: 32000 },
    list: Array.from({ length: 6 }, (_, i) => ({
      id: uuid(), period: `2024-0${i + 1}`, totalRevenue: Math.floor(Math.random() * 100000 + 30000),
      profitAmount: Math.floor(Math.random() * 15000 + 5000), status: i < 4 ? 'settled' : 'pending',
      settledAt: i < 4 ? new Date(Date.now() - i * 30 * 86400000).toISOString() : undefined,
    })),
  }})
})

/**
 * @swagger
 * /api/agent/bank-account:
 *   get:
 *     summary: 提现账户信息
 *     description: 银行账户脱敏展示（2期）
 *     tags: [代理商系统]
 *     responses: { '200': { description: 账户信息 } }
 */
router.get('/bank-account', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    bankName: '中国银行', accountHolder: '陈**', accountNumber: '**** **** **** 8888',
    phone: '139****0001', isVerified: true,
  }})
})

router.put('/bank-account', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '提现账户已更新（冷却10分钟）', data: req.body })
})

router.get('/reports/revenue', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    stats: { totalRevenue: 1256800, totalOrders: 5680, avgOrderAmount: 221.3 },
    trend: Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}月`, revenue: Math.floor(Math.random() * 200000 + 50000) })),
    paymentDist: { wechat: 45, alipay: 35, cash: 12, balance: 8 },
    merchantRanking: store.merchants.map(m => ({ name: m.name, revenue: Math.floor(Math.random() * 500000 + 50000) })).sort((a, b) => b.revenue - a.revenue),
  }})
})

router.get('/reports/members', authMiddleware, (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    stats: { totalMembers: store.members.length, newMembers: 68, paidMembers: 320, repurchaseRate: '35.6%' },
    growthTrend: Array.from({ length: 30 }, (_, i) => ({ date: `5月${i + 1}日`, count: Math.floor(Math.random() * 15 + 3) })),
    levelDist: [
      { level: '普通', count: store.members.filter(m => m.level === '普通').length },
      { level: '银卡', count: store.members.filter(m => m.level === '银卡').length },
      { level: '金卡', count: store.members.filter(m => m.level === '金卡').length },
      { level: '钻石', count: store.members.filter(m => m.level === '钻石').length },
    ],
    merchantMembers: store.merchants.map(m => ({ name: m.name, count: Math.floor(Math.random() * 500 + 100) })),
  }})
})

export default router
