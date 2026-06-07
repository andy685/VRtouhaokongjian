# 小程序扫码支付流程 (MiniPayFlow)

VR 点播终端 → 微信小程序扫码 → 支付确认 → 扣费成功的完整支付流程 UI 组件。

## 设计原则

- **深色沉浸式主题**：`#0b1622` 深海蓝背景 + 网格纹理
- **小票式卡片**：白色收货单卡片，带蓝色槽口条 (slot bar)
- **明细/汇总视觉分级**：明细行 13px/700gray · 汇总行 14px/800 · 应付合计 20px/900blue
- **支付明细 & 资产预览**：绿色支付标题 + 划线前后的资产变化

## 页面状态机

```
loading → confirm → processing → success
                    ↘ processing → failed → retry → confirm
```

| 状态 | 描述 | 关键 UI |
|------|------|---------|
| `loading` | 加载订单信息 | 旋转环 + "正在加载订单信息…" |
| `confirm` | 订单确认页 | 门店标签 · 商品明细 · 费用汇总 · 支付方式 · 资产预览 · 确认按钮 |
| `processing` | 支付处理中 | SVG 旋转环 · 支付金额大字 |
| `success` | 支付成功 | 绿色✓图标 · 完整小票 · 完成/查看订单 |
| `failed` | 支付失败/超时 | 红色✕图标 · 错误原因 · 重试/返回 |

## 快速预览

```bash
cd miniapp-payment
npm install
npm run dev
# → http://localhost:9528
```

## Props（主组件 `MiniPayFlow.vue`）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `state` | string | `'loading'` | 当前状态 |
| `storeName` | string | `'头号空间 VR体验馆'` | 门店名称 |
| `items` | Array | `[]` | 订单明细 `[{label, subvalue?, value}]` |
| `summaryRows` | Array | `[]` | 费用汇总 `[{label, value, isSummary?, isGrandTotal?, isDiscount?}]` |
| `paymentBreakdown` | Array | `[]` | 支付拆分 `[{label, value, isDiscount?, isPayment?}]` |
| `assetPreview` | Array | `[]` | 资产变化 `[{label, before, after}]` |
| `grandTotal` | string | `'0.00'` | 应付总计金额 |
| `subtitle` | string | `'本次支付如下'` | 成功页副标题 |
| `failTitle` | string | `'支付失败'` | 失败标题 |
| `failReason` | string | | 失败原因 |
| `retryLabel` | string | `'重新支付'` | 重试按钮文案 |

## Events

| Event | 触发时机 |
|-------|---------|
| `@confirm` | 用户点击「确认并支付」 |
| `@cancel` | 用户点击「取消」或「返回」 |
| `@retry` | 用户点击「重新支付」 |
| `@done` | 支付成功点击「完成」 |
| `@viewOrder` | 支付成功点击「查看订单」 |

## 使用示例

```vue
<template>
  <MiniPayFlow
    :state="payState"
    :store-name="store.name"
    :items="orderItems"
    :summary-rows="summary"
    :payment-breakdown="breakdown"
    :asset-preview="assets"
    :grand-total="total"
    @confirm="onConfirm"
    @cancel="onCancel"
    @retry="onRetry"
    @done="onDone"
  />
</template>

<script setup>
import MiniPayFlow from './MiniPayFlow.vue'
// ...
</script>
```

## 设计 Token

| Token | 值 | 用途 |
|-------|-----|------|
| Shell BG | `#0b1622` | 页面背景 |
| Card BG | `#ffffff` | 小票卡片 |
| Primary | `#1a92ff` | 主按钮 / 强调色 |
| Glow | `#67d4ff` | 发光高亮 |
| Green | `#059669` | 支付明细 / 图标 |
| Red | `#dc2626` | 失败图标 / 扣除值 |
| Text Primary | `#050505` | 金额主文字 |
| Text Secondary | `#6b7280` | 标签文字 |
| Text Tertiary | `#9ca3af` | 辅助文字 |
