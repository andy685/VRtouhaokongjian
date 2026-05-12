import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 布局和登录页保持静态导入（首屏必需）
import PlatformLayout from '../layouts/PlatformLayout.vue'
import ShopLayout from '../layouts/ShopLayout.vue'
import AgentLayout from '../layouts/AgentLayout.vue'
import Login from '../views/Login.vue'

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
      { path: 'dashboard', name: 'PlatformDashboard', component: () => import('../views/platform/Dashboard.vue'), meta: { title: '大屏看板' } },
      { path: 'reports', name: 'PlatformReports', component: () => import('../views/platform/Reports.vue'), meta: { title: '数据报表' } },
      { path: 'stores', name: 'PlatformStores', component: () => import('../views/platform/StoreList.vue'), meta: { title: '店铺列表' } },
      { path: 'merchants', name: 'PlatformMerchants', component: () => import('../views/platform/MerchantList.vue'), meta: { title: '商家管理' } },
      { path: 'agents', name: 'PlatformAgents', component: () => import('../views/platform/AgentList.vue'), meta: { title: '代理商' } },
      { path: 'games', name: 'PlatformGames', component: () => import('../views/platform/GameLibrary.vue'), meta: { title: '游戏库' } },
      { path: 'games/add', name: 'PlatformGameAdd', component: () => import('../views/platform/GameDetail.vue'), meta: { title: '新增游戏' } },
      { path: 'games/:id', name: 'PlatformGameDetail', component: () => import('../views/platform/GameDetail.vue'), meta: { title: '游戏详情' } },
      { path: 'content', name: 'PlatformContent', component: () => import('../views/platform/ContentDistribute.vue'), meta: { title: '内容分发' } },
      { path: 'banners', name: 'PlatformBanners', component: () => import('../views/platform/BannerManage.vue'), meta: { title: 'Banner 管理' } },
      { path: 'game-categories', name: 'PlatformGameCategories', component: () => import('../views/platform/GameThemes.vue'), meta: { title: '游戏题材' } },
      { path: 'users', name: 'PlatformUsers', component: () => import('../views/platform/UserList.vue'), meta: { title: '账号管理' } },
      { path: 'users/roles', name: 'PlatformUsersRoles', component: () => import('../views/platform/RolePermission.vue'), meta: { title: '角色权限' } },
      { path: 'gamebean-sales', name: 'PlatformGameBeanSales', component: () => import('../views/platform/GameBeanSales.vue'), meta: { title: '销售总览' } },
      { path: 'gamebean-sales/detail', name: 'PlatformGameBeanSalesDetail', component: () => import('../views/platform/GameBeanSalesDetail.vue'), meta: { title: '销售明细' } },
      { path: 'members', name: 'PlatformMembers', component: () => import('../views/platform/MemberCenter.vue'), meta: { title: '会员数据' } },
      { path: 'members/list', name: 'PlatformMembersList', component: () => import('../views/platform/MemberList.vue'), meta: { title: '会员列表' } },
      { path: 'members/growth', name: 'PlatformMembersGrowth', component: () => import('../views/platform/MemberGrowth.vue'), meta: { title: '会员增长' } },
      { path: 'members/ranking', name: 'PlatformMemberRanking', component: () => import('../views/platform/MemberConsumptionRanking.vue'), meta: { title: '会员消费排行' } },
      { path: 'members/deposit-log', name: 'PlatformMemberDepositLog', component: () => import('../views/platform/MemberDepositLog.vue'), meta: { title: '会员储值变更' } },
      { path: 'members/coins-query', name: 'PlatformMemberCoinsQuery', component: () => import('../views/platform/MemberCoinsQuery.vue'), meta: { title: '会员游戏币查询' } },
      { path: 'members/coin-adjust-log', name: 'PlatformMemberCoinAdjustLog', component: () => import('../views/platform/MemberCoinAdjustLog.vue'), meta: { title: '游戏币调整有效期查询' } },
      { path: 'members/prepaid-times-query', name: 'PlatformMemberPrepaidTimesQuery', component: () => import('../views/platform/MemberPrepaidTimesQuery.vue'), meta: { title: '会员预存次数查询' } },
      { path: 'members/times-adjust-log', name: 'PlatformMemberTimesAdjustLog', component: () => import('../views/platform/MemberTimesAdjustLog.vue'), meta: { title: '次数调整有效查询' } },
      // 订单流水
      { path: 'order-flow', redirect: '/platform/order-flow/cashier' },
      { path: 'order-flow/cashier', name: 'PlatformOrderFlowCashier', component: () => import('../views/platform/OrderFlow.vue'), meta: { title: '收银订单' } },
      { path: 'order-flow/vod', name: 'PlatformOrderFlowVod', component: () => import('../views/platform/OrderFlow.vue'), meta: { title: '点播系统订单' } },
      { path: 'order-flow/manual', name: 'PlatformOrderFlowManual', component: () => import('../views/platform/OrderFlow.vue'), meta: { title: '手动扣费订单' } },
      { path: 'order-flow/balance', name: 'PlatformOrderFlowBalance', component: () => import('../views/platform/OrderFlow.vue'), meta: { title: '修改储值订单' } },
      { path: 'order-flow/gamebean', name: 'PlatformOrderFlowGamebean', component: () => import('../views/platform/OrderFlow.vue'), meta: { title: '游戏币兑换订单' } },
      { path: 'order-flow/promo', name: 'PlatformOrderFlowPromo', component: () => import('../views/platform/OrderFlow.vue'), meta: { title: '活动赠送订单' } },
      // 数据中心扩展
      { path: 'content-consumption', name: 'PlatformContentConsumption', component: () => import('../views/platform/ContentConsumption.vue'), meta: { title: '内容消费大盘' } },
      { path: 'device-overview', name: 'PlatformDeviceOverview', component: () => import('../views/platform/DeviceOverview.vue'), meta: { title: '设备运行总览' } },
      { path: 'device-config', name: 'PlatformDeviceConfig', component: () => import('../views/platform/DeviceConfig.vue'), meta: { title: '设备配置管理' } },
      // 平台财务
      { path: 'finance', name: 'PlatformFinance', component: () => import('../views/platform/FinanceOverview.vue'), meta: { title: '营收总览' } },
      { path: 'finance/settlement', name: 'PlatformFinanceSettlement', component: () => import('../views/platform/SettlementManage.vue'), meta: { title: '商家分账管理' } },
      { path: 'finance/settlement-config', name: 'PlatformSettlementConfig', component: () => import('../views/platform/SettlementConfig.vue'), meta: { title: '结算配置' } },
      { path: 'finance/reconciliation', name: 'PlatformFinanceReconciliation', component: () => import('../views/platform/Reconciliation.vue'), meta: { title: '对账中心' } },
      { path: 'finance/payouts', name: 'PlatformPayoutManager', component: () => import('../views/platform/PayoutManager.vue'), meta: { title: '代理商分账管理' } },
      { path: 'finance/agent-settlement-config', name: 'PlatformAgentSettlementConfig', component: () => import('../views/platform/AgentSettlementConfig.vue'), meta: { title: '代理商结算配置' } },
      { path: 'finance/tier-config', name: 'PlatformTierConfig', component: () => import('../views/platform/TierStrategyConfig.vue'), meta: { title: '阶梯策略配置' } },
      // 系统运维
      { path: 'system', name: 'PlatformSystem', component: () => import('../views/platform/System.vue'), meta: { title: '版本发布' } },
      { path: 'system/alerts', name: 'PlatformSystemAlerts', component: () => import('../views/platform/System.vue'), meta: { title: '告警中心' } },
      { path: 'system/logs', name: 'PlatformSystemLogs', component: () => import('../views/platform/System.vue'), meta: { title: '操作日志' } },
      { path: 'support/tickets', name: 'PlatformSupportTickets', component: () => import('../views/platform/System.vue'), meta: { title: '工单系统' } },
      { path: 'support/help', name: 'PlatformSupportHelp', component: () => import('../views/platform/System.vue'), meta: { title: '帮助中心' } },
      // 帮助中心
      { path: 'help-center/docs', name: 'HelpCenterDocs', component: () => import('../views/platform/HelpCenterDocs.vue'), meta: { title: '帮助文档' } },
      { path: 'help-center/faq', name: 'HelpCenterFaq', component: () => import('../views/platform/HelpCenterFaq.vue'), meta: { title: 'FAQ' } },
      // ------- 平台通知系统 -------
      { path: 'notice/announcement', name: 'NoticeAnnouncement', component: () => import('../views/platform/NoticeAnnouncement.vue'), meta: { title: '公告管理' } },
      { path: 'notice/push', name: 'NoticePush', component: () => import('../views/platform/NoticePush.vue'), meta: { title: '消息推送' } },
      { path: 'notice/inbox', name: 'SystemNoticeInbox', component: () => import('../views/platform/SystemNoticeInbox.vue'), meta: { title: '系统通知' } },
      // 反馈
      { path: 'feedback-summary', name: 'PlatformFeedbackSummary', component: () => import('../views/platform/FeedbackSummary.vue'), meta: { title: '反馈汇总' } },
      // 短信模板审核
      { path: 'sms-template-audit', name: 'PlatformSmsTemplateAudit', component: () => import('../views/platform/SmsTemplateAudit.vue'), meta: { title: '短信模板审核' } },
      // 个人中心
      { path: 'account/profile', name: 'PlatformAccountProfile', component: () => import('../views/platform/account/Profile.vue'), meta: { title: '个人信息', breadcrumb: [{ label: '个人信息' }] } },
      { path: 'account/security', name: 'PlatformAccountSecurity', component: () => import('../views/platform/account/Security.vue'), meta: { title: '安全设置', breadcrumb: [{ label: '安全设置' }] } },
    ]
  },

  // ===== 商家后台（商家） =====
  {
    path: '/shop',
    name: 'Shop',
    component: ShopLayout,
    redirect: '/shop/workbench',
    children: [
      { path: 'workbench', name: 'ShopWorkbench', component: () => import('../views/shop/Workbench.vue'), meta: { title: '今日概况', breadcrumb: [{ label: '首页', path: '/shop/workbench' }] } },
      { path: 'workbench/devices', name: 'ShopWorkbenchDevices', component: () => import('../views/shop/Workbench.vue'), meta: { title: '设备监控' } },
      { path: 'workbench/revenue', name: 'ShopWorkbenchRevenue', component: () => import('../views/shop/Workbench.vue'), meta: { title: '营收概览' } },
      { path: 'products', name: 'ShopProducts', component: () => import('../views/shop/Products.vue'), meta: { title: '实物商品' } },
      { path: 'products/add', name: 'ShopProductAdd', component: () => import('../views/shop/ProductDetail.vue'), meta: { title: '添加商品' } },
      { path: 'products/:id', name: 'ShopProductDetail', component: () => import('../views/shop/ProductDetail.vue'), meta: { title: '编辑商品' } },
      { path: 'products/inventory', name: 'ShopProductsInventory', component: () => import('../views/shop/Products.vue'), meta: { title: '实物库存管理' } },
      { path: 'single-consumption', name: 'ShopSingleConsumption', component: () => import('../views/shop/SingleConsumption.vue'), meta: { title: '单次消费项目' } },
      { path: 'recharge', name: 'ShopRecharge', component: () => import('../views/shop/Recharge.vue'), meta: { title: '充值套餐' } },
      { path: 'packages', name: 'ShopPackages', component: () => import('../views/shop/Packages.vue'), meta: { title: '套票' } },
      { path: 'coupons', name: 'ShopCoupons', component: () => import('../views/shop/ShopCoupons.vue'), meta: { title: '优惠券' } },
      { path: 'promotions', name: 'ShopPromotions', component: () => import('../views/shop/Promotions.vue'), meta: { title: '促销' } },
      { path: 'gifts', name: 'ShopGifts', component: () => import('../views/shop/Gifts.vue'), meta: { title: '活动赠送' } },
      { path: 'sms-templates', name: 'ShopSmsTemplates', component: () => import('../views/shop/SmsTemplates.vue'), meta: { title: '短信模板' } },
      { path: 'sms', name: 'ShopSms', component: () => import('../views/shop/Sms.vue'), meta: { title: '短信服务' } },
      { path: 'sms/create', name: 'ShopSmsCreate', component: () => import('../views/shop/SmsCreate.vue'), meta: { title: '添加发送任务' } },
      { path: 'guide-members', name: 'ShopGuideMembers', component: () => import('../views/shop/GuideMembers.vue'), meta: { title: '会员管理' } },
      { path: 'guides', name: 'ShopGuides', component: () => import('../views/shop/Guides.vue'), meta: { title: '导购管理' } },
      { path: 'feedback', name: 'ShopFeedback', component: () => import('../views/shop/Feedback.vue'), meta: { title: '反馈管理' } },
      { path: 'members', name: 'ShopMembers', component: () => import('../views/shop/Members.vue'), meta: { title: '会员列表' } },
      { path: 'member-discount', name: 'ShopMemberDiscount', component: () => import('../views/shop/MemberDiscount.vue'), meta: { title: '设置会员折扣' } },
      { path: 'member-edit', name: 'ShopMemberEdit', component: () => import('../views/shop/MemberEdit.vue'), meta: { title: '编辑会员信息' } },
      { path: 'member-levels', name: 'ShopMemberLevels', component: () => import('../views/shop/MemberLevels.vue'), meta: { title: '会员级别' } },
      { path: 'member-ranking', name: 'ShopMemberRanking', component: () => import('../views/shop/MemberRanking.vue'), meta: { title: '会员消费排行' } },
      { path: 'member-balance', name: 'ShopMemberBalance', component: () => import('../views/shop/MemberBalance.vue'), meta: { title: '会员储值变更' } },
      { path: 'member-points-query', name: 'ShopMemberPointsQuery', component: () => import('../views/shop/MemberPointsQuery.vue'), meta: { title: '会员游戏币查询' } },
      { path: 'member-points-adjust-log', name: 'ShopMemberPointsAdjustLog', component: () => import('../views/shop/MemberPointsAdjustLog.vue'), meta: { title: '游戏币调整有效期查询' } },
      { path: 'member-prepaid-times-query', name: 'ShopMemberPrepaidTimesQuery', component: () => import('../views/shop/MemberPrepaidTimesQuery.vue'), meta: { title: '会员预存次数查询' } },
      { path: 'times-adjust-log', name: 'ShopTimesAdjustLog', component: () => import('../views/shop/TimesAdjustLog.vue'), meta: { title: '次数调整有效期查询' } },
      // 数据报表
      { path: 'daily-sales', name: 'ShopDailySales', component: () => import('../views/shop/DailySales.vue'), meta: { title: '店铺销售日报' } },
      { path: 'historical-revenue', name: 'ShopHistoricalRevenue', component: () => import('../views/shop/HistoricalRevenue.vue'), meta: { title: '历史营收统计' } },
      { path: 'channel-revenue', name: 'ShopChannelRevenue', component: () => import('../views/shop/ChannelRevenue.vue'), meta: { title: '渠道营收统计' } },
      { path: 'product-sales', name: 'ShopProductSales', component: () => import('../views/shop/ProductSales.vue'), meta: { title: '售品销售报表' } },
      { path: 'account-stats', name: 'ShopAccountStats', component: () => import('../views/shop/AccountStats.vue'), meta: { title: '账户金额统计' } },
      { path: 'shifts', name: 'ShopShifts', component: () => import('../views/shop/Shifts.vue'), meta: { title: '交接班记录' } },
      { path: 'staff-orders', name: 'ShopStaffOrders', component: () => import('../views/shop/StaffOrders.vue'), meta: { title: '员工点播' } },
      { path: 'on-demand-data', name: 'ShopOnDemandData', component: () => import('../views/shop/OnDemandData.vue'), meta: { title: '数据概览' } },
      { path: 'on-demand-game-record', name: 'ShopOnDemandGameRecord', component: () => import('../views/shop/OnDemandGameRecord.vue'), meta: { title: '点播游戏记录' } },
      { path: 'on-demand-film-record', name: 'ShopOnDemandFilmRecord', component: () => import('../views/shop/OnDemandFilmRecord.vue'), meta: { title: '点播影片记录' } },
      { path: 'on-demand-device-summary', name: 'ShopOnDemandDeviceSummary', component: () => import('../views/shop/OnDemandDeviceSummary.vue'), meta: { title: '点播设备汇总' } },
      { path: 'on-demand-game-summary', name: 'ShopOnDemandGameSummary', component: () => import('../views/shop/OnDemandGameSummary.vue'), meta: { title: '点播游戏汇总' } },
      { path: 'order-search', name: 'ShopOrderSearch', component: () => import('../views/shop/OrderSearch.vue'), meta: { title: '订单查询' } },
      { path: 'cashier-order', name: 'ShopCashierOrder', component: () => import('../views/shop/CashierOrder.vue'), meta: { title: '收银订单' } },
      { path: 'ondemand-order', name: 'ShopOnDemandOrder', component: () => import('../views/shop/OnDemandOrder.vue'), meta: { title: '点播系统订单' } },
      { path: 'manual-deduct-order', name: 'ShopManualDeductOrder', component: () => import('../views/shop/ManualDeductOrder.vue'), meta: { title: '手动扣费订单' } },
      { path: 'edit-balance-order', name: 'ShopEditBalanceOrder', component: () => import('../views/shop/EditBalanceOrder.vue'), meta: { title: '修改储值订单' } },
      { path: 'points-exchange-order', name: 'ShopPointsExchangeOrder', component: () => import('../views/shop/PointsExchangeOrder.vue'), meta: { title: '游戏币兑换订单' } },
      { path: 'gift-order', name: 'ShopGiftOrder', component: () => import('../views/shop/GiftOrder.vue'), meta: { title: '活动赠送订单' } },
      { path: 'film-revenue', name: 'ShopFilmRevenue', component: () => import('../views/shop/FilmRevenue.vue'), meta: { title: '游戏分成明细' } },
      { path: 'settlement', name: 'ShopSettlement', component: () => import('../views/shop/Settlement.vue'), meta: { title: '结算记录' } },
      { path: 'reconciliation', name: 'ShopReconciliation', component: () => import('../views/shop/Reconciliation.vue'), meta: { title: '对账中心' } },
      // 系统设置
      { path: 'store-list', name: 'ShopStoreList', component: () => import('../views/shop/ShopStoreList.vue'), meta: { title: '店铺列表' } },
      { path: 'on-demand-settings', name: 'ShopOnDemandSettings', component: () => import('../views/shop/OnDemandSettings.vue'), meta: { title: '待机画面' } },
      { path: 'devices', name: 'ShopDevices', component: () => import('../views/shop/Devices.vue'), meta: { title: '设备列表' } },
      { path: 'devices/control', name: 'ShopDevicesControl', component: () => import('../views/shop/Devices.vue'), meta: { title: '远程控制' } },
      { path: 'devices/bind', name: 'ShopDeviceBind', component: () => import('../views/shop/DeviceBind.vue'), meta: { title: '设备绑定管理' } },
      { path: 'devices/online-stats', name: 'ShopDeviceOnlineStats', component: () => import('../views/shop/DeviceOnlineStats.vue'), meta: { title: '设备在线统计' } },
      { path: 'cashier-terminal', name: 'ShopCashierTerminal', component: () => import('../views/shop/CashierTerminal.vue'), meta: { title: '收银终端' } },
      { path: 'cashier-settings', name: 'ShopCashierSettings', component: () => import('../views/shop/CashierSettings.vue'), meta: { title: '支付设置' } },
      { path: 'cashier-receipt', name: 'ShopCashierReceipt', component: () => import('../views/shop/CashierReceiptSettings.vue'), meta: { title: '小票设置' } },
      { path: 'ic-card', name: 'ShopIcCard', component: () => import('../views/shop/IcCard.vue'), meta: { title: 'IC卡管理' } },
      { path: 'points-settings', name: 'ShopPointsSettings', component: () => import('../views/shop/PointsSettings.vue'), meta: { title: '游戏币设置' } },
      { path: 'system-params', name: 'ShopSystemParams', component: () => import('../views/shop/SystemParams.vue'), meta: { title: '系统参数' } },
      { path: 'users', name: 'ShopUsers', component: () => import('../views/shop/Users.vue'), meta: { title: '用户列表' } },
      { path: 'roles', name: 'ShopRoles', component: () => import('../views/shop/Roles.vue'), meta: { title: '角色列表' } },
      // 账户
      { path: 'account/bills', name: 'ShopAccountBills', component: () => import('../views/shop/AccountBills.vue'), meta: { title: '账户账单' } },
      { path: 'account/operating-bills', name: 'ShopOperatingBills', component: () => import('../views/shop/OperatingBills.vue'), meta: { title: '运营账户账单' } },
      { path: 'account/balance', name: 'ShopAccountBalance', component: () => import('../views/shop/AccountBalance.vue'), meta: { title: '账户' } },
      { path: 'account/recharge', name: 'ShopAccountRecharge', component: () => import('../views/shop/AccountRecharge.vue'), meta: { title: '运营账户充值' } },
      { path: 'account/game-bean/recharge', name: 'ShopGameBeanRecharge', component: () => import('../views/shop/GameBeanRecharge.vue'), meta: { title: '游戏豆充值' } },
      // 用户设置
      { path: 'account/shop-info', name: 'ShopAccountShopInfo', component: () => import('../views/shop/account/ShopInfo.vue'), meta: { title: '商家信息' } },
      { path: 'account/profile', name: 'ShopAccountProfile', component: () => import('../views/shop/account/Profile.vue'), meta: { title: '个人信息' } },
      { path: 'account/bind-wechat', redirect: '/shop/account/profile' },
      { path: 'account/bind-email', redirect: '/shop/account/profile' },
      { path: 'account/security', name: 'ShopAccountSecurity', component: () => import('../views/shop/account/Security.vue'), meta: { title: '账户安全' } },
      { path: 'account/message', name: 'ShopAccountMessage', component: () => import('../views/shop/account/Message.vue'), meta: { title: '消息中心' } },
    ]
  },

  // ===== 代理商后台 =====
  {
    path: '/agent',
    name: 'Agent',
    component: AgentLayout,
    redirect: '/agent/dashboard',
    children: [
      { path: 'dashboard', name: 'AgentDashboard', component: () => import('../views/agent/Dashboard.vue'), meta: { title: '首页概览' } },
      { path: 'merchants', name: 'AgentMerchants', component: () => import('../views/agent/Merchants.vue'), meta: { title: '商家管理' } },
      { path: 'stores', name: 'AgentStores', component: () => import('../views/agent/Stores.vue'), meta: { title: '店铺概览' } },
      { path: 'stores/devices', name: 'AgentStoreDevices', component: () => import('../views/agent/DeviceStats.vue'), meta: { title: '设备统计' } },
      { path: 'commission', name: 'AgentCommission', component: () => import('../views/agent/Commission.vue'), meta: { title: '分润明细' } },
      { path: 'settlement', name: 'AgentSettlement', component: () => import('../views/agent/Settlement.vue'), meta: { title: '结算记录' } },
      { path: 'bank-account', name: 'AgentBankAccount', component: () => import('../views/agent/BankAccount.vue'), meta: { title: '提现账户' } },
      { path: 'reports/revenue', name: 'AgentReportsRevenue', component: () => import('../views/agent/RevenueReport.vue'), meta: { title: '营收统计' } },
      { path: 'reports/members', name: 'AgentReportsMembers', component: () => import('../views/agent/MembersReport.vue'), meta: { title: '会员统计' } },
      { path: 'account', name: 'AgentAccount', component: () => import('../views/agent/AgentProfile.vue'), meta: { title: '账户信息' } },
      { path: 'account/security', name: 'AgentAccountSecurity', component: () => import('../views/agent/AgentSecurity.vue'), meta: { title: '安全设置' } },
      { path: 'account/message', name: 'AgentMessage', component: () => import('../views/agent/Message.vue'), meta: { title: '消息中心' } },
    ]
  },

  // 默认重定向
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
