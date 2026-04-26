import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 使用静态导入避免 Vite 解析 .vue 动态导入的 bug
import PlatformLayout from '../layouts/PlatformLayout.vue'
import ShopLayout from '../layouts/ShopLayout.vue'
import Dashboard from '../views/platform/Dashboard.vue'
import Reports from '../views/platform/Reports.vue'
import StoreList from '../views/platform/StoreList.vue'
import StoreAudit from '../views/platform/StoreAudit.vue'
import AgentList from '../views/platform/AgentList.vue'
import GameLibrary from '../views/platform/GameLibrary.vue'
import ContentDistribute from '../views/platform/ContentDistribute.vue'
import ContentReview from '../views/platform/ContentReview.vue'
import UserList from '../views/platform/UserList.vue'
import RolePermission from '../views/platform/RolePermission.vue'
import Coupons from '../views/platform/Coupons.vue'
import Activities from '../views/platform/Activities.vue'
import FinanceOverview from '../views/platform/FinanceOverview.vue'
import SettlementManage from '../views/platform/SettlementManage.vue'
import Reconciliation from '../views/platform/Reconciliation.vue'
import System from '../views/platform/System.vue'
import Workbench from '../views/shop/Workbench.vue'
import Members from '../views/shop/Members.vue'
import Devices from '../views/shop/Devices.vue'
import DeviceOnlineStats from '../views/shop/DeviceOnlineStats.vue'
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
import SmsCreate from '../views/shop/SmsCreate.vue'
import SmsTemplates from '../views/shop/SmsTemplates.vue'
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
import OnDemandGameRecord from '../views/shop/OnDemandGameRecord.vue'
import OnDemandFilmRecord from '../views/shop/OnDemandFilmRecord.vue'
import OnDemandDeviceSummary from '../views/shop/OnDemandDeviceSummary.vue'
import OnDemandGameSummary from '../views/shop/OnDemandGameSummary.vue'
import OrderSearch from '../views/shop/OrderSearch.vue'
import CashierOrder from '../views/shop/CashierOrder.vue'
import OnDemandOrder from '../views/shop/OnDemandOrder.vue'
import ManualDeductOrder from '../views/shop/ManualDeductOrder.vue'
import EditBalanceOrder from '../views/shop/EditBalanceOrder.vue'
import PointsExchangeOrder from '../views/shop/PointsExchangeOrder.vue'
import GiftOrder from '../views/shop/GiftOrder.vue'
import FilmRevenue from '../views/shop/FilmRevenue.vue'
import ShopStoreList from '../views/shop/ShopStoreList.vue'
import OnDemandSettings from '../views/shop/OnDemandSettings.vue'
import FilmGenres from '../views/shop/FilmGenres.vue'
import PointsSettings from '../views/shop/PointsSettings.vue'
import CashierSettings from '../views/shop/CashierSettings.vue'
import CashierTerminal from '../views/shop/CashierTerminal.vue'
import CashierReceiptSettings from '../views/shop/CashierReceiptSettings.vue'
import SystemParams from '../views/shop/SystemParams.vue'
import ShopUsers from '../views/shop/Users.vue'
import SingleConsumption from '../views/shop/SingleConsumption.vue'
import MemberDiscount from '../views/shop/MemberDiscount.vue'
import MemberEdit from '../views/shop/MemberEdit.vue'
import MemberPointsQuery from '../views/shop/MemberPointsQuery.vue'
import MemberPointsAdjustLog from '../views/shop/MemberPointsAdjustLog.vue'
import MemberPrepaidTimesQuery from '../views/shop/MemberPrepaidTimesQuery.vue'
import TimesAdjustLog from '../views/shop/TimesAdjustLog.vue'
import AccountBalance from '../views/shop/AccountBalance.vue'
import AccountRecharge from '../views/shop/AccountRecharge.vue'

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
      { path: 'stores/audit', name: 'PlatformStoresAudit', component: StoreAudit, meta: { title: '门店审核' } },
      { path: 'agents', name: 'PlatformAgents', component: AgentList, meta: { title: '代理商' } },
      // 内容中心
      { path: 'games', name: 'PlatformGames', component: GameLibrary, meta: { title: '游戏库' } },
      { path: 'content', name: 'PlatformContent', component: ContentDistribute, meta: { title: '内容分发' } },
      { path: 'content/review', name: 'PlatformContentReview', component: ContentReview, meta: { title: '审核管理' } },
      // 用户体系
      { path: 'users', name: 'PlatformUsers', component: UserList, meta: { title: '平台账号' } },
      { path: 'users/roles', name: 'PlatformUsersRoles', component: RolePermission, meta: { title: '角色权限' } },
      // 营销工具
      { path: 'coupons', name: 'PlatformCoupons', component: Coupons, meta: { title: '优惠券' } },
      { path: 'activities', name: 'PlatformActivities', component: Activities, meta: { title: '活动配置' } },
      // 平台财务
      { path: 'finance', name: 'PlatformFinance', component: FinanceOverview, meta: { title: '财务总览' } },
      { path: 'finance/settlement', name: 'PlatformFinanceSettlement', component: SettlementManage, meta: { title: '结算管理' } },
      { path: 'finance/reconciliation', name: 'PlatformFinanceReconciliation', component: Reconciliation, meta: { title: '对账中心' } },
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
      { path: 'products', name: 'ShopProducts', component: Products, meta: { title: '实物商品' } },
      { path: 'products/add', name: 'ShopProductAdd', component: ProductDetail, meta: { title: '添加商品' } },
      { path: 'products/:id', name: 'ShopProductDetail', component: ProductDetail, meta: { title: '编辑商品' } },
      { path: 'products/inventory', name: 'ShopProductsInventory', component: Products, meta: { title: '实物库存管理' } },
      // 运营管理
      { path: 'recharge', name: 'ShopRecharge', component: Recharge, meta: { title: '充值套餐' } },
      { path: 'packages', name: 'ShopPackages', component: Packages, meta: { title: '套票' } },
      { path: 'single-consumption', name: 'ShopSingleConsumption', component: SingleConsumption, meta: { title: '单次消费项目' } },
      { path: 'coupons', name: 'ShopCoupons', component: ShopCoupons, meta: { title: '优惠券' } },
      { path: 'promotions', name: 'ShopPromotions', component: Promotions, meta: { title: '促销' } },
      { path: 'gifts', name: 'ShopGifts', component: Gifts, meta: { title: '活动赠送' } },
      { path: 'sms-templates', name: 'ShopSmsTemplates', component: SmsTemplates, meta: { title: '短信模板' } },
      { path: 'sms', name: 'ShopSms', component: Sms, meta: { title: '短信服务' } },
      { path: 'sms/create', name: 'ShopSmsCreate', component: SmsCreate, meta: { title: '添加发送任务' } },
      { path: 'guide-members', name: 'ShopGuideMembers', component: GuideMembers, meta: { title: '会员管理' } },
      { path: 'guides', name: 'ShopGuides', component: Guides, meta: { title: '导购管理' } },
      // 会员管理
      { path: 'members', name: 'ShopMembers', component: Members, meta: { title: '会员列表' } },
      { path: 'member-discount', name: 'ShopMemberDiscount', component: MemberDiscount, meta: { title: '设置会员折扣' } },
      { path: 'member-edit', name: 'ShopMemberEdit', component: MemberEdit, meta: { title: '编辑会员信息' } },
      { path: 'member-levels', name: 'ShopMemberLevels', component: MemberLevels, meta: { title: '会员级别' } },
      { path: 'member-ranking', name: 'ShopMemberRanking', component: MemberRanking, meta: { title: '会员消费排行' } },
      { path: 'member-balance', name: 'ShopMemberBalance', component: MemberBalance, meta: { title: '会员储值变更' } },
      { path: 'member-points-query', name: 'ShopMemberPointsQuery', component: MemberPointsQuery, meta: { title: '会员游戏币查询' } },
      { path: 'member-points-adjust-log', name: 'ShopMemberPointsAdjustLog', component: MemberPointsAdjustLog, meta: { title: '游戏币调整有效期查询' } },
      { path: 'member-prepaid-times-query', name: 'ShopMemberPrepaidTimesQuery', component: MemberPrepaidTimesQuery, meta: { title: '会员预存次数查询' } },
      { path: 'times-adjust-log', name: 'ShopTimesAdjustLog', component: TimesAdjustLog, meta: { title: '次数调整有效期查询' } },
      // 数据报表
      { path: 'daily-sales', name: 'ShopDailySales', component: DailySales, meta: { title: '门店销售日报' } },
      { path: 'historical-revenue', name: 'ShopHistoricalRevenue', component: HistoricalRevenue, meta: { title: '历史营收统计' } },
      { path: 'channel-revenue', name: 'ShopChannelRevenue', component: ChannelRevenue, meta: { title: '渠道营收统计' } },
      { path: 'product-sales', name: 'ShopProductSales', component: ProductSales, meta: { title: '售品销售报表' } },
      { path: 'account-stats', name: 'ShopAccountStats', component: AccountStats, meta: { title: '账户金额统计' } },
      { path: 'shifts', name: 'ShopShifts', component: Shifts, meta: { title: '交接班记录' } },
      { path: 'staff-orders', name: 'ShopStaffOrders', component: StaffOrders, meta: { title: '员工点播' } },
      { path: 'on-demand-data', name: 'ShopOnDemandData', component: OnDemandData, meta: { title: '数据概览' } },
      { path: 'on-demand-game-record', name: 'ShopOnDemandGameRecord', component: OnDemandGameRecord, meta: { title: '点播游戏记录' } },
      { path: 'on-demand-film-record', name: 'ShopOnDemandFilmRecord', component: OnDemandFilmRecord, meta: { title: '点播影片记录' } },
      { path: 'on-demand-device-summary', name: 'ShopOnDemandDeviceSummary', component: OnDemandDeviceSummary, meta: { title: '点播设备汇总' } },
      { path: 'on-demand-game-summary', name: 'ShopOnDemandGameSummary', component: OnDemandGameSummary, meta: { title: '点播游戏汇总' } },
      { path: 'order-search', name: 'ShopOrderSearch', component: OrderSearch, meta: { title: '订单查询' } },
      { path: 'cashier-order', name: 'ShopCashierOrder', component: CashierOrder, meta: { title: '收银订单' } },
      { path: 'ondemand-order', name: 'ShopOnDemandOrder', component: OnDemandOrder, meta: { title: '点播系统订单' } },
      { path: 'manual-deduct-order', name: 'ShopManualDeductOrder', component: ManualDeductOrder, meta: { title: '手动扣费订单' } },
      { path: 'edit-balance-order', name: 'ShopEditBalanceOrder', component: EditBalanceOrder, meta: { title: '修改储值订单' } },
      { path: 'points-exchange-order', name: 'ShopPointsExchangeOrder', component: PointsExchangeOrder, meta: { title: '游戏币兑换订单' } },
      { path: 'gift-order', name: 'ShopGiftOrder', component: GiftOrder, meta: { title: '活动赠送订单' } },
      { path: 'film-revenue', name: 'ShopFilmRevenue', component: FilmRevenue, meta: { title: '影片分成明细' } },
      // 系统设置
      { path: 'store-list', name: 'ShopStoreList', component: ShopStoreList, meta: { title: '店铺列表' } },
      { path: 'on-demand-settings', name: 'ShopOnDemandSettings', component: OnDemandSettings, meta: { title: '点播设置' } },
      { path: 'devices', name: 'ShopDevices', component: Devices, meta: { title: '设备列表' } },
      { path: 'devices/control', name: 'ShopDevicesControl', component: Devices, meta: { title: '远程控制' } },
      { path: 'devices/online-stats', name: 'ShopDeviceOnlineStats', component: DeviceOnlineStats, meta: { title: '设备在线统计' } },
      { path: 'film-genres', name: 'ShopFilmGenres', component: FilmGenres, meta: { title: '影片题材' } },
      { path: 'cashier-terminal', name: 'ShopCashierTerminal', component: CashierTerminal, meta: { title: '收银终端' } },
      { path: 'cashier-settings', name: 'ShopCashierSettings', component: CashierSettings, meta: { title: '支付设置' } },
      { path: 'cashier-receipt', name: 'ShopCashierReceipt', component: CashierReceiptSettings, meta: { title: '小票设置' } },
      { path: 'points-settings', name: 'ShopPointsSettings', component: PointsSettings, meta: { title: '游戏币设置' } },
      { path: 'system-params', name: 'ShopSystemParams', component: SystemParams, meta: { title: '系统参数' } },
      { path: 'users', name: 'ShopUsers', component: ShopUsers, meta: { title: '用户列表' } },
      { path: 'roles', name: 'ShopRoles', component: () => import('../views/shop/Roles.vue'), meta: { title: '角色列表' } },
      // 账户
      { path: 'account/balance', name: 'ShopAccountBalance', component: AccountBalance, meta: { title: '账户余额' } },
      { path: 'account/recharge', name: 'ShopAccountRecharge', component: AccountRecharge, meta: { title: '充值' } },
    ]
  },

  // 默认重定向到总后台
  {
    path: '/',
    redirect: '/platform/dashboard'
  },
  // 404 兜底
  {
    path: '/:pathMatch(.*)*',
    redirect: '/platform/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
