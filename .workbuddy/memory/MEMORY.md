# 项目长期备忘（VRtouhaokongjian）

## admin-dashboard 路由约定（重要）
admin-dashboard 是一个「官网 + 多后台」合一的前端工程，根路径不是后台：
- `/` → 官网下载落地页（标题写死「头号空间 - 客户端下载」），**不是管理后台**。
- `/login` → 登录页。
- `/platform` → 总运营后台（平台超管），进入后跳 `/platform/dashboard`。
- `/shop` → 商家后台；`/cp` → 供应商后台；`/agent` → 代理商后台。

> 用户要「管理后台」时，应给 `/platform`（或先去 `/login`）。

## 启动方式
- 开发服务器：`npm run dev`（在 admin-dashboard 目录），端口 **9527**。
- Vercel 部署主入口 outputDirectory = admin-dashboard/dist。
- 启动前要确认 9527 端口无残留旧进程（曾出现双进程同端口导致响应混乱）。

## 子应用
- admin-dashboard：Vue3+TS+Naive UI+ECharts+Pinia（主应用）。
- cashier-ui：Vue3+Element Plus（收银台，`/cashier` 路径部署）。
- miniapp-payment：Vue3 轻量小程序支付。
- cashier-system：仅含空 src，无后端代码（纯前端 monorepo）。

## 游戏标签（game.tags）展示位置与数据一致性
游戏标签是游戏对象上的 `tags` 数组（如 ['刺激','热门','全年龄']），展示/编辑位置：
- 后台：`platform/GameLibrary.vue` — 标签**仅在列表(list)模式展示**，瀑布流(waterfall)模式不渲染标签（避免标签行有无/多少导致卡片高低错位）；`platform/GameDetail.vue`（162-165 编辑）、`cp/GameEdit.vue`（154-157 CP编辑）。
- 收银台前端：`cashier-ui/src/views/sale/SaleView.vue`（812+ 售卖页商品详情「标签」行）、`cashier-ui/src/views/member/MemberDeductView.vue`（405+ 会员扣费页商品详情「标签」行）。
- 不展示：miniapp-payment（无）、Home.vue 官网下载页（仅讲概念）、cp/GameList.vue（那里 n-tag 是状态角标非 tags 字段）。

**重要坑**：收银台(cashier-ui)的游戏标签是**各自硬编码的 mock 数据**，未从后台数据源/接口读取，与后台完全独立。后台改标签不会同步到收银台；且收银台只覆盖 6 款游戏(id 1/2/3/4/6/8)，缺「恐龙王国」「音乐节VR」。若要一致需改为统一数据源。
