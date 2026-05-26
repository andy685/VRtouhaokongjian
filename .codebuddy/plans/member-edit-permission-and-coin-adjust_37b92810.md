---
name: member-edit-permission-and-coin-adjust
overview: 修改商家端 MemberEdit.vue：通用基础信息字段设为只读禁用，店铺专属字段（等级、状态）保持可编辑，游戏币由直接修改总数改为增减模式。
todos:
  - id: disable-basic-fields
    content: 禁用会员基础信息字段：为 name、phone、nickname 的 n-input 及 gender 的 n-select 添加 disabled 属性，并在上方插入只读提示条
    status: completed
  - id: redesign-points-section
    content: 重构游戏币区域：改为"当前游戏币(只读) + 增减类型(radio) + 调整数量(input) + 结果预览"的增减模式，新增 pointAdjustType 和 pointAdjustAmount 两个 formData 字段
    status: completed
  - id: update-validation-and-save
    content: 更新校验规则（移除 phone/gender 必填，保留 level 必填）和 handleSave 逻辑（根据增减参数计算最终游戏币值）
    status: completed
    dependencies:
      - disable-basic-fields
      - redesign-points-section
---

## 用户需求

修改商家端会员编辑页面 `/shop/member-edit`（`admin-dashboard/src/views/shop/MemberEdit.vue`），使商家只能修改与其店铺相关的会员字段。

## 核心改动

1. **会员基础信息只读**：姓名、手机号、昵称、性别为全局通用数据，商家不可修改，均设为 `disabled`
2. **可编辑字段保留**：会员等级、状态、备注保持可编辑
3. **游戏币改为增减模式**：不再直接修改游戏币总数，改为选择"增加/减少"操作 + 输入调整数量，当前游戏币数值只读展示
4. **校验规则同步**：移除 phone、gender 的必填校验，仅保留 level 必填
5. **视觉提示**：为只读字段区添加轻量分隔提示，说明基础信息为全局通用

## 技术方案

- **框架**：Vue3 + TypeScript + Naive UI
- **目标文件**：`admin-dashboard/src/views/shop/MemberEdit.vue`（单文件修改）

## 实现要点

### 1. 基础信息字段禁用（模板层）

对 name、phone、nickname、gender 四个字段的 `n-input` / `n-select` 组件添加 `disabled` 属性。同时在这些字段上方插入一条浅色提示条，内容为"以下为基础信息，全局通用，不可修改"。

### 2. 游戏币增减模式（模板 + 数据层）

将原有的单一 `n-input-number` 替换为：

- 当前游戏币：`n-input-number` 只读显示（disabled）
- 操作类型：`n-radio-group` 选择"增加"或"减少"
- 调整数量：`n-input-number` 输入调整值
- 结果预览：实时显示计算后的结果

formData 新增两个字段：

```typescript
pointAdjustType: 'add' | 'deduct'   // 增减类型
pointAdjustAmount: number             // 调整数量
```

### 3. 校验规则更新

- 删除 `phone` 和 `gender` 的校验规则
- 保留 `level` 的必填校验

### 4. handleSave 更新

保存时根据 `pointAdjustType` 和 `pointAdjustAmount` 计算最终游戏币值，不再直接使用 `formData.points`。