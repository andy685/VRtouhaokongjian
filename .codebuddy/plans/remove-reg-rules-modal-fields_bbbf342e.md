---
name: remove-reg-rules-modal-fields
overview: 在「注册规则设置」弹窗中移除「注册方式」和「必填信息」两个表单项，保留注册赠送等其余内容。涉及平台端 StoreList.vue 和商家端 ShopStoreList.vue 两个文件。
todos:
  - id: remove-platform-form-items
    content: 删除 platform/StoreList.vue 中注册方式和必填信息的 form-item 并清理 import
    status: completed
  - id: remove-shop-form-items
    content: 删除 shop/ShopStoreList.vue 中注册方式和必填信息的 form-item 并清理 import
    status: completed
---

## 产品概述

移除"注册规则设置"弹窗中红框标注的两个区域：

1. **注册方式** — 手机号注册 / 微信授权注册 / 两者皆可（RadioGroup）
2. **必填信息** — 真实姓名 / 生日 / 性别（CheckboxGroup）

弹窗剩余内容（注册赠送开关、赠送游戏币、赠送预存款、保存/取消按钮）保持不变。

## 核心功能

- 在两个文件中各删除两段 form-item 模板代码
- 清理对应的 script 中不再使用的 import（NRadioGroup, NRadio, NCheckboxGroup, NCheckbox）

## 技术方案

- 直接在两个 Vue 文件的模板中删除对应 form-item 块
- 清理未使用的组件 import
- 无需改动数据模型或提交逻辑

## 涉及文件

| 文件 | 改动 |
| --- | --- |
| `admin-dashboard/src/views/platform/StoreList.vue` | 删除注册方式+必填信息两个 form-item，清理 import |
| `admin-dashboard/src/views/shop/ShopStoreList.vue` | 同上 |