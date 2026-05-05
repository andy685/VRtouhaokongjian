#!/usr/bin/env python3
"""Fix platform finance module table and other business model references"""
import re

fp = '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/头号空间-产品需求文档-PRD-v1.3.md'
with open(fp) as f:
    content = f.read()

# 1. Update finance module table - add hardware store
old_table = '''| 1 | `/platform/finance/overview` | 营收总览 | `RevenueOverview.vue` | 全平台GMV/平台净收入/各线收入占比/月同比趋势/Top10商家&代理商排行 | 超 管 运 营 财 务 |
| 2 | `/platform/finance/game-bean` | 游戏豆销售 | `GameBeanSales.vue` | 游戏豆采购明细/各商家采购量排名/采购价vs零售价差分析/库存预警 | 超 管 运 营 财 务 |'''

new_table = '''| 1 | `/platform/finance/overview` | 营收总览 | `RevenueOverview.vue` | 全平台总收入(硬件佣金+游戏豆销售)/各线收入占比/月同比趋势/Top商家&代理商排行 | 超 管 运 营 财 务 |
| 2 | `/platform/finance/hardware-store` | 硬件商城 | `HardwareStore.vue` | 设备套餐图文展示/商家在线下单/硬件成本录入/佣金自动计算/订单跟踪/发货管理 | 超 管 运 营 |
| 3 | `/platform/finance/game-bean` | 游戏豆销售 | `GameBeanSales.vue` | 游戏豆采购明细/各商家采购量排名/采购趋势/库存预警/定价配置 | 超 管 运 营 财 务 |'''

if old_table in content:
    content = content.replace(old_table, new_table)
    print('✅ Fixed finance table')
else:
    print('❌ Finance table not found')

# 2. Update the number of finance pages in the summary
content = content.replace('平台财务 ~9页', '平台财务 ~9页(含硬件商城)')

# 3. Fix 盈利模型 example 
old_profit = '''预估月营业额 | ¥180,000 | 按 ¥300/天 × 20台 × 30天估算
| SaaS订阅费（专业版） | ¥599 | 商家支付给平台'''
new_profit = '''预估月营业额 | ¥180,000 | 按 ¥300/天 × 20台 × 30天估算
| 游戏豆采购成本 | ¥9,000 | 约100万豆/月 @ ¥0.5/豆(平台定价)'''
content = content.replace(old_profit, new_profit)

# Fix the profit summary
old_summary = '''| SaaS订阅 | +¥599 | |
| 交易抽成 | +¥27,000 | |
| 游戏豆差价(10%) | +¥900 | |
| **平台从此店月净收入 ≈ ¥28,499** |'''
new_summary = '''| 硬件销售佣金 | +¥8,000 | 分摊到月(设备¥30K,成本¥20K) |
| 游戏豆销售(批发) | +¥9,000 | ¥0.5/豆 × 约18万豆/月 |
| **平台从此店月均收入 ≈ ¥17,000** |'''
content = content.replace(old_summary, new_summary)

# 4. Update 竞品 analysis table - remove SaaS reference
content = content.replace('| **SaaS订阅** | 月费制（4档套餐） | 基础版¥299 / 专业版¥599 / 旗舰版¥999 / 定制面议 |', '| **硬件销售** | 设备套餐代理(非自研) | 排除硬件成本后赚取佣金 |')

with open(fp, 'w') as f:
    f.write(content)
print('✅ All fixes applied')
