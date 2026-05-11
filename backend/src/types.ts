import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config'

// ===== 用户角色类型 =====
export enum UserRole {
  PlatformAdmin = 'platform_admin',
  ShopOwner = 'shop_owner',
  ShopStaff = 'shop_staff',
  Agent = 'agent',
}

// ===== JWT Payload =====
export interface JwtPayload {
  userId: string
  role: UserRole
  shopId?: string
  agentId?: string
}

// ===== 带用户信息的请求 =====
export interface AuthRequest extends Request {
  user?: JwtPayload
}

// ===== 通用 API 响应 =====
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  total?: number
}

// ===== 分页参数 =====
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// ===== 商家 =====
export interface Merchant {
  id: string
  name: string
  contactPerson: string
  phone: string
  region: string
  address: string
  status: 'pending' | 'active' | 'suspended'
  agentId?: string
  totalStores: number
  lastMonthProfit: number
  createdAt: string
  updatedAt: string
}

// ===== 店铺 =====
export interface Store {
  id: string
  name: string
  merchantId: string
  merchantName: string
  region: string
  address: string
  manager: string
  phone: string
  deviceCount: number
  status: 'online' | 'offline' | 'maintain'
  payEnabled: boolean
  regCode: string
  todayRevenue: number
  monthRevenue: number
  memberCount: number
  createdAt: string
  updatedAt: string
}

// ===== 代理商 =====
export interface Agent {
  id: string
  name: string
  contactPerson: string
  phone: string
  region: string
  merchantCount: number
  storeCount: number
  profitRate: number
  lastMonthProfit: number
  monthGameCoinRecharge: number
  createdAt: string
  updatedAt: string
}

// ===== 游戏 =====
export interface Game {
  id: string
  name: string
  categoryId: string
  categoryName: string
  coverUrl: string
  bannerUrl: string
  resourceUrl: string
  version: string
  description: string
  duration: number // minutes
  gameCoins: number
  score: number
  gameType: 'host' | 'headset'
  payMode: 'single' | 'subscription'
  status: 'draft' | 'online' | 'offline'
  sortOrder: number
  playCount: number
  createdAt: string
  updatedAt: string
}

// ===== 游戏题材/分类 =====
export interface GameCategory {
  id: string
  name: string
  sortOrder: number
  gameCount: number
}

// ===== 设备（主机/头显） =====
export interface Device {
  id: string
  sn: string
  name: string
  type: 'host' | 'headset' | 'third_party'
  storeId: string
  storeName: string
  model: string
  status: 'online' | 'offline' | 'idle' | 'busy' | 'maintain'
  boundHeadsetId?: string
  boundHostId?: string
  cpu?: string
  memory?: string
  disk?: string
  battery?: number
  ipd?: number
  refreshRate?: number
  brightness?: number
  firmwareVersion?: string
  lastHeartbeat?: string
  createdAt: string
  updatedAt: string
}

// ===== 会员 =====
export interface Member {
  id: string
  name: string
  phone: string
  wechatOpenId?: string
  storeId: string
  merchantId: string
  level: string
  balance: number // 储值余额
  gameCoins: number
  prepaidTimes: number
  totalConsumption: number
  orderCount: number
  status: 'active' | 'inactive' | 'frozen'
  lastConsumeTime?: string
  createdAt: string
  updatedAt: string
}

// ===== 订单 =====
export enum OrderType {
  Cashier = 'cashier',
  VOD = 'vod',
  ManualDeduct = 'manual_deduct',
  BalanceModify = 'balance_modify',
  GameCoinExchange = 'gamecoin_exchange',
  Gift = 'gift',
}

export interface Order {
  id: string
  orderNo: string
  type: OrderType
  storeId: string
  memberId?: string
  amount: number
  payMethod?: 'wechat' | 'alipay' | 'cash' | 'member_balance'
  status: 'pending' | 'paid' | 'refunded' | 'abnormal'
  abnormalFlag?: boolean
  remark?: string
  createdAt: string
  updatedAt: string
}

// ===== 充值套餐 =====
export interface RechargePackage {
  id: string
  name: string
  price: number
  depositAmount: number
  gameCoins: number
  gameCoinValidityDays: number
  prepaidTimes: number
  timesValidityDays: number
  status: 'active' | 'inactive'
  storeId: string
  createdAt: string
}

// ===== 套票 =====
export interface TicketPackage {
  id: string
  name: string
  type: 'time' | 'count'
  price: number
  duration?: number // hours, for time-based
  count?: number // for count-based
  validityDays: number
  memberLevel: string
  status: 'active' | 'inactive'
  storeId: string
  createdAt: string
}

// ===== 优惠券 =====
export interface Coupon {
  id: string
  name: string
  type: 'full_reduction' | 'discount' | 'special' | 'exchange'
  value: number
  minAmount?: number
  rule: string
  totalCount: number
  issuedCount: number
  usedCount: number
  validityStart: string
  validityEnd: string
  status: 'active' | 'expired' | 'disabled'
  storeId: string
  createdAt: string
}

// ===== Banner =====
export interface Banner {
  id: string
  imageUrl: string
  linkType: 'game' | 'url' | 'none'
  linkValue?: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
}

// ===== 通知/消息 =====
export interface Notification {
  id: string
  title: string
  content: string
  type: 'system' | 'activity' | 'alert'
  targetRole: UserRole[]
  isRead: boolean
  createdAt: string
}

// ===== 反馈 =====
export interface Feedback {
  id: string
  memberId: string
  memberName: string
  type: string
  content: string
  reply?: string
  status: 'pending' | 'resolved'
  storeId: string
  createdAt: string
  updatedAt: string
}

// ===== 设施参数 =====
export interface SystemParam {
  id: string
  key: string
  value: string
  description: string
  scope: 'platform' | 'shop'
  storeId?: string
}

// ===== 游戏豆充值记录 =====
export interface GameCoinRecharge {
  id: string
  storeId: string
  amount: number
  gameCoins: number
  payMethod: 'wechat' | 'alipay'
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

// ===== 分账记录 =====
export interface SplitRecord {
  id: string
  orderNo: string
  merchantId: string
  agentId?: string
  amount: number
  merchantShare: number
  agentShare?: number
  platformShare: number
  status: 'pending' | 'success' | 'failed'
  createdAt: string
}

// ===== 结算记录 =====
export interface Settlement {
  id: string
  merchantId: string
  merchantName: string
  period: string // YYYY-MM
  totalRevenue: number
  platformFee: number
  agentFee?: number
  settlementAmount: number
  status: 'pending' | 'settled' | 'paid'
  settledAt?: string
  createdAt: string
}
