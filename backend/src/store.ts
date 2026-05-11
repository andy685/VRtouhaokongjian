import { v4 as uuid } from 'uuid'
import {
  Merchant, Store, Agent, Game, GameCategory, Device,
  Member, Order, OrderType, RechargePackage, TicketPackage,
  Coupon, Banner, Notification, Feedback, SystemParam, Settlement,
  UserRole, GameCoinRecharge,
} from './types'

// ===== 内存数据存储 =====
// 所有数据存储在内存中，方便后续替换为真实数据库
class DataStore {
  merchants: Merchant[] = []
  stores: Store[] = []
  agents: Agent[] = []
  games: Game[] = []
  gameCategories: GameCategory[] = []
  devices: Device[] = []
  members: Member[] = []
  orders: Order[] = []
  rechargePackages: RechargePackage[] = []
  ticketPackages: TicketPackage[] = []
  coupons: Coupon[] = []
  banners: Banner[] = []
  notifications: Notification[] = []
  feedbacks: Feedback[] = []
  systemParams: SystemParam[] = []
  settlements: Settlement[] = []
  gameCoinRecharges: GameCoinRecharge[] = []

  constructor() {
    this.seed()
  }

  // ===== 种子数据 =====
  private seed() {
    // 商家
    this.merchants.push(
      { id: uuid(), name: '恒然集团', contactPerson: '张总', phone: '13800001001', region: '深圳', address: '深圳市南山区科技园', status: 'active', totalStores: 3, lastMonthProfit: 85600, createdAt: '2024-01-01', updatedAt: '2024-06-01' },
      { id: uuid(), name: '幻影星空', contactPerson: '李总', phone: '13800001002', region: '广州', address: '广州市天河区', status: 'active', totalStores: 2, lastMonthProfit: 62300, createdAt: '2024-02-01', updatedAt: '2024-06-01' },
      { id: uuid(), name: '利民街商家', contactPerson: '王总', phone: '13800001003', region: '北京', address: '北京市朝阳区', status: 'active', totalStores: 2, lastMonthProfit: 42100, createdAt: '2024-03-01', updatedAt: '2024-06-01' },
    )

    // 店铺
    const storeNames = ['深圳福田旗舰店', '南山科技园店', '广州天河店', '北京朝阳店', '上海浦东店', '成都太古里店', '杭州西湖店', '武汉光谷店']
    const storeStatuses: Array<'online' | 'offline' | 'maintain'> = ['online', 'online', 'online', 'offline', 'online', 'online', 'maintain', 'online']
    storeNames.forEach((name, i) => {
      this.stores.push({
        id: uuid(), name,
        merchantId: this.merchants[i % 3].id, merchantName: this.merchants[i % 3].name,
        region: ['深圳', '深圳', '广州', '北京', '上海', '成都', '杭州', '武汉'][i],
        address: `${name}路1号`, manager: `店长${String.fromCharCode(65 + i)}`,
        phone: `1380000${8001 + i}`, deviceCount: 8 + i * 2,
        status: storeStatuses[i], payEnabled: i % 3 !== 0,
        regCode: `REG-${String(i + 1).padStart(4, '0')}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        todayRevenue: Math.floor(Math.random() * 30000),
        monthRevenue: Math.floor(Math.random() * 600000),
        memberCount: 500 + i * 200,
        createdAt: `2024-0${(i % 3) + 1}-${10 + i * 5}`,
        updatedAt: '2024-06-01',
      })
    })

    // 代理商
    this.agents.push(
      { id: uuid(), name: '华南代理', contactPerson: '陈经理', phone: '13900001001', region: '华南', merchantCount: 5, storeCount: 12, profitRate: 0.15, lastMonthProfit: 28500, monthGameCoinRecharge: 50000, createdAt: '2024-01-15', updatedAt: '2024-06-01' },
      { id: uuid(), name: '华东代理', contactPerson: '刘经理', phone: '13900001002', region: '华东', merchantCount: 4, storeCount: 10, profitRate: 0.12, lastMonthProfit: 22300, monthGameCoinRecharge: 38000, createdAt: '2024-02-10', updatedAt: '2024-06-01' },
    )

    // 游戏分类
    const cats = ['射击', '冒险', '休闲', '竞速', '音乐', '恐怖', '模拟', '体育']
    cats.forEach((name, i) => {
      this.gameCategories.push({ id: uuid(), name, sortOrder: i + 1, gameCount: 2 + i })
    })

    // 游戏
    const gameNames = ['星际穿越VR', '节奏光剑', '半衰期:艾利克斯', '生化危机4VR', '节奏拳击', '绝体绝命都市VR', '鬼屋大冒险', '赛车计划VR', '恐龙乐园', '太空乒乓球']
    gameNames.forEach((name) => {
      const cat = this.gameCategories[Math.floor(Math.random() * this.gameCategories.length)]
      this.games.push({
        id: uuid(), name, categoryId: cat.id, categoryName: cat.name,
        coverUrl: `/uploads/games/${name}.jpg`, bannerUrl: `/uploads/games/${name}_banner.jpg`,
        resourceUrl: `/uploads/resources/${name}.zip`, version: '1.0.0',
        description: `${name}是一款沉浸式VR体验游戏，支持多人联机。`,
        duration: Math.floor(Math.random() * 60) + 15, gameCoins: Math.floor(Math.random() * 50) + 10,
        score: Math.round((Math.random() * 3 + 7) * 10) / 10,
        gameType: Math.random() > 0.5 ? 'host' : 'headset',
        payMode: 'single', status: Math.random() > 0.2 ? 'online' : 'draft',
        sortOrder: Math.floor(Math.random() * 100),
        playCount: Math.floor(Math.random() * 5000),
        createdAt: '2024-03-01', updatedAt: '2024-06-01',
      })
    })

    // 设备
    for (let i = 0; i < 16; i++) {
      const store = this.stores[i % this.stores.length]
      this.devices.push({
        id: uuid(), sn: `HOST${String(i + 1).padStart(6, '0')}`,
        name: `主机-${store.name}-${i + 1}`, type: 'host',
        storeId: store.id, storeName: store.name,
        model: 'VR-Host-Pro-2024',
        status: i % 3 === 0 ? 'offline' : 'online',
        cpu: '8核', memory: '16GB', disk: '256GB',
        firmwareVersion: 'v2.3.1', lastHeartbeat: new Date().toISOString(),
        createdAt: '2024-03-01', updatedAt: '2024-06-01',
      })
      this.devices.push({
        id: uuid(), sn: `HS${String(i + 1).padStart(6, '0')}`,
        name: `头显-${store.name}-${i + 1}`, type: 'headset',
        storeId: store.id, storeName: store.name,
        model: 'VR-Headset-X1',
        status: i % 2 === 0 ? 'busy' : 'idle',
        battery: Math.floor(Math.random() * 100),
        ipd: 63, refreshRate: 90, brightness: 80,
        firmwareVersion: 'v1.5.2', lastHeartbeat: new Date().toISOString(),
        createdAt: '2024-03-01', updatedAt: '2024-06-01',
      })
    }

    // 会员
    for (let i = 0; i < 50; i++) {
      const store = this.stores[i % this.stores.length]
      this.members.push({
        id: uuid(), name: `会员${i + 1}`, phone: `1380000${String(9000 + i).slice(-4)}`,
        storeId: store.id, merchantId: store.merchantId,
        level: ['普通', '银卡', '金卡', '钻石'][Math.floor(Math.random() * 4)],
        balance: Math.floor(Math.random() * 5000) / 100,
        gameCoins: Math.floor(Math.random() * 1000),
        prepaidTimes: Math.floor(Math.random() * 20),
        totalConsumption: Math.floor(Math.random() * 100000) / 100,
        orderCount: Math.floor(Math.random() * 50),
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        lastConsumeTime: new Date().toISOString(),
        createdAt: `2024-0${Math.floor(Math.random() * 6) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        updatedAt: '2024-06-01',
      })
    }

    // 订单
    const orderTypes = Object.values(OrderType)
    for (let i = 0; i < 30; i++) {
      const store = this.stores[i % this.stores.length]
      this.orders.push({
        id: uuid(),
        orderNo: `ORD${new Date().getFullYear()}${String(i + 1).padStart(8, '0')}`,
        type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        storeId: store.id,
        memberId: this.members[Math.floor(Math.random() * this.members.length)].id,
        amount: Math.floor(Math.random() * 100000) / 100,
        payMethod: ['wechat', 'alipay', 'cash', 'member_balance'][Math.floor(Math.random() * 4)] as any,
        status: Math.random() > 0.1 ? 'paid' : 'pending',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // Banner
    this.banners.push(
      { id: uuid(), imageUrl: '/uploads/banners/banner1.jpg', linkType: 'game', linkValue: this.games[0]?.id, sortOrder: 1, status: 'active', createdAt: '2024-05-01' },
      { id: uuid(), imageUrl: '/uploads/banners/banner2.jpg', linkType: 'url', linkValue: 'https://example.com/promo', sortOrder: 2, status: 'active', createdAt: '2024-05-01' },
    )

    // 充值套餐
    this.rechargePackages.push(
      { id: uuid(), name: '新手礼包', price: 9.9, depositAmount: 10, gameCoins: 50, gameCoinValidityDays: 30, prepaidTimes: 1, timesValidityDays: 30, status: 'active', storeId: this.stores[0].id, createdAt: '2024-05-01' },
      { id: uuid(), name: '热门套餐', price: 49.9, depositAmount: 50, gameCoins: 300, gameCoinValidityDays: 90, prepaidTimes: 5, timesValidityDays: 90, status: 'active', storeId: this.stores[0].id, createdAt: '2024-05-01' },
      { id: uuid(), name: '尊享套餐', price: 199, depositAmount: 200, gameCoins: 1500, gameCoinValidityDays: 365, prepaidTimes: 20, timesValidityDays: 365, status: 'active', storeId: this.stores[0].id, createdAt: '2024-05-01' },
    )

    // 系统参数
    this.systemParams.push(
      { id: uuid(), key: 'deduct_order', value: 'balance_first', description: '储值扣费顺序: balance_first=储值优先, coins_first=游戏币优先', scope: 'shop', storeId: this.stores[0].id },
      { id: uuid(), key: 'vod_rate', value: '0.3', description: '点播费率(平台抽成比例)', scope: 'platform' },
      { id: uuid(), key: 'game_coin_name', value: '游戏豆', description: '游戏币名称', scope: 'shop', storeId: this.stores[0].id },
    )
  }

  // ===== 通用 CRUD =====
  query<T>(data: T[], filters: Partial<T> = {}): T[] {
    return data.filter(item =>
      Object.entries(filters).every(([k, v]) => v === undefined || (item as any)[k] === v)
    )
  }

  findById<T extends { id: string }>(data: T[], id: string): T | undefined {
    return data.find(item => item.id === id)
  }

  create<T extends { id: string }>(data: T[], item: T): T {
    data.push(item)
    return item
  }

  update<T extends { id: string }>(data: T[], id: string, updates: Partial<T>): T | null {
    const idx = data.findIndex(item => item.id === id)
    if (idx === -1) return null
    data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() }
    return data[idx]
  }

  delete<T extends { id: string }>(data: T[], id: string): boolean {
    const idx = data.findIndex(item => item.id === id)
    if (idx === -1) return false
    data.splice(idx, 1)
    return true
  }
}

export const store = new DataStore()
