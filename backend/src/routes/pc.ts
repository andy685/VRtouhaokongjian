import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware, paginate } from '../middleware'
import { store } from '../store'
import { AuthRequest, ApiResponse } from '../types'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: PC点播系统
 *   description: VR头显点播终端接口 (1期)
 */

/**
 * @swagger
 * /api/pc/banner:
 *   get:
 *     summary: 待机画面内容
 *     description: 宣传视频/海报内容获取（1期）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 待机画面 } }
 */
router.get('/banner', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    videoUrl: '/uploads/videos/promo.mp4', posterUrl: '/uploads/images/poster.jpg',
    interval: 30, // seconds
  }})
})

/**
 * @swagger
 * /api/pc/games:
 *   get:
 *     summary: 游戏列表
 *     description: 功能导航+游戏列表+头显状态（1期⭐）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 游戏+设备 } }
 */
router.get('/games', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    navItems: [
      { icon: 'gamepad', label: '游戏大厅', path: '/games' },
      { icon: 'store', label: '商店', path: '/store' },
      { icon: 'download', label: '下载管理', path: '/downloads' },
      { icon: 'settings', label: '设备管理', path: '/devices' },
    ],
    games: store.games.filter(g => g.status === 'online').slice(0, 20).map(g => ({
      id: g.id, name: g.name, coverUrl: g.coverUrl, categoryName: g.categoryName,
      score: g.score, gameCoins: g.gameCoins, duration: g.duration, status: g.status,
    })),
    devices: store.devices.filter(d => d.type === 'headset').slice(0, 10).map(d => ({
      id: d.id, name: d.name, sn: d.sn, status: d.status, battery: d.battery,
    })),
  }})
})

/**
 * @swagger
 * /api/pc/devices:
 *   get:
 *     summary: 头显设备列表
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 设备列表 } }
 */
router.get('/devices', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.devices.filter(d => d.type === 'headset').map(d => ({
    id: d.id, name: d.name, sn: d.sn, status: d.status, model: d.model, battery: d.battery,
  })) })
})

/**
 * @swagger
 * /api/pc/games/launch:
 *   post:
 *     summary: 启动游戏
 *     description: 支付成功后启动游戏（含播控服务，1期）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 启动成功 } }
 */
router.post('/games/launch', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { sessionId: uuid(), launchStatus: 'starting', estimatedTime: 15 }})
})

/**
 * @swagger
 * /api/pc/orders:
 *   post:
 *     summary: 创建点播订单
 *     description: 提交点播订单（1期，直接点播模式）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 订单已创建 } }
 */
router.post('/orders', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { orderId: uuid(), orderNo: `VOD${Date.now()}`, status: 'pending' }})
})

/**
 * @swagger
 * /api/pc/store/games:
 *   get:
 *     summary: 商店游戏列表
 *     description: 展示所有分发到店铺的游戏（1期）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 游戏列表 } }
 */
router.get('/store/games', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: store.games.filter(g => g.status === 'online').map(g => ({
    id: g.id, name: g.name, coverUrl: g.coverUrl, categoryName: g.categoryName,
    score: g.score, gameCoins: g.gameCoins, duration: g.duration, gameType: g.gameType,
    installed: Math.random() > 0.5,
  })) })
})

/**
 * @swagger
 * /api/pc/store/games/{id}:
 *   get:
 *     summary: 游戏详情(商店)
 *     description: 详情含宣传视频/图片素材（1期）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 游戏详情 } }
 */
router.get('/store/games/:id', (req, res: Response<ApiResponse>) => {
  const game = store.findById(store.games, req.params.id)
  if (!game) return res.status(404).json({ code: 404, message: '游戏不存在' })
  res.json({ code: 200, message: 'ok', data: {
    ...game, screenshots: ['/uploads/screenshots/1.jpg', '/uploads/screenshots/2.jpg', '/uploads/screenshots/3.jpg'],
    videoUrl: '/uploads/videos/game_preview.mp4',
    requirements: { host: 'VR-Host-Pro', headset: 'VR-Headset-X1', storage: '2.5GB' },
  }})
})

/**
 * @swagger
 * /api/pc/games/download:
 *   post:
 *     summary: 下载游戏
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 下载任务已创建 } }
 */
router.post('/games/download', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: { taskId: uuid(), progress: 0, speed: '5.2MB/s', estimatedTime: 120 }})
})

/**
 * @swagger
 * /api/pc/downloads:
 *   get:
 *     summary: 下载列表
 *     description: 下载中/已安装游戏列表（1期）
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 下载列表 } }
 */
router.get('/downloads', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: 'ok', data: {
    downloading: [
      { id: uuid(), gameName: '星际穿越VR', progress: 65, speed: '8.3MB/s', totalSize: '2.5GB' },
    ],
    installed: store.games.slice(0, 5).map(g => ({
      id: g.id, gameName: g.name, installDate: '2024-06-01', size: '2.5GB',
    })),
  }})
})

/**
 * @swagger
 * /api/pc/screen/split:
 *   post:
 *     summary: 分屏设置
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 设置成功 } }
 */
router.post('/screen/split', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '分屏模式已设置' })
})

/**
 * @swagger
 * /api/pc/screen/mirror:
 *   post:
 *     summary: 投屏
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 投屏成功 } }
 */
router.post('/screen/mirror', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '投屏已开始' })
})

/**
 * @swagger
 * /api/pc/devices/bind:
 *   post:
 *     summary: 绑定头显
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 绑定成功 } }
 */
router.post('/devices/bind', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '头显绑定成功' })
})

/**
 * @swagger
 * /api/pc/games/install:
 *   post:
 *     summary: 安装游戏到设备
 *     tags: [PC点播系统]
 *     responses: { '200': { description: 安装中 } }
 */
router.post('/games/install', (_req, res: Response<ApiResponse>) => {
  res.json({ code: 200, message: '游戏安装任务已创建' })
})

export default router
