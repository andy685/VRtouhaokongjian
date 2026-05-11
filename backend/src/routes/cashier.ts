import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { AuthRequest, ApiResponse } from '../types'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 电脑端收银系统
 *   description: 门店收银终端接口 (待定)
 */

/**
 * @swagger
 * /api/cashier/login:
 *   post:
 *     summary: 收银端登录
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 登录成功 } }
 */
router.post('/login', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '登录成功', data: { token: uuid(), staffName: '收银员A', storeName: '深圳福田旗舰店' } })
})

/**
 * @swagger
 * /api/cashier/sales/walk-in:
 *   post:
 *     summary: 散客买单
 *     description: 选择消费项目→支付→支付成功（待定）
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 买单成功 } }
 */
router.post('/sales/walk-in', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '买单成功', data: { orderNo: `CS${Date.now()}`, amount: 68, payMethod: 'wechat' } })
})

/**
 * @swagger
 * /api/cashier/sales/member:
 *   post:
 *     summary: 会员买单
 *     description: 选择会员→使用优惠券→支付
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 买单成功 } }
 */
router.post('/sales/member', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '会员买单成功', data: { orderNo: `CS${Date.now()}`, memberName: '张三', balanceAfter: 356, discountAmount: 20 } })
})

/**
 * @swagger
 * /api/cashier/members:
 *   post:
 *     summary: 新增会员(收银端)
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 会员已创建 } }
 */
router.post('/members', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '会员已创建', data: { id: uuid(), name: '新会员', phone: '13800009999' } })
})

/**
 * @swagger
 * /api/cashier/members/deduct:
 *   post:
 *     summary: 会员扣费
 *     description: 选择项目→选择会员→直接扣费
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 扣费成功 } }
 */
router.post('/members/deduct', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '扣费成功', data: { deductAmount: 68, balanceAfter: 432 } })
})

/**
 * @swagger
 * /api/cashier/members/recharge:
 *   post:
 *     summary: 会员充值(收银端)
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 充值成功 } }
 */
router.post('/members/recharge', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '充值成功', data: { packageName: '热门套餐', amount: 49.9, depositAmount: 50, gameCoins: 300 } })
})

/**
 * @swagger
 * /api/cashier/sales/packages:
 *   post:
 *     summary: 套票/商品购买
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 购买成功 } }
 */
router.post('/sales/packages', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '购买成功' })
})

/**
 * @swagger
 * /api/cashier/shift/end:
 *   post:
 *     summary: 交班结算
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 交班完成 } }
 */
router.post('/shift/end', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '交班完成', data: {
    staffName: '收银员A', shiftStart: '09:00', shiftEnd: '18:00',
    totalRevenue: 5230, orderCount: 28, cashAmount: 860, cardAmount: 4200,
  }})
})

/**
 * @swagger
 * /api/cashier/orders:
 *   get:
 *     summary: 订单查询(收银端)
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 订单列表 } }
 */
router.get('/orders', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: Array.from({ length: 20 }, (_, i) => ({
    id: uuid(), orderNo: `CS${Date.now()}${i}`, type: ['收银', '点播', '扣费', '充值'][Math.floor(Math.random() * 4)],
    amount: Math.floor(Math.random() * 500 + 10), payMethod: ['微信', '支付宝', '现金', '余额'][Math.floor(Math.random() * 4)],
    status: 'paid', createdAt: new Date().toISOString(),
  })) })
})

/**
 * @swagger
 * /api/cashier/orders/{id}/refund:
 *   post:
 *     summary: 退款(收银端)
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 退款成功 } }
 */
router.post('/orders/:id/refund', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '退款成功', data: { refundAmount: 68, refundMethod: '原路退回' } })
})

/**
 * @swagger
 * /api/cashier/revenue:
 *   get:
 *     summary: 营收概览(收银端)
 *     tags: [电脑端收银系统]
 *     responses: { '200': { description: 营收数据 } }
 */
router.get('/revenue', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    overview: { todayRevenue: 8360, shiftRevenue: 5230, storeRevenue: 8360 },
    detail: { cash: 860, wechat: 4200, alipay: 2800, memberBalance: 500 },
  }})
})

export default router
