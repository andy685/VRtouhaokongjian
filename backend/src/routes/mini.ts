import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { AuthRequest, ApiResponse } from '../types'
import { store } from '../store'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 小程序
 *   description: 微信小程序前端接口
 */

/**
 * @swagger
 * /api/mini/home:
 *   get:
 *     summary: 首页数据
 *     description: Banner/游戏推荐/门店信息（1期）
 *     tags: [小程序]
 *     responses: { '200': { description: 首页数据 } }
 */
router.get('/home', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    banners: store.banners.filter(b => b.status === 'active').map(b => ({
      id: b.id, imageUrl: b.imageUrl, linkType: b.linkType, linkValue: b.linkValue,
    })),
    recommendedGames: store.games.filter(g => g.status === 'online').slice(0, 6).map(g => ({
      id: g.id, name: g.name, coverUrl: g.coverUrl, score: g.score,
    })),
    storeInfo: { id: store.stores[0]?.id, name: store.stores[0]?.name, address: store.stores[0]?.address },
  }})
})

/**
 * @swagger
 * /api/mini/orders:
 *   post:
 *     summary: 创建订单
 *     description: 提交订单信息（1期）
 *     tags: [小程序]
 *     responses: { '200': { description: 订单已创建 } }
 */
router.post('/orders', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '订单已创建', data: { orderId: uuid(), orderNo: `MINI${Date.now()}` }})
})

/**
 * @swagger
 * /api/mini/recharge/packages:
 *   get:
 *     summary: 充值套餐列表
 *     description: 充值套餐展示（1期）
 *     tags: [小程序]
 *     responses: { '200': { description: 套餐列表 } }
 */
router.get('/recharge/packages', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.rechargePackages.map(p => ({
    id: p.id, name: p.name, price: p.price, depositAmount: p.depositAmount,
    gameCoins: p.gameCoins, gameCoinValidityDays: p.gameCoinValidityDays,
    prepaidTimes: p.prepaidTimes, timesValidityDays: p.timesValidityDays,
  })) })
})

/**
 * @swagger
 * /api/mini/members/profile:
 *   get:
 *     summary: 会员信息
 *     description: 会员资料/余额/游戏币（1期）
 *     tags: [小程序]
 *     responses: { '200': { description: 会员信息 } }
 */
router.get('/members/profile', (_req, res: Response<ApiResponse>) => {
  const m = store.members[0]
  res.json({ code: 200, message: 'ok', data: m ? {
    id: m.id, name: m.name, phone: m.phone, level: m.level,
    balance: m.balance, gameCoins: m.gameCoins, prepaidTimes: m.prepaidTimes,
    totalConsumption: m.totalConsumption, orderCount: m.orderCount,
  } : null })
})

/**
 * @swagger
 * /api/mini/orders:
 *   get:
 *     summary: 我的订单列表
 *     tags: [小程序]
 *     responses: { '200': { description: 订单列表 } }
 */
router.get('/orders', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.orders.slice(0, 10).map(o => ({
    id: o.id, orderNo: o.orderNo, type: o.type, amount: o.amount,
    status: o.status, createdAt: o.createdAt,
  })) })
})

/**
 * @swagger
 * /api/mini/coupons:
 *   get:
 *     summary: 优惠券列表
 *     description: 查看优惠券及使用状态（2期）
 *     tags: [小程序]
 *     responses: { '200': { description: 优惠券 } }
 */
router.get('/coupons', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.coupons.slice(0, 10).map(c => ({
    id: c.id, name: c.name, type: c.type, value: c.value, minAmount: c.minAmount,
    validityStart: c.validityStart, validityEnd: c.validityEnd, used: Math.random() > 0.5,
  })) })
})

/**
 * @swagger
 * /api/mini/feedbacks:
 *   post:
 *     summary: 提交意见反馈
 *     tags: [小程序]
 *     responses: { '200': { description: 提交成功 } }
 */
router.post('/feedbacks', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '反馈已提交，感谢您的意见' })
})

export default router
