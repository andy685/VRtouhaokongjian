#!/usr/bin/env python3
import json, os
with open('/tmp/vue_pages.json') as f:
    data = json.load(f)

funcs = {
    'Dashboard':'首页工作台', 'Login':'登录页(三角色)', 'Members':'会员列表',
    'MemberList':'会员列表(平台)', 'MemberEdit':'编辑会员',
    'MemberLevels':'会员等级', 'MemberRanking':'消费排行',
    'MemberBalance':'储值变更', 'MemberDiscount':'会员折扣',
    'MemberGrowth':'增长分析', 'MemberCenter':'会员概览',
    'MemberCoinsQuery':'游戏币查询', 'MemberCoinAdjustLog':'游戏币调整日志',
    'MemberDepositLog':'储值审计', 'MemberPrepaidTimesQuery':'预存次数',
    'MemberTimesAdjustLog':'次数调整日志','MemberConsumptionRanking':'消费排行',
    'Products':'商品CRUD', 'ProductDetail':'商品详情', 'SingleConsumption':'单次消费项目',
    'ProductSales':'售品报表', 'Recharge':'充值套餐', 'AccountRecharge':'账户充值',
    'GameBeanRecharge':'游戏豆充值', 'ShopCoupons':'优惠券(商家)',
    'Coupons':'优惠券(平台)', 'Promotions':'促销活动', 'Marketing':'营销中心',
    'Packages':'套票管理', 'Gifts':'活动赠送', 'Sms':'短信服务', 'SmsCreate':'创建短信',
    'SmsTemplates':'短信模板', 'Guides':'导购管理', 'GuideMembers':'会员运营',
    'OrderSearch':'订单查询', 'CashierOrder':'收银订单', 'OnDemandOrder':'点播订单',
    'ManualDeductOrder':'手动扣费', 'EditBalanceOrder':'修改储值',
    'PointsExchangeOrder':'游戏币兑换', 'GiftOrder':'活动赠送订单',
    'DailySales':'销售日报', 'HistoricalRevenue':'历史营收', 'ChannelRevenue':'渠道营收',
    'RevenueReport':'营收统计(代理)', 'AccountStats':'账户金额统计', 'Reports':'数据报表',
    'StaffOrders':'员工点播', 'Shifts':'交接班', 'OnDemandData':'点播概览',
    'OnDemandGameRecord':'点播游戏', 'OnDemandFilmRecord':'点播影片',
    'OnDemandDeviceSummary':'设备汇总', 'OnDemandGameSummary':'游戏汇总',
    'FilmRevenue':'影片分成', 'Settlement':'结算记录', 'SettlementManage':'结算管理',
    'SettlementConfig':'结算配置', 'AgentSettlementConfig':'代理结算配置',
    'Reconciliation':'对账中心', 'AccountBalance':'账户总览', 'AccountBills':'账户账单',
    'OperatingBills':'运营账单', 'StoreList':'店铺列表(平台)', 'ShopStoreList':'店铺列表(商家)',
    'MerchantList':'商家列表(平台)', 'Merchants':'商家管理(代理)', 'AgentList':'代理商列表',
    'Stores':'店铺概览(代理)', 'DeviceStats':'设备统计(代理)', 'Devices':'设备管理',
    'DeviceOverview':'设备总览(平台)', 'DeviceOnlineStats':'设备在线统计',
    'CashierTerminal':'收银终端', 'CashierSettings':'收银设置', 'CashierReceiptSettings':'小票设置',
    'OnDemandSettings':'点播设置', 'FilmGenres':'内容分类',
    'PointsSettings':'游戏币参数', 'SystemParams':'系统参数',
    'Settings':'系统设置', 'System':'系统运维', 'Users':'员工管理(商家)',
    'UserList':'用户管理(平台)', 'Roles':'角色管理(商家)', 'RolePermission':'权限矩阵(平台)',
    'Workbench':'工作台', 'ContentManage':'内容管理', 'ContentDistribute':'内容分发',
    'ContentConsumption':'内容消费', 'GameLibrary':'游戏库', 'GameDetail':'游戏详情(907行)',
    'GameBeanSales':'游戏豆销售', 'GameBeanSalesDetail':'游戏豆销售明细',
    'FinanceOverview':'营收总览', 'PayoutManager':'打款管理(738行)',
    'TierStrategyConfig':'阶梯策略', 'HelpCenterDocs':'帮助文档', 'HelpCenterFaq':'FAQ',
    'NoticeAnnouncement':'公告管理', 'NoticePush':'消息推送', 'SystemNoticeInbox':'系统通知',
    'OrderFlow':'订单流水', 'Activities':'活动管理', 'Profile':'个人信息', 'Security':'安全设置',
    'BankAccount':'提现账户', 'Commission':'分润明细', 'AgentProfile':'代理商资料',
    'AgentSecurity':'代理安全', 'Message':'消息中心', 'MembersReport':'会员统计(代理)',
    'NoticeList':'通知列表', 'Reports':'多维报表'
}

total_lines = sum(v['lines'] for v in data.values())
total_size = sum(v['size'] for v in data.values())

groups = {'agent': [], 'platform': [], 'shop': []}
others = []
for k in sorted(data.keys()):
    mod = k.split('/')[0]
    if mod in groups: groups[mod].append(k)
    else: others.append(k)

html = []
html.append('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">')
html.append('<title>头号空间 - 功能规格说明书</title>')
html.append('<style>')
html.append('body{font-family:-apple-system,PingFang SC,Microsoft YaHei,sans-serif;background:#0f172a;color:#e2e8f0;padding:40px 60px;max-width:1200px;margin:auto}')
html.append('h1{font-size:28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}')
html.append('.meta{color:#64748b;margin:10px 0 30px;font-size:13px}')
html.append('h2{font-size:22px;margin:40px 0 16px;padding-bottom:8px;border-bottom:2px solid #6366f1;color:#a78bfa}')
html.append('.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:16px 0 30px}')
html.append('.sc{background:#1e293b;border:1px solid #334155;border-radius:8px;padding:16px;text-align:center}')
html.append('.sc .n{font-size:26px;font-weight:700;color:#6366f1}.sc .l{font-size:12px;color:#64748b;margin-top:4px}')
html.append('table{width:100%;border-collapse:collapse;margin:12px 0 30px;font-size:13px}')
html.append('th{background:#1a1a3e;color:#a78bfa;font-weight:600;text-align:left;padding:8px 10px;border:1px solid #334155}')
html.append('td{padding:6px 10px;border:1px solid #334155;color:#94a3b8}')
html.append('tr:hover td{background:rgba(99,102,241,.04)}')
html.append('code{font-family:JetBrains Mono,monospace;font-size:11px;color:#60a5fa}')
html.append('.ft{text-align:center;color:#475569;font-size:12px;margin-top:50px;padding-top:20px;border-top:1px solid #1e1e35}')
html.append('</style></head><body>')
html.append(f'<h1>\u5934\u53f7\u7a7a\u95f4 - \u529f\u80fd\u89c4\u683c\u8bf4\u660e\u4e66</h1>')
html.append(f'<div class="meta">v1.3.1 | 2026-05-04 | \u5171{len(data)}\u4e2a\u9875\u9762\u7ec4\u4ef6</div>')
html.append(f'<div class="sg"><div class="sc"><div class="n">{len(data)}</div><div class="l">\u9875\u9762\u603b\u6570</div></div>')
html.append(f'<div class="sc"><div class="n">{total_lines//1000}K</div><div class="l">\u4ee3\u7801\u884c\u6570</div></div>')
html.append(f'<div class="sc"><div class="n">{total_size}KB</div><div class="l">\u603b\u5927\u5c0f</div></div></div>')

for mod_key, mod_name in [('agent','\u4ee3\u7406\u5546\u7cfb\u7edf (13\u9875)'), ('platform','\u603b\u8fd0\u8425\u540e\u53f0 (36\u9875)'), ('shop','\u5546\u5bb6\u7ba1\u7406\u540e\u53f0 (76\u9875)')]:
    pages = groups[mod_key]
    if not pages: continue
    html.append(f'<h2>{mod_name}</h2>')
    html.append('<table><tr><th>\u8def\u5f84</th><th>\u884c</th><th>KB</th><th>\u529f\u80fd\u63cf\u8ff0</th></tr>')
    for k in pages:
        v = data[k]
        name = k.split('/')[-1].replace('.vue','')
        desc = funcs.get(name, name)
        html.append(f'<tr><td><code>{k}</code></td><td>{v["lines"]}</td><td>{v["size"]}</td><td>{desc}</td></tr>')
    html.append('</table>')

if others:
    html.append('<h2>\u516c\u5171 (1\u9875)</h2>')
    html.append('<table><tr><th>\u8def\u5f84</th><th>\u884c</th><th>KB</th><th>\u529f\u80fd\u63cf\u8ff0</th></tr>')
    for k in others:
        v = data[k]
        name = k.replace('.vue','')
        desc = funcs.get(name, name)
        html.append(f'<tr><td><code>{k}</code></td><td>{v["lines"]}</td><td>{v["size"]}</td><td>{desc}</td></tr>')
    html.append('</table>')

html.append('<div class="ft">\u5934\u53f7\u7a7a\u95f4 - \u529f\u80fd\u89c4\u683c\u8bf4\u660e\u4e66 v1.3.1 | 2026-05-04</div>')
html.append('</body></html>')

out = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/\u529f\u80fd\u89c4\u683c\u8bf4\u660e\u4e66.html'
with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))
print(f'Done: {out} ({len(html)} lines)')
