import { Router, Response } from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { config } from '../config'
import { authMiddleware } from '../middleware'
import { AuthRequest, ApiResponse, UserRole } from '../types'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: 认证管理
 *   description: 用户登录与Token管理 (1期)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 支持微信扫码/手机号验证码登录，返回JWT Token
 *     tags: [认证管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [account, password]
 *             properties:
 *               account: { type: string, description: '手机号或微信openId' }
 *               password: { type: string, description: '密码或验证码' }
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code: { type: number }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user: { type: object }
 */
router.post('/login', (req: AuthRequest, res: Response<ApiResponse>) => {
  const { account, password } = req.body
  if (!account || !password) {
    return res.status(400).json({ code: 400, message: '账号和密码不能为空' })
  }

  // Mock认证 - 实际应查数据库
  const roleMap: Record<string, UserRole> = {
    admin: UserRole.PlatformAdmin,
    shop: UserRole.ShopOwner,
    agent: UserRole.Agent,
  }
  const role = roleMap[account] || UserRole.ShopOwner
  const payload = { userId: uuid(), role }
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any })

  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: { id: payload.userId, account, role, name: `${role}用户` },
    },
  })
})

/**
 * @swagger
 * /api/auth/wechat/qr:
 *   get:
 *     summary: 获取微信登录二维码
 *     description: 生成微信扫码登录二维码（1期）
 *     tags: [认证管理]
 *     responses:
 *       200:
 *         description: 返回二维码图片URL
 */
router.get('/wechat/qr', (_req, res: Response<ApiResponse>) => {
  res.json({
    code: 200,
    message: 'ok',
    data: { qrUrl: 'https://weixin.qq.com/qr/mock_qr_code', expireSeconds: 300 },
  })
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 刷新Token
 *     description: 在Token过期前刷新，延长有效期
 *     tags: [认证管理]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 新的Token
 */
router.post('/refresh', authMiddleware, (req: AuthRequest, res: Response<ApiResponse>) => {
  const payload = { userId: req.user!.userId, role: req.user!.role }
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any })
  res.json({ code: 200, message: 'Token已刷新', data: { token } })
})

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 登出
 *     description: 清除Token，退出登录
 *     tags: [认证管理]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 登出成功
 */
router.post('/logout', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '已登出' })
})

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 会员注册
 *     description: 手机号/微信授权注册为会员（1期 - 基础设施）
 *     tags: [认证管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone: { type: string }
 *               name: { type: string }
 *               code: { type: string, description: '邀请码/店铺注册码' }
 *     responses:
 *       200:
 *         description: 注册成功
 */
router.post('/register', (req, res: Response<ApiResponse>) => {
  const { phone, name, code } = req.body
  if (!phone) return res.status(400).json({ code: 400, message: '手机号不能为空' })
  res.json({ code: 200, message: '注册成功', data: { id: uuid(), phone, name } })
})

export default router
