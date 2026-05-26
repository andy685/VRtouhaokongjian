---
name: merchant-table-to-last-month
overview: 商家管理页表格列「本月营收」改为「上月营收」，数据源从 monthRevenue 改为 lastMonthRevenue
todos:
  - id: change-table-column
    content: 将 MerchantList.vue 第301行表格列 title 改为「上月营收」、key 和 render 改为 lastMonthRevenue
    status: completed
  - id: change-detail-modal
    content: 将 MerchantList.vue 第193行详情弹窗 label 改为「上月营收」、值改为 currentMerchant.lastMonthRevenue
    status: completed
    dependencies:
      - change-table-column
---

将 /platform/merchants 商家管理页面的两处「本月营收」改为「上月营收」，保持与统计卡口径一致（统计卡已为「上月营收」）。

修改位置：

1. **表格列**（第301行）：标题从「本月营收」改为「上月营收」，数据字段从 `monthRevenue` 改为 `lastMonthRevenue`
2. **详情弹窗**（第193行）：标签从「本月营收」改为「上月营收」，绑定值从 `currentMerchant.monthRevenue` 改为 `currentMerchant.lastMonthRevenue`

涉及文件：仅 `MerchantList.vue` 一个文件。`lastMonthRevenue` 字段在 mock 数据、computed 属性和 `handleAdd` 中均已存在，无需额外处理。

## 技术方案

### 技术选型

- 复用项目现有技术栈：Vue 3 + TypeScript + Naive UI
- 不引入新依赖

### 实现方式

在 `MerchantList.vue` 中修改两处：

1. `columns` 数组中第301行的 title、key 和 render 回调的字段名
2. 详情弹窗 `n-descriptions-item` 的 label 和模板插值表达式

### 注意事项

- 改动极小，仅涉及一个文件的两行代码
- 无需修改其他文件或配置
- `lastMonthRevenue` 已在所有 mock 数据、computed、handleAdd 中存在，零新增代码