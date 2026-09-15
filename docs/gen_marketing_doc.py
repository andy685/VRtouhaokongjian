#!/usr/bin/env python3
"""生成《非加盟模式营销方案》docx 文档"""

from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
import os

doc = Document()

# ===== 全局样式 =====
style = doc.styles['Normal']
style.font.name = 'Microsoft YaHei'
style.font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
style.paragraph_format.space_after = Pt(6)
style.paragraph_format.line_spacing = 1.5

# 页边距
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)


def add_heading(text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = 'Microsoft YaHei'
        run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
        if level == 0:
            run.font.size = Pt(22)
            run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x1a)
        elif level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(0x1a, 0x56, 0xc4)
        elif level == 2:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    return h


def add_para(text, bold=False, color=None, size=None):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Microsoft YaHei'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    run.bold = bold
    if color:
        run.font.color.rgb = color
    if size:
        run.font.size = Pt(size)
    return p


def add_bullet(text):
    p = doc.add_paragraph(text, style='List Bullet')
    for run in p.runs:
        run.font.name = 'Microsoft YaHei'
        run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
        run.font.size = Pt(11)
    return p


def add_table(headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # 表头
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = ''
        p = hdr[i].paragraphs[0]
        run = p.add_run(h)
        run.font.name = 'Microsoft YaHei'
        run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
        run.bold = True
        run.font.size = Pt(10)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 数据行
    for row_data in rows:
        row = table.add_row().cells
        for i, val in enumerate(row_data):
            row[i].text = ''
            p = row[i].paragraphs[0]
            run = p.add_run(str(val))
            run.font.name = 'Microsoft YaHei'
            run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
            run.font.size = Pt(10)

    doc.add_paragraph()  # 表后空行
    return table


def add_code_block(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Courier New'
    run.font.size = Pt(9)
    p.paragraph_format.left_indent = Cm(1)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    # 背景色
    shading = p.paragraph_format.element.get_or_add_pPr()
    shd = shading.makeelement(qn('w:shd'), {
        qn('w:val'): 'clear',
        qn('w:color'): 'auto',
        qn('w:fill'): 'F0F4F8'
    })
    shading.append(shd)
    return p


# ===== 封面 =====
add_heading('VR头号空间', level=0)
add_heading('非加盟模式营销方案', level=0)
doc.add_paragraph()
p = doc.add_paragraph()
run = p.add_run('v1.0')
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph()
run = p.add_run('编写日期：2026-09-03')
run.font.size = Pt(11)
run.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

p = doc.add_paragraph()
run = p.add_run('状态：方案探讨')
run.font.size = Pt(11)
run.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
p.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_page_break()

# ===== 一、业务背景 =====
add_heading('一、业务背景', level=1)

add_heading('1.1 原模式（加盟制）', level=2)
add_bullet('商家加盟平台，使用平台全套系统（收银、会员、分账）')
add_bullet('用户充值走平台收银台，资金过平台再分账给商家')
add_bullet('平台通过拉卡拉自动分账或人工打款完成结算')
add_bullet('平台掌控全链路：获客 → 支付 → 分账 → 会员')

add_heading('1.2 变更原因', level=2)
add_bullet('加盟业务受限，资金池风险')
add_bullet('商家希望自主经营，使用自己的收银系统和会员系统')

add_heading('1.3 新模式（非加盟制）', level=2)
add_bullet('平台只卖机器和游戏豆给商家（B2B 供应商）')
add_bullet('商家自主定价、自主收银、自主管理会员')
add_bullet('平台与商家之间仅剩游戏豆采购关系')
add_bullet('平台收入来源：游戏豆批发差价 + 机器销售')

# ===== 二、关系边界 =====
add_heading('二、平台与商家的关系边界', level=1)

add_table(
    ['维度', '平台负责', '商家负责'],
    [
        ['机器', '提供、维护', '日常运营'],
        ['游戏豆', '批发销售', '采购、消耗'],
        ['收银', '不参与', '自有收银系统'],
        ['会员', '不参与', '自有会员系统'],
        ['定价', '不参与', '自主定价'],
        ['营销', '小程序获客、体验券发放', '核销体验券、到店转化'],
        ['数据', '小程序用户数据、豆账户', '自有经营数据'],
    ]
)

add_para('核心原则：平台不碰商家的收银和会员，商家不碰平台的用户和豆账户。', bold=True)

# ===== 三、方案概述 =====
add_heading('三、营销方案概述', level=1)

add_heading('3.1 目标', level=2)
add_para('平台通过小程序获客，用体验券驱动玩家到店，帮商家引流，间接拉动游戏豆消耗。')

add_heading('3.2 核心闭环', level=2)
add_code_block(
    '平台投放广告 → 玩家进入小程序注册\n'
    '    → 做任务攒积分 → 兑换体验券\n'
    '    → 带券到店 → 商家微信扫码核销\n'
    '    → 玩家免费玩一局 → 平台补偿商家游戏豆\n'
    '    → 玩家体验好 → 下次自费来 → 商家获得回头客\n'
    '    → 玩家分享/邀请 → 拉新 → 循环'
)

add_heading('3.3 关键特征', level=2)
add_bullet('不需要在店里放任何码')
add_bullet('不需要机器配合')
add_bullet('不需要对接商家系统')
add_bullet('商家只需微信扫一扫')
add_bullet('全部验证在线上完成')
add_bullet('全部正向激励，没有评价、打分、差评')

# ===== 四、小程序功能 =====
add_heading('四、小程序功能设计', level=1)

add_heading('4.1 首页 — 任务墙', level=2)
add_para('玩家进入小程序看到任务列表，每个任务标注积分奖励，引导玩家完成任务攒积分。')
add_para('设计原则：', bold=True)
add_bullet('所有任务平台自己能验证，不依赖线下')
add_bullet('全部正向激励，没有评价、打分、差评')
add_bullet('任务简单，门槛低，新用户快速拿到第一张体验券')

add_heading('4.2 积分钱包', level=2)
add_bullet('当前积分余额')
add_bullet('积分获取记录（时间、任务、积分）')
add_bullet('积分消耗记录（时间、兑换内容）')
add_bullet('积分规则说明')

add_heading('4.3 体验券', level=2)
add_bullet('当前可用体验券数量')
add_bullet('体验券二维码（点击"使用"生成一次性码）')
add_bullet('可用店铺列表（文字+地址，非地图）')
add_bullet('使用记录（何时在哪家店核销）')
add_bullet('体验券规则说明（有效期、适用店铺、使用时段限制）')

add_heading('4.4 邀请有礼', level=2)
add_bullet('生成专属邀请海报/链接（带小程序码）')
add_bullet('已邀请人数、已注册人数')
add_bullet('邀请奖励记录')

add_heading('4.5 个人中心', level=2)
add_bullet('昵称、头像、城市')
add_bullet('积分余额')
add_bullet('体验券数量')
add_bullet('邀请人数')
add_bullet('注册时间、签到天数')

add_heading('4.6 可用店铺列表', level=2)
add_bullet('展示参与体验券活动的店铺')
add_bullet('每家店：店名、地址、营业时间、游戏列表（选填）、店铺图片（选填）')
add_bullet('玩家通过列表了解去哪家店，不需要地图')
add_bullet('后期参与商家多了（单城市 20 家以上）再考虑做 LBS 地图')

# ===== 五、积分体系 =====
add_heading('五、积分体系', level=1)

add_heading('5.1 获取规则', level=2)
add_table(
    ['行为', '积分', '说明'],
    [
        ['注册', '赠 1 张体验券', '不发积分，直接发券，降低新用户门槛'],
        ['每日签到', '+5', '连续签到 7 天额外 +20'],
        ['分享店铺', '+20', '每日限 1 次'],
        ['邀请好友注册', '+50', '好友注册成功后到账'],
        ['看游戏介绍', '+10', '每款游戏限 1 次'],
        ['完善资料', '+10', '一次性'],
    ]
)

add_heading('5.2 消耗规则', level=2)
add_table(
    ['兑换项', '积分', '说明'],
    [
        ['体验券（通用）', '200 积分', '免费玩一局，到店核销'],
        ['体验券（工作日）', '120 积分', '限工作日使用，帮商家填闲时'],
    ]
)

add_heading('5.3 积分有效期', level=2)
add_bullet('积分自然年内有效，年底清零')
add_bullet('体验券领取后 30 天有效')
add_bullet('促使玩家及时使用，不囤积')

# ===== 六、体验券体系 =====
add_heading('六、体验券体系', level=1)

add_heading('6.1 发放渠道', level=2)
add_table(
    ['渠道', '数量', '目的'],
    [
        ['新用户注册', '1 张', '降低首次体验门槛'],
        ['积分兑换', '按积分', '留存核心手段'],
        ['平台活动', '不定', '节假日、新店开业、新游戏上线时额外发放'],
    ]
)

add_heading('6.2 体验券规则', level=2)
add_bullet('每张体验券限指定店铺使用（或通用，由平台配置）')
add_bullet('每张体验券限核销 1 次')
add_bullet('有效期 30 天')
add_bullet('可设置使用时段限制（如仅工作日、仅闲时）')
add_bullet('核销后不可退回')

add_heading('6.3 核销流程', level=2)
add_code_block(
    '1. 玩家在小程序点"使用体验券"\n'
    '2. 选择到店店铺（或通用券无需选）\n'
    '3. 生成一次性二维码（有效期 10 分钟）\n'
    '4. 到店出示二维码给商家\n'
    '5. 商家打开微信扫一扫，扫描二维码\n'
    '6. 跳转平台核销网页\n'
    '7. 网页显示：券类型、适用店铺、有效期、补偿豆数量\n'
    '8. 商家点"确认核销"\n'
    '9. 券作废，平台自动给商家豆账户补发游戏豆\n'
    '10. 玩家免费玩一局'
)

add_para('商家端要求：', bold=True)
add_bullet('只需要微信，不需要装 App')
add_bullet('不需要注册平台账号')
add_bullet('扫码后打开的是平台网页，点一个按钮即可')
add_bullet('核销记录可在平台商家后台查看')

add_heading('6.4 防刷机制', level=2)
add_bullet('每个用户同时只能有 1 张未使用的体验券')
add_bullet('体验券二维码 10 分钟过期，过期需重新生成')
add_bullet('同一用户同一店铺 7 天内最多核销 1 张')
add_bullet('邀请奖励在好友注册后才发放，防止虚假邀请')
add_bullet('积分异常增长触发风控审核')

# ===== 七、商家参与机制 =====
add_heading('七、商家参与机制', level=1)

add_heading('7.1 参与方式', level=2)
add_bullet('商家自愿参与体验券活动')
add_bullet('参与的店铺出现在小程序可用店铺列表中')
add_bullet('不参与的店铺不展示，不获得平台流量')

add_heading('7.2 商家收益', level=2)
add_table(
    ['收益', '说明'],
    [
        ['免费客流', '平台投放广告带来的新玩家'],
        ['豆补偿', '每核销 1 张体验券，平台补偿对应游戏豆'],
        ['闲时填充', '工作日体验券帮商家提升闲时利用率'],
        ['零成本', '不需要装系统、不需要放码、不需要对接'],
    ]
)

add_heading('7.3 商家准入条件', level=2)
add_bullet('已采购平台机器')
add_bullet('游戏豆账户余额充足')
add_bullet('填写店铺信息（店名、地址、营业时间、游戏列表、店铺图片）')
add_bullet('同意体验券核销规则')

add_heading('7.4 商家后台（平台提供）', level=2)
add_para('平台给商家开一个简单 Web 后台（手机号登录）：')
add_bullet('店铺信息管理（编辑店名、地址、营业时间、游戏列表、店铺图片）')
add_bullet('体验券核销记录（时间、券号、补偿豆数）')
add_bullet('游戏豆余额和消耗记录')
add_bullet('可设置：是否参与体验券活动、体验券使用时段限制')

# ===== 八、平台获客策略 =====
add_heading('八、平台获客策略', level=1)
add_para('由于店里没有任何平台触点，平台必须主动往外获客。')

add_heading('8.1 广告投放', level=2)
add_table(
    ['渠道', '内容', '目标人群'],
    [
        ['抖音', '"免费体验 VR 游戏"短视频 + 信息流广告', '泛娱乐用户'],
        ['小红书', '"周末去哪玩 VR"种草笔记', '年轻女性、情侣'],
        ['微信朋友圈广告', 'LBS 定向，附近 5km', '本地用户'],
        ['美团/大众点评', '店铺入驻或合作', '搜索意图用户'],
    ]
)

add_heading('8.2 内容运营', level=2)
add_bullet('小程序内做"VR 游戏库"：每款游戏介绍、适合人群、时长、难度')
add_bullet('运营公众号/视频号：VR 游戏评测、新游戏上线、店铺探店')
add_bullet('让小程序本身有内容价值，玩家主动来用')

add_heading('8.3 裂变获客', level=2)
add_bullet('邀请有礼：邀请好友注册，双方各得 50 积分')
add_bullet('分享店铺：分享到朋友圈得 20 积分')
add_bullet('体验券自带裂变：玩家到店体验后，商家引导"扫码领你的体验券"（可选，商家自愿）')

add_heading('8.4 合作获客', level=2)
add_bullet('和本地生活号合作推广')
add_bullet('和学校社团、企业团建渠道合作')
add_bullet('新店开业时平台集中投放该区域广告')

# ===== 九、系统架构 =====
add_heading('九、系统架构', level=1)

add_heading('9.1 需要新建的系统', level=2)
add_table(
    ['系统', '说明', '技术建议'],
    [
        ['玩家小程序', '任务墙、积分钱包、体验券、可用店铺列表、邀请', '微信小程序 + 云开发或后端 API'],
        ['核销网页', '商家扫码打开，确认核销', 'H5 页面，无需登录，扫码即用'],
        ['商家后台', '店铺信息管理、核销记录、豆账户', 'Web 后台（可复用现有 admin-dashboard）'],
        ['平台后台', '任务管理、体验券发放、广告投放管理、数据看板', 'Web 后台（复用现有 admin-dashboard）'],
        ['后端 API', '用户、积分、体验券、店铺、豆账户、核销', '云函数或独立后端服务'],
    ]
)

add_heading('9.2 复用现有系统', level=2)
add_table(
    ['现有系统', '复用方式'],
    [
        ['admin-dashboard', '新增"营销管理"模块（任务配置、体验券管理、数据看板）+ "商家管理"模块（店铺信息、豆账户）'],
        ['游戏豆账户体系', '已有，商家采购豆的流程不变，新增"体验券核销补偿豆"的自动入账'],
        ['机器管理', '不变，机器销售流程保留'],
    ]
)

add_heading('9.3 逐步废弃的系统', level=2)
add_table(
    ['系统', '处理'],
    [
        ['cashier-ui（收银台）', '商家不再使用，可保留给直营店或下线'],
        ['分账管理（SettlementManage）', '简化为游戏豆采购记录'],
        ['结算配置（SettlementConfig）', '简化为游戏豆批发价/折扣配置'],
        ['拉卡拉分账对接', '不再需要'],
    ]
)

# ===== 十、成本分析 =====
add_heading('十、成本分析', level=1)

add_heading('10.1 平台成本', level=2)
add_table(
    ['项目', '成本类型', '说明'],
    [
        ['体验券豆补偿', '虚拟成本', '游戏豆是虚拟货币，边际成本接近零'],
        ['广告投放', '真金白银', '抖音/小红书/微信广告费，主要支出'],
        ['小程序开发', '一次性', '开发成本'],
        ['后端服务', '持续', '服务器、云函数费用'],
        ['运营人力', '持续', '内容运营、广告优化、商家沟通'],
    ]
)

add_heading('10.2 收入来源', level=2)
add_table(
    ['项目', '说明'],
    [
        ['游戏豆批发', '商家采购游戏豆，核心收入'],
        ['机器销售', '一次性收入'],
        ['广告位', '小程序可用店铺列表可做付费排名（后期）'],
    ]
)

add_heading('10.3 ROI 逻辑', level=2)
add_code_block(
    '平台投放广告 → 获客成本 X 元/人\n'
    '    → 玩家到店核销体验券 → 平台补偿豆（虚拟成本 ≈ 0）\n'
    '    → 玩家体验后自费再来 → 商家消耗更多豆 → 商家采购更多豆\n'
    '    → 平台收入 = 豆批发利润\n'
    '    → 当 豆批发利润 > 广告获客成本 时，模型成立'
)

# ===== 十一、落地路径 =====
add_heading('十一、落地路径', level=1)

add_heading('第一阶段：最小可用（MVP）', level=2)
add_para('目标：跑通"注册 → 领券 → 到店核销 → 补偿豆"闭环', bold=True)
add_bullet('开发小程序基础版：注册、任务墙（签到 + 分享 + 邀请）、体验券、可用店铺列表')
add_bullet('开发核销网页：商家扫码核销')
add_bullet('admin-dashboard 新增：商家管理（店铺信息、豆账户）、体验券管理')
add_bullet('选择 3-5 家合作商家试点')
add_bullet('小范围广告投放验证获客成本')

add_heading('第二阶段：完善运营', level=2)
add_para('目标：扩大规模，优化转化', bold=True)
add_bullet('完善任务体系（看游戏介绍、完善资料等）')
add_bullet('上线商家后台（店铺信息自助管理）')
add_bullet('增加裂变功能（邀请海报、分享有礼）')
add_bullet('扩大广告投放，优化 ROI')
add_bullet('接入更多商家')

add_heading('第三阶段：生态化', level=2)
add_para('目标：小程序成为 VR 行业流量入口', bold=True)
add_bullet('VR 游戏库内容运营（游戏评测、推荐）')
add_bullet('LBS 店铺地图（参与商家多了再做）')
add_bullet('店铺付费排名/广告位')
add_bullet('数据看板（商家经营分析、平台营销效果）')
add_bullet('跨城市扩张')

# ===== 十二、风险与应对 =====
add_heading('十二、风险与应对', level=1)
add_table(
    ['风险', '应对'],
    [
        ['玩家领券后不到店', '体验券设有效期，过期自动作废；广告投放精准定向'],
        ['商家不愿意扫码核销', '强调零成本 + 免费豆补偿；只在参与商家中投放广告'],
        ['玩家刷积分', '每人同时限 1 张体验券；邀请奖励在好友注册后发放；异常行为风控'],
        ['广告获客成本过高', '先小范围测试，找到成本最低的渠道后放量'],
        ['商家自建小程序竞争', '平台优势是跨店通用 + 广告投放能力，单店做不了'],
        ['体验券玩家占用高峰时段', '设置工作日券/闲时券，积分兑换价格不同'],
    ]
)

# ===== 十三、总结 =====
add_heading('十三、总结', level=1)
add_para(
    '核心思路：平台用广告获客，用体验券驱动到店，用虚拟豆补偿商家，'
    '用裂变降低获客成本，最终靠豆批发利润覆盖成本。',
    bold=True
)
doc.add_paragraph()
add_para('平台与商家之间只有两笔交易：')
add_bullet('1. 买机器（一次性）')
add_bullet('2. 买游戏豆（持续采购）')
add_para('营销方案不改变这两笔交易的结构，而是通过引流让第二笔交易量变大。')

# ===== 保存 =====
output_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '非加盟模式营销方案-v1.0.docx'
)
doc.save(output_path)
print(f'文档已生成：{output_path}')
