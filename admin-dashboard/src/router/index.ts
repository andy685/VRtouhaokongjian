import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 使用静态导入避免 Vite 解析 .vue 动态导入的 bug
import PlatformLayout from '../layouts/PlatformLayout.vue'
import ShopLayout from '../layouts/ShopLayout.vue'
import AgentLayout from '../layouts/AgentLayout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/platform/Dashboard.vue'
import Reports from '../views/platform/Reports.vue'
import StoreList from '../views/platform/StoreList.vue'
import MerchantList from '../views/platform/MerchantList.vue'
import AgentList from '../views/platform/AgentList.vue'
import GameLibrary from '../views/platform/GameLibrary.vue'
import GameDetail from '../views/platform/GameDetail.vue'
import ContentDistribute from '../views/platform/ContentDistribute.vue'
import BannerManage from '../views/platform/BannerManage.vue'
import UserList from '../views/platform/UserList.vue'
import RolePermission from '../views/platform/RolePermission.vue'
import FinanceOverview from '../views/platform/FinanceOverview.vue'
import GameBeanSales from '../views/platform/GameBeanSales.vue'
import GameBeanSalesDetail from '../views/platform/GameBeanSalesDetail.vue'
import ContentConsumption from '../views/platform/ContentConsumption.vue'
import DeviceOverview from '../views/platform/DeviceOverview.vue'
import DeviceConfig from '../views/platform/DeviceConfig.vue'
import MemberCenter from '../views/platform/MemberCenter.vue'
import MemberList from '../views/platform/MemberList.vue'
import MemberGrowth from '../views/platform/MemberGrowth.vue'
import MemberConsumptionRanking from '../views/platform/MemberConsumptionRanking.vue'
import MemberDepositLog from '../views/platform/MemberDepositLog.vue'
import MemberCoinsQuery from '../views/platform/MemberCoinsQuery.vue'
import MemberCoinAdjustLog from '../views/platform/MemberCoinAdjustLog.vue'
import MemberPrepaidTimesQuery from '../views/platform/MemberPrepaidTimesQuery.vue'
import MemberTimesAdjustLog from '../views/platform/MemberTimesAdjustLog.vue'
import OrderFlow from '../views/platform/OrderFlow.vue'
import SettlementManage from '../views/platform/SettlementManage.vue'
import SettlementConfig from '../views/platform/SettlementConfig.vue'
import AgentSettlementConfig from '../views/platform/AgentSettlementConfig.vue'
import Reconciliation from '../views/platform/Reconciliation.vue'
import TierStrategyConfig from '../views/platform/TierStrategyConfig.vue'
import PayoutManager from '../views/platform/PayoutManager.vue'
import System from '../views/platform/System.vue'
import AgentDashboard from '../views/agent/Dashboard.vue'
import AgentMerchants from '../views/agent/Merchants.vue'
import AgentStores from '../views/agent/Stores.vue'
import AgentDeviceStats from '../views/agent/DeviceStats.vue'
import AgentMessage from '../views/agent/Message.vue'
import AgentRevenueReport from '../views/agent/RevenueReport.vue'
import AgentMembersReport from '../views/agent/MembersReport.vue'
import AgentProfile from '../views/agent/AgentProfile.vue'
import AgentSecurity from '../views/agent/AgentSecurity.vue'
import AgentCommission from '../views/agent/Commission.vue'
import AgentSettlement from '../views/agent/Settlement.vue'
import AgentBankAccount from '../views/agent/BankAccount.vue'
import Workbench from '../views/shop/Workbench.vue'
import Members from '../views/shop/Members.vue'
import Devices from '../views/shop/Devices.vue'
import DeviceBind from '../views/shop/DeviceBind.vue'
import DeviceOnlineStats from '../views/shop/DeviceOnlineStats.vue'
import ReportsShop from '../views/shop/Reports.vue'
import Products from '../views/shop/Products.vue'
import ProductDetail from '../views/shop/ProductDetail.vue'
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
import MemberPrepaidTimesQueryShop from '../views/shop/MemberPrepaidTimesQuery.vue'
import TimesAdjustLog from '../views/shop/TimesAdjustLog.vue'
import AccountBalance from '../views/shop/AccountBalance.vue'
import AccountRecharge from '../views/shop/AccountRecharge.vue'
import GameBeanRecharge from '../views/shop/GameBeanRecharge.vue'
import AccountBills from '../views/shop/AccountBills.vue'
import OperatingBills from '../views/shop/OperatingBills.vue'
import ShopSettlement from '../views/shop/Settlement.vue'
import ShopReconciliation from '../views/shop/Reconciliation.vue'
import HelpCenterDocs from '../views/platform/HelpCenterDocs.vue'
import HelpCenterFaq from '../views/platform/HelpCenterFaq.vue'
import NoticeAnnouncement from '../views/platform/NoticeAnnouncement.vue'
import NoticePush from '../views/platform/NoticePush.vue'
import SystemNoticeInbox from '../views/platform/SystemNoticeInbox.vue'
import PlatformProfile from '../views/platform/account/Profile.vue'
import PlatformSecurity from '../views/platform/account/Security.vue'
import ShopInfo from '../views/shop/account/ShopInfo.vue'
import Profile from '../views/shop/account/Profile.vue'
import Security from '../views/shop/account/Security.vue'
import Message from '../views/shop/account/Message.vue'
import ShopFeedback from '../views/shop/Feedback.vue'
import ShopIcCard from '../views/shop/IcCard.vue'
import PlatformFeedbackSummary from '../views/platform/FeedbackSummary.vue'
import GameThemes from '../views/platform/GameThemes.vue'

const routes: RouteRecordRaw[] = [
  // ===== 登录页面 =====
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
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
      // 店铺管理
      { path: 'stores', name: 'PlatformStores', component: StoreList, meta: { title: '店铺列表' } },
      { path: 'merchants', name: 'PlatformMerchants', component: MerchantList, meta: { title: '商家管理' } },
      { path: 'agents', name: 'PlatformAgents', component: AgentList, meta: { title: '代理商' } },
      // 内容中心（注意：静态路由必须在动态路由之前）
      { path: 'games', name: 'PlatformGames', component: GameLibrary, meta: { title: '游戏库' } },
      { path: 'games/add', name: 'PlatformGameAdd', component: GameDetail, meta: { title: '新增游戏' } },
      { path: 'games/:id', name: 'PlatformGameDetail', component: GameDetail, meta: { title: '游戏详情' } },
      { path: 'content', name: 'PlatformContent', component: ContentDistribute, meta: { title: '内容分发' } },
      { path: 'banners', name: 'PlatformBanners', component: BannerManage, meta: { title: 'Banner 管理' } },
      { path: 'game-categories', name: 'PlatformGameCategories', component: GameThemes, meta: { title: '游戏题材' } },
      // 平台账号
      { path: 'users', name: 'PlatformUsers', component: UserList, meta: { title: '账号管理' } },
      { path: 'users/roles', name: 'PlatformUsersRoles', component: RolePermission, meta: { title: '角色权限' } },
      // 游戏豆销售
      { path: 'gamebean-sales', name: 'PlatformGameBeanSales', component: GameBeanSales, meta: { title: '销售总览' } },
      { path: 'gamebean-sales/detail', name: 'PlatformGameBeanSalesDetail', component: GameBeanSalesDetail, meta: { title: '销售明细' } },
      // 会员中心
      { path: 'members', name: 'PlatformMembers', component: MemberCenter, meta: { title: '会员数据' } },
      { path: 'members/list', name: 'PlatformMembersList', component: MemberList, meta: { title: '会员列表' } },
      { path: 'members/growth', name: 'PlatformMembersGrowth', component: MemberGrowth, meta: { title: '会员增长' } },
      { path: 'members/ranking', name: 'PlatformMemberRanking', component: MemberConsumptionRanking, meta: { title: '会员消费排行' } },
      { path: 'members/deposit-log', name: 'PlatformMemberDepositLog', component: MemberDepositLog, meta: { title: '会员储值变更' } },
      { path: 'members/coins-query', name: 'PlatformMemberCoinsQuery', component: MemberCoinsQuery, meta: { title: '会员游戏币查询' } },
      { path: 'members/coin-adjust-log', name: 'PlatformMemberCoinAdjustLog', component: MemberCoinAdjustLog, meta: { title: '游戏币调整有效期查询' } },
      { path: 'members/prepaid-times-query', name: 'PlatformMemberPrepaidTimesQuery', component: MemberPrepaidTimesQuery, meta: { title: '会员预存次数查询' } },
      { path: 'members/times-adjust-log', name: 'PlatformMemberTimesAdjustLog', component: MemberTimesAdjustLog, meta: { title: '次数调整有效查询' } },
      // 订单流水（重定向到第一个子菜单）
      { path: 'order-flow', redirect: '/platform/order-flow/cashier' },
      { path: 'order-flow/cashier', name: 'PlatformOrderFlowCashier', component: OrderFlow, meta: { title: '收银订单' } },
      { path: 'order-flow/vod', name: 'PlatformOrderFlowVod', component: OrderFlow, meta: { title: '点播系统订单' } },
      { path: 'order-flow/manual', name: 'PlatformOrderFlowManual', component: OrderFlow, meta: { title: '手动扣费订单' } },
      { path: 'order-flow/balance', name: 'PlatformOrderFlowBalance', component: OrderFlow, meta: { title: '修改储值订单' } },
      { path: 'order-flow/gamebean', name: 'PlatformOrderFlowGamebean', component: OrderFlow, meta: { title: '游戏币兑换订单' } },
      { path: 'order-flow/promo', name: 'PlatformOrderFlowPromo', component: OrderFlow, meta: { title: '活动赠送订单' } },
      // 数据中心扩展
      { path: 'content-consumption', name: 'PlatformContentConsumption', component: ContentConsumption, meta: { title: '内容消费大盘' } },
      { path: 'device-overview', name: 'PlatformDeviceOverview', component: DeviceOverview, meta: { title: '设备运行总览' } },
      { path: 'device-config', name: 'PlatformDeviceConfig', component: DeviceConfig, meta: { title: '设备配置管理' } },
      // 平台财务
      { path: 'finance', name: 'PlatformFinance', component: FinanceOverview, meta: { title: '营收总览' } },
      // 商家分账（自动分账+异常处置模式）
      { path: 'finance/settlement', name: 'PlatformFinanceSettlement', component: SettlementManage, meta: { title: '商家分账管理' } },
      { path: 'finance/settlement-config', name: 'PlatformSettlementConfig', component: SettlementConfig, meta: { title: '结算配置' } },
      { path: 'finance/reconciliation', name: 'PlatformFinanceReconciliation', component: Reconciliation, meta: { title: '对账中心' } },
      // 代理商分账（自动分账+异常处置模式）
      { path: 'finance/payouts', name: 'PlatformPayoutManager', component: PayoutManager, meta: { title: '代理商分账管理' } },
      { path: 'finance/agent-settlement-config', name: 'PlatformAgentSettlementConfig', component: AgentSettlementConfig, meta: { title: '代理商结算配置' } },
      { path: 'finance/tier-config', name: 'PlatformTierConfig', component: TierStrategyConfig, meta: { title: '阶梯策略配置' } },
      // 系统运维
      { path: 'system', name: 'PlatformSystem', component: System, meta: { title: '版本发布' } },
      { path: 'system/alerts', name: 'PlatformSystemAlerts', component: System, meta: { title: '告警中心' } },
      { path: 'system/logs', name: 'PlatformSystemLogs', component: System, meta: { title: '操作日志' } },
      // 运维支持
      { path: 'support/tickets', name: 'PlatformSupportTickets', component: System, meta: { title: '工单系统' } },
      { path: 'support/help', name: 'PlatformSupportHelp', component: System, meta: { title: '帮助中心' } },
      // 帮助中心系统
      { path: 'help-center/docs', name: 'HelpCenterDocs', component: HelpCenterDocs, meta: { title: '帮助文档' } },
      { path: 'help-center/faq', name: 'HelpCenterFaq', component: HelpCenterFaq, meta: { title: 'FAQ' } },
      // 平台通知系统
      { path: 'notice/announcement', name: 'NoticeAnnouncement', component: NoticeAnnouncement, meta: { title: '公告管理' } },
      { path: 'notice/push', name: 'NoticePush', component: NoticePush, meta: { title: '消息推送' } },
      { path: 'notice/inbox', name: 'SystemNoticeInbox', component: SystemNoticeInbox, meta: { title: '系统通知' } },
      // 全平台反馈
      { path: 'feedback-summary', name: 'PlatformFeedbackSummary', component: PlatformFeedbackSummary, meta: { title: '反馈汇总' } },
      // 平台账号个人中心
      { path: 'account/profile', name: 'PlatformAccountProfile', component: PlatformProfile, meta: { title: '个人信息', breadcrumb: [{ label: '个人信息' }] } },
      { path: 'account/security', name: 'PlatformAccountSecurity', component: PlatformSecurity, meta: { title: '安全设置', breadcrumb: [{ label: '安全设置' }] } },
    ]
  },

  // ===== 商家后台（商家） =====
  {
    path: '/shop',
    name: 'Shop',
    component: ShopLayout,
    redirect: '/shop/workbench',
    children: [
      // 首页
      { path: 'workbench', name: 'ShopWorkbench', component: Workbench, meta: { title: '今日概况', breadcrumb: [{ label: '首页', path: '/shop/workbench' }] } },
      { path: 'workbench/devices', name: 'ShopWorkbenchDevices', component: Workbench, meta: { title: '设备监控', breadcrumb: [{ label: '首页', path: '/shop/workbench' }, { label: '设备监控' }] } },
      { path: 'workbench/revenue', name: 'ShopWorkbenchRevenue', component: Workbench, meta: { title: '营收概览', breadcrumb: [{ label: '首页', path: '/shop/workbench' }, { label: '营收概览' }] } },
      // 商品管理
      { path: 'products', name: 'ShopProducts', component: Products, meta: { title: '实物商品', breadcrumb: [{ label: '商品管理' }, { label: '实物商品' }] } },
      { path: 'products/add', name: 'ShopProductAdd', component: ProductDetail, meta: { title: '添加商品', breadcrumb: [{ label: '商品管理' }, { label: '实物商品', path: '/shop/products' }, { label: '添加商品' }] } },
      { path: 'products/:id', name: 'ShopProductDetail', component: ProductDetail, meta: { title: '编辑商品', breadcrumb: [{ label: '商品管理' }, { label: '实物商品', path: '/shop/products' }, { label: '编辑商品' }] } },
      { path: 'products/inventory', name: 'ShopProductsInventory', component: Products, meta: { title: '实物库存管理', breadcrumb: [{ label: '商品管理' }, { label: '实物库存管理' }] } },
      { path: 'single-consumption', name: 'ShopSingleConsumption', component: SingleConsumption, meta: { title: '单次消费项目', breadcrumb: [{ label: '商品管理' }, { label: '单次消费项目' }] } },
      // 运营管理
      { path: 'recharge', name: 'ShopRecharge', component: Recharge, meta: { title: '充值套餐', breadcrumb: [{ label: '运营管理' }, { label: '充值套餐' }] } },
      { path: 'packages', name: 'ShopPackages', component: Packages, meta: { title: '套票', breadcrumb: [{ label: '运营管理' }, { label: '套票' }] } },
      { path: 'coupons', name: 'ShopCoupons', component: ShopCoupons, meta: { title: '优惠券', breadcrumb: [{ label: '运营管理' }, { label: '优惠券' }] } },
      { path: 'promotions', name: 'ShopPromotions', component: Promotions, meta: { title: '促销', breadcrumb: [{ label: '运营管理' }, { label: '促销' }] } },
      { path: 'gifts', name: 'ShopGifts', component: Gifts, meta: { title: '活动赠送', breadcrumb: [{ label: '运营管理' }, { label: '活动赠送' }] } },
      { path: 'sms-templates', name: 'ShopSmsTemplates', component: SmsTemplates, meta: { title: '短信模板', breadcrumb: [{ label: '运营管理' }, { label: '短信管理' }, { label: '短信模板' }] } },
      { path: 'sms', name: 'ShopSms', component: Sms, meta: { title: '短信服务', breadcrumb: [{ label: '运营管理' }, { label: '短信管理' }, { label: '短信服务' }] } },
      { path: 'sms/create', name: 'ShopSmsCreate', component: SmsCreate, meta: { title: '添加发送任务', breadcrumb: [{ label: '运营管理' }, { label: '短信管理' }, { label: '短信服务', path: '/shop/sms' }, { label: '添加发送任务' }] } },
      { path: 'guide-members', name: 'ShopGuideMembers', component: GuideMembers, meta: { title: '会员管理', breadcrumb: [{ label: '运营管理' }, { label: '会员管理' }] } },
      { path: 'guides', name: 'ShopGuides', component: Guides, meta: { title: '导购管理', breadcrumb: [{ label: '运营管理' }, { label: '导购管理' }] } },
      // 反馈管理
      { path: 'feedback', name: 'ShopFeedback', component: ShopFeedback, meta: { title: '反馈管理', breadcrumb: [{ label: '运营管理' }, { label: '反馈管理' }] } },
      // 会员管理
      { path: 'members', name: 'ShopMembers', component: Members, meta: { title: '会员列表', breadcrumb: [{ label: '会员管理' }, { label: '会员列表' }] } },
      { path: 'member-discount', name: 'ShopMemberDiscount', component: MemberDiscount, meta: { title: '设置会员折扣', breadcrumb: [{ label: '会员管理' }, { label: '会员列表', path: '/shop/members' }, { label: '设置会员折扣' }] } },
      { path: 'member-edit', name: 'ShopMemberEdit', component: MemberEdit, meta: { title: '编辑会员信息', breadcrumb: [{ label: '会员管理' }, { label: '会员列表', path: '/shop/members' }, { label: '编辑会员信息' }] } },
      { path: 'member-levels', name: 'ShopMemberLevels', component: MemberLevels, meta: { title: '会员级别', breadcrumb: [{ label: '会员管理' }, { label: '会员级别' }] } },
      { path: 'member-ranking', name: 'ShopMemberRanking', component: MemberRanking, meta: { title: '会员消费排行', breadcrumb: [{ label: '会员管理' }, { label: '会员消费排行' }] } },
      { path: 'member-balance', name: 'ShopMemberBalance', component: MemberBalance, meta: { title: '会员储值变更', breadcrumb: [{ label: '会员管理' }, { label: '会员储值变更' }] } },
      { path: 'member-points-query', name: 'ShopMemberPointsQuery', component: MemberPointsQuery, meta: { title: '会员游戏币查询', breadcrumb: [{ label: '会员管理' }, { label: '会员游戏币查询' }] } },
      { path: 'member-points-adjust-log', name: 'ShopMemberPointsAdjustLog', component: MemberPointsAdjustLog, meta: { title: '游戏币调整有效期查询', breadcrumb: [{ label: '会员管理' }, { label: '游戏币调整有效期查询' }] } },
      { path: 'member-prepaid-times-query', name: 'ShopMemberPrepaidTimesQuery', component: MemberPrepaidTimesQueryShop, meta: { title: '会员预存次数查询', breadcrumb: [{ label: '会员管理' }, { label: '会员预存次数查询' }] } },
      { path: 'times-adjust-log', name: 'ShopTimesAdjustLog', component: TimesAdjustLog, meta: { title: '次数调整有效期查询', breadcrumb: [{ label: '会员管理' }, { label: '次数调整有效期查询' }] } },
      // 数据报表
      { path: 'daily-sales', name: 'ShopDailySales', component: DailySales, meta: { title: '店铺销售日报', breadcrumb: [{ label: '数据报表' }, { label: '店铺销售日报' }] } },
      { path: 'historical-revenue', name: 'ShopHistoricalRevenue', component: HistoricalRevenue, meta: { title: '历史营收统计', breadcrumb: [{ label: '数据报表' }, { label: '历史营收统计' }] } },
      { path: 'channel-revenue', name: 'ShopChannelRevenue', component: ChannelRevenue, meta: { title: '渠道营收统计', breadcrumb: [{ label: '数据报表' }, { label: '渠道营收统计' }] } },
      { path: 'product-sales', name: 'ShopProductSales', component: ProductSales, meta: { title: '售品销售报表', breadcrumb: [{ label: '数据报表' }, { label: '售品销售报表' }] } },
      { path: 'account-stats', name: 'ShopAccountStats', component: AccountStats, meta: { title: '账户金额统计', breadcrumb: [{ label: '数据报表' }, { label: '账户金额统计' }] } },
      { path: 'shifts', name: 'ShopShifts', component: Shifts, meta: { title: '交接班记录', breadcrumb: [{ label: '数据报表' }, { label: '交接班记录' }] } },
      { path: 'staff-orders', name: 'ShopStaffOrders', component: StaffOrders, meta: { title: '员工点播', breadcrumb: [{ label: '数据报表' }, { label: '员工点播' }] } },
      { path: 'on-demand-data', name: 'ShopOnDemandData', component: OnDemandData, meta: { title: '数据概览', breadcrumb: [{ label: '数据报表' }, { label: '点播数据' }, { label: '数据概览' }] } },
      { path: 'on-demand-game-record', name: 'ShopOnDemandGameRecord', component: OnDemandGameRecord, meta: { title: '点播游戏记录', breadcrumb: [{ label: '数据报表' }, { label: '点播数据' }, { label: '点播游戏记录' }] } },
      { path: 'on-demand-film-record', name: 'ShopOnDemandFilmRecord', component: OnDemandFilmRecord, meta: { title: '点播影片记录', breadcrumb: [{ label: '数据报表' }, { label: '点播数据' }, { label: '点播影片记录' }] } },
      { path: 'on-demand-device-summary', name: 'ShopOnDemandDeviceSummary', component: OnDemandDeviceSummary, meta: { title: '点播设备汇总', breadcrumb: [{ label: '数据报表' }, { label: '点播数据' }, { label: '点播设备汇总' }] } },
      { path: 'on-demand-game-summary', name: 'ShopOnDemandGameSummary', component: OnDemandGameSummary, meta: { title: '点播游戏汇总', breadcrumb: [{ label: '数据报表' }, { label: '点播数据' }, { label: '点播游戏汇总' }] } },
      { path: 'order-search', name: 'ShopOrderSearch', component: OrderSearch, meta: { title: '订单查询', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }] } },
      { path: 'cashier-order', name: 'ShopCashierOrder', component: CashierOrder, meta: { title: '收银订单', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }, { label: '收银订单' }] } },
      { path: 'ondemand-order', name: 'ShopOnDemandOrder', component: OnDemandOrder, meta: { title: '点播系统订单', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }, { label: '点播系统订单' }] } },
      { path: 'manual-deduct-order', name: 'ShopManualDeductOrder', component: ManualDeductOrder, meta: { title: '手动扣费订单', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }, { label: '手动扣费订单' }] } },
      { path: 'edit-balance-order', name: 'ShopEditBalanceOrder', component: EditBalanceOrder, meta: { title: '修改储值订单', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }, { label: '修改储值订单' }] } },
      { path: 'points-exchange-order', name: 'ShopPointsExchangeOrder', component: PointsExchangeOrder, meta: { title: '游戏币兑换订单', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }, { label: '游戏币兑换订单' }] } },
      { path: 'gift-order', name: 'ShopGiftOrder', component: GiftOrder, meta: { title: '活动赠送订单', breadcrumb: [{ label: '数据报表' }, { label: '订单查询' }, { label: '活动赠送订单' }] } },
      { path: 'film-revenue', name: 'ShopFilmRevenue', component: FilmRevenue, meta: { title: '游戏分成明细', breadcrumb: [{ label: '数据报表' }, { label: '游戏分成明细' }] } },
      { path: 'settlement', name: 'ShopSettlement', component: ShopSettlement, meta: { title: '结算记录', breadcrumb: [{ label: '数据报表' }, { label: '结算记录' }] } },
      { path: 'reconciliation', name: 'ShopReconciliation', component: ShopReconciliation, meta: { title: '对账中心', breadcrumb: [{ label: '数据报表' }, { label: '对账中心' }] } },
      // 系统设置
      { path: 'store-list', name: 'ShopStoreList', component: ShopStoreList, meta: { title: '店铺列表', breadcrumb: [{ label: '系统设置' }, { label: '店铺列表' }] } },
      { path: 'on-demand-settings', name: 'ShopOnDemandSettings', component: OnDemandSettings, meta: { title: '点播设置', breadcrumb: [{ label: '系统设置' }, { label: '点播设置' }] } },
      { path: 'devices', name: 'ShopDevices', component: Devices, meta: { title: '设备列表', breadcrumb: [{ label: '系统设置' }, { label: '设备列表' }] } },
      { path: 'devices/control', name: 'ShopDevicesControl', component: Devices, meta: { title: '远程控制', breadcrumb: [{ label: '系统设置' }, { label: '设备列表', path: '/shop/devices' }, { label: '远程控制' }] } },
      { path: 'devices/bind', name: 'ShopDeviceBind', component: DeviceBind, meta: { title: '设备绑定管理', breadcrumb: [{ label: '系统设置' }, { label: '设备管理' }, { label: '设备绑定管理' }] } },
      { path: 'devices/online-stats', name: 'ShopDeviceOnlineStats', component: DeviceOnlineStats, meta: { title: '设备在线统计', breadcrumb: [{ label: '系统设置' }, { label: '设备管理' }, { label: '设备在线统计' }] } },
      // 游戏题材已迁移至总运营后台 -> /platform/game-categories
      { path: 'cashier-terminal', name: 'ShopCashierTerminal', component: CashierTerminal, meta: { title: '收银终端', breadcrumb: [{ label: '系统设置' }, { label: '收银设置' }, { label: '收银终端' }] } },
      { path: 'cashier-settings', name: 'ShopCashierSettings', component: CashierSettings, meta: { title: '支付设置', breadcrumb: [{ label: '系统设置' }, { label: '收银设置' }, { label: '支付设置' }] } },
      { path: 'cashier-receipt', name: 'ShopCashierReceipt', component: CashierReceiptSettings, meta: { title: '小票设置', breadcrumb: [{ label: '系统设置' }, { label: '收银设置' }, { label: '小票设置' }] } },
      { path: 'ic-card', name: 'ShopIcCard', component: ShopIcCard, meta: { title: 'IC卡管理', breadcrumb: [{ label: '系统设置' }, { label: '收银设置' }, { label: 'IC卡管理' }] } },
      { path: 'points-settings', name: 'ShopPointsSettings', component: PointsSettings, meta: { title: '游戏币设置', breadcrumb: [{ label: '系统设置' }, { label: '游戏币设置' }] } },
      { path: 'system-params', name: 'ShopSystemParams', component: SystemParams, meta: { title: '系统参数', breadcrumb: [{ label: '系统设置' }, { label: '系统参数' }] } },
      { path: 'users', name: 'ShopUsers', component: ShopUsers, meta: { title: '用户列表', breadcrumb: [{ label: '系统设置' }, { label: '用户管理' }, { label: '用户列表' }] } },
      { path: 'roles', name: 'ShopRoles', component: () => import('../views/shop/Roles.vue'), meta: { title: '角色列表', breadcrumb: [{ label: '系统设置' }, { label: '用户管理' }, { label: '角色列表' }] } },
      // 账户
      { path: 'account/bills', name: 'ShopAccountBills', component: AccountBills, meta: { title: '账户账单', breadcrumb: [{ label: '账户', path: '/shop/account/balance' }, { label: '账户账单' }] } },
      { path: 'account/operating-bills', name: 'ShopOperatingBills', component: OperatingBills, meta: { title: '运营账户账单', breadcrumb: [{ label: '账户', path: '/shop/account/balance' }, { label: '运营账户账单' }] } },
      { path: 'account/balance', name: 'ShopAccountBalance', component: AccountBalance, meta: { title: '账户', breadcrumb: [{ label: '账户' }] } },
      { path: 'account/recharge', name: 'ShopAccountRecharge', component: AccountRecharge, meta: { title: '运营账户充值', breadcrumb: [{ label: '账户', path: '/shop/account/balance' }, { label: '运营账户充值' }] } },
      { path: 'account/game-bean/recharge', name: 'ShopGameBeanRecharge', component: GameBeanRecharge, meta: { title: '游戏豆充值', breadcrumb: [{ label: '账户', path: '/shop/account/balance' }, { label: '游戏豆充值' }] } },
      // 用户设置
      { path: 'account/shop-info', name: 'ShopAccountShopInfo', component: ShopInfo, meta: { title: '商家信息', breadcrumb: [{ label: '商家信息' }] } },
      { path: 'account/profile', name: 'ShopAccountProfile', component: Profile, meta: { title: '个人信息', breadcrumb: [{ label: '个人信息' }] } },
      { path: 'account/bind-wechat', redirect: '/shop/account/profile' },
      { path: 'account/bind-email', redirect: '/shop/account/profile' },
      { path: 'account/security', name: 'ShopAccountSecurity', component: Security, meta: { title: '账户安全', breadcrumb: [{ label: '账户安全' }] } },
      { path: 'account/message', name: 'ShopAccountMessage', component: Message, meta: { title: '消息中心', breadcrumb: [{ label: '消息中心' }] } },
    ]
  },

  // ===== 代理商后台 =====
  {
    path: '/agent',
    name: 'Agent',
    component: AgentLayout,
    redirect: '/agent/dashboard',
    children: [
      { path: 'dashboard', name: 'AgentDashboard', component: AgentDashboard, meta: { title: '首页概览' } },
      { path: 'merchants', name: 'AgentMerchants', component: AgentMerchants, meta: { title: '商家管理' } },
      { path: 'stores', name: 'AgentStores', component: AgentStores, meta: { title: '店铺概览' } },
      { path: 'stores/devices', name: 'AgentStoreDevices', component: AgentDeviceStats, meta: { title: '设备统计' } },
      { path: 'commission', name: 'AgentCommission', component: AgentCommission, meta: { title: '分润明细' } },
      { path: 'settlement', name: 'AgentSettlement', component: AgentSettlement, meta: { title: '结算记录' } },
      { path: 'bank-account', name: 'AgentBankAccount', component: AgentBankAccount, meta: { title: '提现账户' } },
      { path: 'reports/revenue', name: 'AgentReportsRevenue', component: AgentRevenueReport, meta: { title: '营收统计' } },
      { path: 'reports/members', name: 'AgentReportsMembers', component: AgentMembersReport, meta: { title: '会员统计' } },
      { path: 'account', name: 'AgentAccount', component: AgentProfile, meta: { title: '账户信息' } },
      { path: 'account/security', name: 'AgentAccountSecurity', component: AgentSecurity, meta: { title: '安全设置' } },
      { path: 'account/message', name: 'AgentMessage', component: AgentMessage, meta: { title: '消息中心' } },
    ]
  },

  // 默认重定向到登录页面
  {
    path: '/',
    redirect: '/login'
  },
  // 404 兜底
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
