# AI 店铺经营诊断报告页 — UI 设计说明（Stitch 生成用）

> 用途：交给 Stitch（或任何 AI UI 生成工具）生成报告详情页网页。
> 设计风格：Data-Dense Dashboard（数据密集型仪表盘），蓝色系。
> 对应 PRD：§4.6.4 AI 店铺经营诊断（v2.29）。

---

## 一、设计系统

### 1.1 色彩

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色 | `#1E40AF` | 标题强调、主按钮、英雄区渐变深端 |
| 主色亮 | `#3B82F6` | 链接、进度条、图表主色、英雄区渐变亮端 |
| 点缀色 | `#F59E0B` | 次级强调、琥珀段位、英雄区光斑 |
| 页面背景 | `#F8FAFC` | 页面底色（报告容器外） |
| 卡片背景 | `#FFFFFF` | 内容卡片 |
| 卡片边框 | `#E2E8F0` | 1px 边框 |
| 主文字 | `#0F172A` | 标题、数值 |
| 次级文字 | `#475569` / `#64748B` | 说明、标签 |
| 成功/绿 | `#22C55E`（底 `#ECFDF5`，边 `#BBF7D0`，字 `#15803D`） | 健康增长段位、正向趋势 |
| 警告/琥珀 | `#F59E0B`（底 `#FFFBEB`，边 `#FDE68A`，字 `#B45309`） | 稳中待升段位 |
| 危险/红 | `#EF4444`（底 `#FEF2F2`，边 `#FECACA`，字 `#B91C1C`） | 重点优化段位、负向趋势 |
| 信息/蓝 | 底 `#EFF6FF`，边 `#DBEAFE`，字 `#1E3A8A` | AI 总结引用块 |

### 1.2 字体与排版

- 字体：系统无衬线（PingFang SC / Inter / Noto Sans SC）
- 数字：`font-variant-numeric: tabular-nums`，标题数字用负字距 `-0.02em`
- 层级：页面 H1 36px / 区块 H2 20–22px / 卡片标题 16px / 正文 14px / 辅助 12–13px / 状态大字 28px

### 1.3 形状与阴影

- 卡片圆角 14px，按钮/输入 8px，胶囊 999px
- 卡片阴影：静态 `0 1px 3px rgba(15,23,42,.06)`，hover `0 10px 28px -8px rgba(30,64,175,.18)`
- 卡片内边距 24px，区块间距 16px

---

## 二、页面结构（自上而下）

```
┌─ 顶部操作栏（返回 ← ｜ 生成新版本 / 同步至商户 / 下载 ▾）
├─ 报告英雄区（深蓝渐变卡片）
├─ AI 总结（白卡）
├─ 经营健康度（状态大字卡 + 五维进度条）
├─ 核心经营指标（4 张 KPI 卡）
├─ 游戏点播数据（4 张 KPI 卡 + 热门游戏 TOP 表格）
├─ 数据依据（快照表格）
├─ 问题、机会与建议（3 栏卡片）
├─ 下期行动计划（表格）
├─ 店长补充（蓝色左边框卡）
├─ 报告版本历史（表格）
└─ 页脚（版本 · 模板 · 快照 · 由 AI 自动生成）
```

### 2.1 顶部操作栏

- 左：「← 返回报告记录」文字按钮
- 右：`生成新版本`（次级）、`同步至商户`（次级，仅未同步时显示）、`下载 ▾`（主色按钮，下拉：下载 PDF / 下载 ZIP）

### 2.2 报告英雄区

- 背景：`linear-gradient(120deg, #0B1220 0%, #1E3A8A 55%, #1E40AF 100%)`，右下角琥珀径向光斑（`radial-gradient(circle, rgba(245,158,11,.28), transparent 62%)`）
- 内容：胶囊 tag「AI 店铺经营诊断报告」（白描边半透明）→ H1「{店铺名} · {2026年8月}」（36px 白色）→ 副标题（`#BFDBFE`）→ 底部 3 格半透明信息卡：所属商家 / 数据范围 / 生成时间
- 内边距 38px，圆角 16px

### 2.3 AI 总结

- 白卡，标题「AI 总结」+ 副文案「先看本期结论与优先方向」
- 正文放浅蓝引用块（`#EFF6FF` 底、`#1E3A8A` 字、17px、行高 1.8）

### 2.4 经营健康度（核心区块）

- 区块标题「经营健康度」+ 副文案「五维经营指标综合评估结果」+ 右侧「数据截止 {时间}」
- 布局：左侧状态卡（240px 固定宽）+ 右侧五维进度条列表
- **状态卡**：居中排版，三行——小标签「经营状态」(14px) / 状态大字「健康增长」(28px, nowrap) / 说明文字「本期经营表现良好」(13px)
- **段位联动配色**（三选一）：
  - 健康增长：绿渐变底 `#ECFDF5→#F0FDF4`，边 `#BBF7D0`，字 `#15803D`
  - 稳中待升：琥珀渐变底 `#FFFBEB→#FEFCE8`，边 `#FDE68A`，字 `#B45309`
  - 重点优化：红渐变底 `#FEF2F2→#FFF1F2`，边 `#FECACA`，字 `#B91C1C`
- **五维进度条行**：`110px 维度名 ｜ 进度条 ｜ 34px 分数`；进度条高 10px 圆角胶囊，按分数着色（≥80 `#3B82F6`、70–79 `#F59E0B`、<70 `#EF4444`），轨道 `#E5E7EB`；维度名旁可带 `?` 问号 tooltip（显示数据来源说明）

### 2.5 核心经营指标（4 张 KPI 卡）

- 4 列网格，卡：`#F8FAFC` 底 + 边框，内边距 18px
- 结构：标签(13px 灰) / 数值(25px 粗，tabular-nums) / 趋势胶囊
- 趋势胶囊：正向 绿底绿字绿边，负向 红底红字红边（`+12.6%` / `-0.8%`）

### 2.6 游戏点播数据

- 上：同款 4 张 KPI 卡（点播总次数 / 点播总时长 / TOP5 游戏营收占比 / 人均游玩时长）
- 下：热门游戏 TOP 表格，列：游戏名称 ｜ 点播次数 ｜ 点播时长 ｜ 营收占比 ｜ 环比（胶囊） ｜ 表现（标签：明星=绿 / 稳定=琥珀 / 待优化=红）
- 表格无边框，行 hover 高亮，表头吸顶

### 2.7 数据依据

- 表格：数据来源 ｜ 快照时间 ｜ 覆盖内容；说明「本报告只使用已固化的数据快照，不会随源数据后续变更而改写」

### 2.8 问题、机会与建议（3 栏）

- 三张等宽卡片，编号 01/02/03（`#2563EB` 粗体）
- 主要问题：橙底 `#FFF7ED` 边 `#FED7AA`；增长机会：绿底 `#F0FDF4` 边 `#BBF7D0`；优先动作：白底
- 卡内：H3 + 正文（14px `#475569` 行高 1.7）

### 2.9 下期行动计划

- 表格列：优先级(P0 红 / P1 琥珀小标签) ｜ 行动建议 ｜ 建议负责人 ｜ 验证指标

### 2.10 店长补充

- 白卡 + 左侧 3px 蓝色边（`#60A5FA`）；无内容时显示占位说明文案

### 2.11 报告版本历史

- 表格列：版本 ｜ 生成时间 ｜ 更新类型 ｜ 更新说明 ｜ 状态（当前版本=绿 / 生成中=蓝 / 历史版本=灰） ｜ 操作（查看，当前版本禁用）
- 查看历史版本时页面顶部出现琥珀警告条「当前正在查看历史版本 vX.0，该版本只读」

### 2.12 页脚

- 居中灰色小字：`报告版本 v2.0 · 模板 月度 AI 经营诊断报告 · 数据快照 … · 由 AI 自动生成`

---

## 三、交互与动效

- 全局过渡 150–300ms；卡片 hover 阴影抬升（KPI 卡边框变 `#C7D7F8`）
- 表格行 hover 高亮；下拉/抽屉有淡入
- 状态卡不得有持续动画（仅数据加载时允许 skeleton/spinner）
- 遵循 `prefers-reduced-motion`；键盘焦点可见（`:focus-visible` 2px 蓝描边）

## 四、响应式

- ≤760px：操作栏纵向堆叠、英雄区信息卡/状态布局/KPI 网格/三栏卡片全部单列、英雄区 H1 27px、内边距收紧至 12px
- 表格在窄屏下容器内横向滚动（不溢出）

---

## 五、可直接粘贴给 Stitch 的提示词

### 英文版（推荐，Stitch 对英文响应更好）

```
Design a monthly AI business diagnostic report web page for a VR entertainment store admin platform. Style: clean data-dense dashboard, light theme, blue palette (#1E40AF primary, #3B82F6 secondary, #F59E0B amber accent), page background #F8FAFC, white cards with 14px radius and subtle shadows, sans-serif font, tabular numbers for metrics.

Page structure top to bottom:
1. Top action bar: "← Back to reports" text button on the left; "New version", "Sync to merchant" secondary buttons and a primary "Download" dropdown (PDF/ZIP) on the right.
2. Hero banner: dark blue gradient (from #0B1220 via #1E3A8A to #1E40AF) with an amber radial glow at bottom right, rounded 16px. Contains a pill tag "AI Business Diagnostic Report", large title "Futian Flagship Store · Aug 2026" (36px white), a light-blue subtitle, and a row of 3 translucent info tiles: Merchant, Data period, Generated at.
3. AI Summary card: section title "AI Summary", body text inside a light blue callout (#EFF6FF background, #1E3A8A text).
4. Health status section: left status card (240px) with small label "Status", large tier text "Healthy Growth" (28px, green gradient card #ECFDF5 with #BBF7D0 border, #15803D text) and a short description; right side a list of 5 dimension progress bars (Revenue Growth, Traffic Activity, Member Quality, Content Appeal, Operation Execution) — 10px rounded bars, blue #3B82F6 fill, each row shows name, bar, score. Bar color turns amber #F59E0B for scores 70-79 and red #EF4444 below 70. Each dimension name has a small "?" tooltip showing data source description.
5. Core metrics: 4 KPI cards in a row (Revenue ¥826,500, Orders 3,182, Avg ticket ¥259.7, Device availability 96.2%), each card shows label, big tabular number, and a trend pill (+ green pill / - red pill).
6. Game data: 4 KPI cards (Total plays, Total hours, TOP5 game revenue share, Avg session) above a top-games table with columns Game, Plays, Hours, Revenue share, Trend pill, Performance tag (Star=green, Stable=amber, Needs work=red).
7. Data sources table: Source, Snapshot time, Coverage. Note: report only uses locked data snapshots.
8. Three insight cards in a row: "Problems" (orange background #FFF7ED), "Opportunities" (green background #F0FDF4), "Priority actions" (white), each numbered 01/02/03.
9. Next-month action plan table: Priority tag (P0 red / P1 amber), Action, Owner, Target metric.
10. Manager notes card with a 3px blue left border.
11. Version history table: Version, Generated at, Update type, Note, Status tag (Current=green, Generating=blue, Archived=gray), View action.
12. Footer: centered small gray text "Report v2.0 · Template · Snapshot · Generated by AI".

Interactions: 150-300ms transitions, card hover shadow lift, table row hover highlight. Responsive: single column below 760px, tables scroll horizontally inside cards. Accessible: visible focus states, no continuous animations.
```

### 中文版

```
设计一个 VR 娱乐门店管理平台的「月度 AI 经营诊断报告」网页。风格：清爽的数据密集型仪表盘，浅色主题，蓝色系（主色 #1E40AF、辅色 #3B82F6、点缀琥珀 #F59E0B），页面底色 #F8FAFC，白色卡片 14px 圆角带柔和投影，无衬线字体，指标数字使用等宽数字。

页面自上而下：
1. 顶部操作栏：左侧「← 返回报告记录」，右侧「生成新版本」「同步至商户」次级按钮 + 主色「下载」下拉（PDF/ZIP）。
2. 报告英雄区：深蓝渐变背景（#0B1220 → #1E3A8A → #1E40AF）右下角琥珀光斑，16px 圆角；内容为胶囊标签「AI 店铺经营诊断报告」、36px 白色大标题「深圳福田旗舰店 · 2026年8月」、浅蓝副标题，以及 3 个半透明信息格（所属商家/数据范围/生成时间）。
3. AI 总结卡：浅蓝引用块（#EFF6FF 底、#1E3A8A 字）展示本期结论。
4. 经营健康度区：左侧 240px 状态卡（小标签「经营状态」+ 28px 状态大字「健康增长」+ 说明文字，绿渐变卡 #ECFDF5、边 #BBF7D0、字 #15803D），右侧 5 条维度进度条（营收增长力/客流活跃度/会员质量/内容吸引力/运营执行力），10px 圆角条蓝色填充，70-79 琥珀、<70 红；维度名带 ? tooltip 显示数据来源。
5. 核心经营指标：4 张 KPI 卡（营收 ¥826,500、订单 3,182、客单价 ¥259.7、设备可用率 96.2%），含红/绿趋势胶囊。
6. 游戏点播数据：4 张 KPI 卡（点播总次数/总时长/TOP5 游戏营收占比/人均时长）+ 热门游戏表格（游戏、点播次数、时长、营收占比、环比胶囊、表现标签：明星绿/稳定琥珀/待优化红）。
7. 数据依据表格：数据来源、快照时间、覆盖内容。
8. 三栏洞察卡：01 主要问题（橙底）、02 增长机会（绿底）、03 优先动作（白底）。
9. 下月行动计划表：优先级标签（P0 红/P1 琥珀）、行动建议、负责人、验证指标。
10. 店长补充卡：3px 蓝色左边框。
11. 报告版本历史表：版本、时间、类型、说明、状态标签（当前=绿/生成中=蓝/历史=灰）、查看操作。
12. 页脚：居中灰色小字「报告版本 · 模板 · 数据快照 · 由 AI 自动生成」。

交互：150-300ms 过渡、卡片 hover 投影抬升、表格行 hover 高亮；760px 以下单列、表格容器内横向滚动；焦点状态可见、无持续动画。
```

---

## 六、生成后自检清单

- [ ] 三种段位状态卡配色正确（绿/琥珀/红），大字是状态标签而非分数
- [ ] 五维进度条按 80/70 阈值三色
- [ ] KPI 趋势胶囊红绿区分明确
- [ ] 英雄区渐变 + 琥珀光斑呈现
- [ ] 表格窄屏容器内滚动、操作列不被挤出
- [ ] 无 emoji 图标、无持续循环动画
- [ ] 键盘 Tab 焦点可见
