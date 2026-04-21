import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 使用静态导入避免 Vite 解析 .vue 动态导入的 bug
import PlatformLayout from '../layouts/PlatformLayout.vue'
import ShopLayout from '../layouts/ShopLayout.vue'
import Dashboard from '../views/platform/Dashboard.vue'
import Reports from '../views/platform/Reports.vue'
import StoreList from '../views/platform/StoreList.vue'
import ContentManage from '../views/platform/ContentManage.vue'
import Users from '../views/platform/Users.vue'
import Coupons from '../views/platform/Coupons.vue'
import Activities from '../views/platform/Activities.vue'
import Finance from '../views/platform/Finance.vue'
import System from '../views/platform/System.vue'
import Workbench from '../views/shop/Workbench.vue'
import Members from '../views/shop/Members.vue'
import Devices from '../views/shop/Devices.vue'
import ReportsShop from '../views/shop/Reports.vue'
import Products from '../views/shop/Products.vue'
import ProductDetail from '../views/shop/ProductDetail.vue'
import Marketing from '../views/shop/Marketing.vue'
import Settings from '../views/shop/Settings.vue'
import Recharge from '../views/shop/Recharge.vue'
import Packages from '../views/shop/Packages.vue'
import ShopCoupons from '../views/shop/ShopCoupons.vue'
import Promotions from '../views/shop/Promotions.vue'
import Gifts from '../views/shop/Gifts.vue'
import Sms from '../views/shop/Sms.vue'
import GuideMembers from '../views/shop/GuideMembers.vue'
import Guides from '../views/shop/Guides.vue'
import MemberLevels from '../views/shop/MemberLevels.vue'
import MemberRanking from '../views/shop/MemberRanking.vue'
import MemberBalance from '../views/shop/MemberBalance.vue'
import DailySales from '../views/shop/DailySales.vue'
import HistoricalRevenue from '../views/shop/HistoricalRevenue.vue'
import ChannelRevenue from '../views/shop/ChannelRevenue.vue'
import ProductSales from '../views/shop/ProductSales.vue'
import AccountStats from '../views/shop/AccountStats.vue'
import Shifts from '../views/shop/Shifts.vue'
import StaffOrders from '../views/shop/StaffOrders.vue'
import OnDemandData from '../views/shop/OnDemandData.vue'
import OrderSearch from '../views/shop/OrderSearch.vue'
import FilmRevenue from '../views/shop/FilmRevenue.vue'
import ShopStoreList from '../views/shop/ShopStoreList.vue'
import OnDemandSettings from '../views/shop/OnDemandSettings.vue'
import FilmGenres from '../views/shop/FilmGenres.vue'
import PointsSettings from '../views/shop/PointsSettings.vue'
import CashierSettings from '../views/shop/CashierSettings.vue'
import ShopUsers from '../views/shop/Users.vue'

const routes: RouteRecordRaw[] = [
  // ===== 总运营后台（平台超管） =====
  {
    path: '/platform',
    name: 'Platform',
    component: PlatformLayout,
    redirect: '/platform/dashboard',
    children: [
      // 数据中心
      { path: 'dashboard', name: 'PlatformDashboard', component: Dashboard, meta: { title: '大屏看板' } },
      { path: 'reports', name: 'PlatformReports', component: Reports, meta: { title: '数据报表' } },
      // 门店管理
      { path: 'stores', name: 'PlatformStores', component: StoreList, meta: { title: '门店列表' } },
      { path: 'stores/audit', name: 'PlatformStoresAudit', component: StoreList, meta: { title: '门店审核' } },
      { path: 'agents', name: 'PlatformAgents', component: StoreList, meta: { title: '代理商' } },
      // 内容中心
      { path: 'games', name: 'PlatformGames', component: ContentManage, meta: { title: '游戏库' } },
      { path: 'content', name: 'PlatformContent', component: ContentManage, meta: { title: '内容分发' } },
      { path: 'content/review', name: 'PlatformContentReview', component: ContentManage, meta: { title: '审核管理' } },
      // 用户体系
      { path: 'users', name: 'PlatformUsers', component: Users, meta: { title: '平台账号' } },
      { path: 'users/roles', name: 'PlatformUsersRoles', component: Users, meta: { title: '角色权限' } },
      // 营销工具
      { path: 'coupons', name: 'PlatformCoupons', component: Coupons, meta: { title: '优惠券' } },
      { path: 'activities', name: 'PlatformActivities', component: Activities, meta: { title: '活动配置' } },
      // 平台财务
      { path: 'finance', name: 'PlatformFinance', component: Finance, meta: { title: '财务总览' } },
      { path: 'finance/settlement', name: 'PlatformFinanceSettlement', component: Finance, meta: { title: '结算管理' } },
      { path: 'finance/reconciliation', name: 'PlatformFinanceReconciliation', component: Finance, meta: { title: '对账中心' } },
      // 系统运维
      { path: 'system', name: 'PlatformSystem', component: System, meta: { title: '版本发布' } },
      { path: 'system/alerts', name: 'PlatformSystemAlerts', component: System, meta: { title: '告警中心' } },
      { path: 'system/logs', name: 'PlatformSystemLogs', component: System, meta: { title: '操作日志' } },
      // 运维支持
      { path: 'support/tickets', name: 'PlatformSupportTickets', component: System, meta: { title: '工单系统' } },
      { path: 'support/help', name: 'PlatformSupportHelp', component: System, meta: { title: '帮助中心' } },
    ]
  },

  // ===== 店铺运营后台（门店店长） =====
  {
    path: '/shop',
    name: 'Shop',
    component: ShopLayout,
    redirect: '/shop/workbench',
    children: [
      // 首页
      { path: 'workbench', name: 'ShopWorkbench', component: Workbench, meta: { title: '今日概况' } },
      { path: 'workbench/devices', name: 'ShopWorkbenchDevices', component: Workbench, meta: { title: '设备监控' } },
      { path: 'workbench/revenue', name: 'ShopWorkbenchRevenue', component: Workbench, meta: { title: '营收概览' } },
      // 商品管理
      { path: 'products', name: 'ShopProducts', component: Products, meta: { title: '商品' } },
      { path: 'products/add', name: 'ShopProductAdd', component: ProductDetail, meta: { title: '添加商品' } },
      { path: 'products/:id', name: 'ShopProductDetail', component: ProductDetail, meta: { title: '编辑商品' } },
      { path: 'products/inventory', name: 'ShopProductsInventory', component: Products, meta: { title: '库存管理' } },
      // 运营管理
      { path: 'recharge', name: 'ShopRecharge', component: Recharge, meta: { title: '充值套餐' } },
      { path: 'packages', name: 'ShopPackages', component: Packages, meta: { title: '套票' } },
      { path: 'coupons', name: 'ShopCoupons', component: ShopCoupons, meta: { title: '优惠券' } },
      { path: 'promotions', name: 'ShopPromotions', component: Promotions, meta: { title: '促销' } },
      { path: 'gifts', name: 'ShopGifts', component: Gifts, meta: { title: '活动赠送' } },
      { path: 'sms', name: 'ShopSms', component: Sms, meta: { title: '短信管理' } },
      { path: 'guide-members', name: 'ShopGuideMembers', component: GuideMembers, meta: { title: '会员管理' } },
      { path: 'guides', name: 'ShopGuides', component: Guides, meta: { title: '导购管理' } },
      // 会员管理
      { path: 'members', name: 'ShopMembers', component: Members, meta: { title: '会员列表' } },
      { path: 'member-levels', name: 'ShopMemberLevels', component: MemberLevels, meta: { title: '会员级别' } },
      { path: 'member-ranking', name: 'ShopMemberRanking', component: MemberRanking, meta: { title: '会员消费排行' } },
      { path: 'member-balance', name: 'ShopMemberBalance', component: MemberBalance, meta: { title: '会员储值变更' } },
      // 数据报表
      { path: 'daily-sales', name: 'ShopDailySales', component: DailySales, meta: { title: '门店销售日报' } },
      { path: 'historical-revenue', name: 'ShopHistoricalRevenue', component: HistoricalRevenue, meta: { title: '历史营收统计' } },
      { path: 'channel-revenue', name: 'ShopChannelRevenue', component: ChannelRevenue, meta: { title: '渠道营收统计' } },
      { path: 'product-sales', name: 'ShopProductSales', component: ProductSales, meta: { title: '售品销售报表' } },
      { path: 'account-stats', name: 'ShopAccountStats', component: AccountStats, meta: { title: '账户金额统计' } },
      { path: 'shifts', name: 'ShopShifts', component: Shifts, meta: { title: '交接班记录' } },
      { path: 'staff-orders', name: 'ShopStaffOrders', component: StaffOrders, meta: { title: '员工点播' } },
      { path: 'on-demand-data', name: 'ShopOnDemandData', component: OnDemandData, meta: { title: '点播数据' } },
      { path: 'order-search', name: 'ShopOrderSearch', component: OrderSearch, meta: { title: '订单查询' } },
      { path: 'film-revenue', name: 'ShopFilmRevenue', component: FilmRevenue, meta: { title: '影片分成明细' } },
      // 系统设置
      { path: 'store-list', name: 'ShopStoreList', component: ShopStoreList, meta: { title: '店铺列表' } },
      { path: 'on-demand-settings', name: 'ShopOnDemandSettings', component: OnDemandSettings, meta: { title: '点播设置' } },
      { path: 'devices', name: 'ShopDevices', component: Devices, meta: { title: '设备列表' } },
      { path: 'devices/control', name: 'ShopDevicesControl', component: Devices, meta: { title: '远程控制' } },
      { path: 'film-genres', name: 'ShopFilmGenres', component: FilmGenres, meta: { title: '影片题材' } },
      { path: 'cashier-settings', name: 'ShopCashierSettings', component: CashierSettings, meta: { title: '收银设置' } },
      { path: 'points-settings', name: 'ShopPointsSettings', component: PointsSettings, meta: { title: '积分设置' } },
      { path: 'users', name: 'ShopUsers', component: ShopUsers, meta: { title: '用户管理' } },
    ]
  },

  // 默认重定向到总后台
  {
    path: '/',
    redirect: '/platform/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
