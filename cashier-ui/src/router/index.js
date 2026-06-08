import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/LoginView.vue'),
    meta: { title: '店员登录' }
  },
  {
    path: '/',
    component: () => import('../components/MainLayout.vue'),
    redirect: '/sale',
    children: [
      // 销售模块
      {
        path: '/sale',
        name: 'Sale',
        component: () => import('../views/sale/SaleView.vue'),
        meta: { title: '销售', icon: 'ShoppingCart' }
      },
      {
        path: '/sale/new-member',
        name: 'SaleNewMember',
        component: () => import('../views/sale/NewMemberView.vue'),
        meta: { title: '新增会员', parent: '销售' }
      },
      {
        path: '/sale/package',
        name: 'SalePackage',
        component: () => import('../views/sale/PackageView.vue'),
        meta: { title: '套票', parent: '销售' }
      },
      {
        path: '/sale/product',
        name: 'SaleProduct',
        component: () => import('../views/sale/ProductView.vue'),
        meta: { title: '商品', parent: '销售' }
      },
      {
        path: '/sale/recharge-activity',
        name: 'SaleRechargeActivity',
        component: () => import('../views/sale/RechargeActivityView.vue'),
        meta: { title: '充值活动', parent: '销售' }
      },
      {
        path: '/sale/checkout-cash',
        name: 'CheckoutCash',
        component: () => import('../views/sale/CheckoutCashView.vue'),
        meta: { title: '现金收款', parent: '销售' }
      },
      {
        path: '/sale/checkout-online',
        name: 'CheckoutOnline',
        component: () => import('../views/sale/CheckoutOnlineView.vue'),
        meta: { title: '扫码支付', parent: '销售' }
      },
      // 会员模块
      {
        path: '/member',
        name: 'Member',
        component: () => import('../views/member/MemberListView.vue'),
        meta: { title: '会员', icon: 'User' }
      },
      {
        path: '/member/:id',
        name: 'MemberDetail',
        component: () => import('../views/member/MemberDetailView.vue'),
        meta: { title: '会员详情', parent: '会员' }
      },
      {
        path: '/member/deduct',
        name: 'MemberDeduct',
        component: () => import('../views/member/MemberDeductView.vue'),
        meta: { title: '会员扣费', parent: '会员' }
      },
      {
        path: '/member/deduct/select-device',
        name: 'SelectDevice',
        component: () => import('../views/member/SelectDeviceView.vue'),
        meta: { title: '选择设备', parent: '会员' }
      },
      // 订单模块
      {
        path: '/order',
        name: 'Order',
        component: () => import('../views/order/OrderListView.vue'),
        meta: { title: '订单', icon: 'List' }
      },
      {
        path: '/order/vod',
        name: 'VodOrder',
        component: () => import('../views/order/OrderListView.vue'),
        meta: { title: '点播系统订单', parent: '订单' }
      },
      {
        path: '/order/manual',
        name: 'ManualOrder',
        component: () => import('../views/order/OrderListView.vue'),
        meta: { title: '手动扣费订单', parent: '订单' }
      },
      {
        path: '/order/recharge-edit',
        name: 'RechargeEdit',
        component: () => import('../views/order/OrderListView.vue'),
        meta: { title: '修改储值订单', parent: '订单' }
      },
      {
        path: '/order/coin-exchange',
        name: 'CoinExchange',
        component: () => import('../views/order/OrderListView.vue'),
        meta: { title: '游戏币兑换订单', parent: '订单' }
      },
      {
        path: '/order/gift',
        name: 'GiftOrder',
        component: () => import('../views/order/OrderListView.vue'),
        meta: { title: '活动赠送订单', parent: '订单' }
      },
      // 营收模块
      {
        path: '/revenue',
        name: 'Revenue',
        component: () => import('../views/revenue/RevenueView.vue'),
        meta: { title: '营收', icon: 'Money' }
      },
      {
        path: '/revenue/by-clerk',
        name: 'RevenueByClerk',
        component: () => import('../views/revenue/RevenueByClerkView.vue'),
        meta: { title: '按收银员', parent: '营收' }
      },
      {
        path: '/revenue/by-payment',
        name: 'RevenueByPayment',
        component: () => import('../views/revenue/RevenueByPaymentView.vue'),
        meta: { title: '按支付方式', parent: '营收' }
      },
      // 设置模块
      {
        path: '/setting',
        name: 'Setting',
        component: () => import('../views/setting/SettingView.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      },
      {
        path: '/setting/basic',
        name: 'SettingBasic',
        component: () => import('../views/setting/SettingBasicView.vue'),
        meta: { title: '基础设置', parent: '设置' }
      },
      {
        path: '/setting/member',
        name: 'SettingMember',
        component: () => import('../views/setting/SettingMemberView.vue'),
        meta: { title: '会员设置', parent: '设置' }
      },
      {
        path: '/setting/staff-card',
        name: 'SettingStaffCard',
        component: () => import('../views/setting/SettingStaffCardView.vue'),
        meta: { title: '员工卡设置', parent: '设置' }
      },
      // 收银结果
      {
        path: '/result/cash',
        name: 'ResultCash',
        component: () => import('../views/settlement/CashSettlementView.vue'),
        meta: { title: '现金收款确认' }
      },
      {
        path: '/result/recharge-success',
        name: 'RechargeSuccess',
        component: () => import('../views/settlement/RechargeSuccessView.vue'),
        meta: { title: '支付成功' }
      },
      {
        path: '/result/deduct-success',
        name: 'DeductSuccess',
        component: () => import('../views/settlement/DeductSuccessView.vue'),
        meta: { title: '扣费成功' }
      },
      // 交班
      {
        path: '/shift',
        name: 'Shift',
        component: () => import('../views/shift/ShiftView.vue'),
        meta: { title: '交班对账' }
      },
      {
        path: '/shift/next',
        name: 'ShiftNext',
        component: () => import('../views/shift/ShiftNextView.vue'),
        meta: { title: '现金清点' }
      },
      // 日志
      {
        path: '/log',
        name: 'Log',
        component: () => import('../views/log/LogView.vue'),
        meta: { title: '日志' }
      },
      // 升级
      {
        path: '/upgrade',
        name: 'Upgrade',
        component: () => import('../views/upgrade/UpgradeView.vue'),
        meta: { title: '升级' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 头号空间收银系统` : '头号空间收银系统'
  next()
})

export default router
