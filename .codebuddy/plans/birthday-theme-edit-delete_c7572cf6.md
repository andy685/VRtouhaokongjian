---
name: birthday-theme-edit-delete
overview: 给生日会主题资源页面的「通用配置管控」Tab 列表添加编辑和删除按钮
todos:
  - id: add-general-edit-state
    content: 添加 editingGeneralId 状态和 openGeneralEdit/openGeneralAdd 函数
    status: completed
  - id: update-general-modal
    content: 修改通用资源弹窗标题为动态、确认按钮文字动态切换
    status: completed
    dependencies:
      - add-general-edit-state
  - id: refactor-general-submit
    content: 重构 handleGeneralSubmit 支持编辑模式（更新已有数据）
    status: completed
    dependencies:
      - update-general-modal
  - id: add-general-delete
    content: 新增 handleGeneralDelete 函数和操作列（编辑/删除按钮）
    status: completed
    dependencies:
      - refactor-general-submit
---

## 功能概述

为生日会主题资源管理页面（/platform/birthday-theme）的「通用配置管控」Tab 增加「编辑」和「删除」功能。

该页面有两个 Tab：

- **Tab 1（通用配置管控）**：当前列表缺少操作列，不支持编辑和删除
- **Tab 2（小寿星专属资源）**：已有完整的编辑/删除功能

需要为 Tab 1 补齐编辑和删除操作，复用 Tab 2 已有的实现模式。

## 核心功能

1. 通用配置管控列表增加「操作」列，包含「编辑」和「删除」按钮
2. 单击编辑按钮打开已有弹窗（回填数据），支持修改主题、顺序、素材类型、素材名称、上传文件
3. 单击删除按钮直接删除该行数据

## 技术方案

### 技术栈

- 本项目现有技术栈：Vue 3 + TypeScript + Naive UI
- 不引入新依赖

### 实现方式

参考 Tab 2「小寿星专属资源」已有的编辑/删除模式进行实现：

1. **新增 `editingGeneralId` 状态**：用于标识当前编辑的通用资源 ID，值为 `null` 时表示新增模式（类似 `editingExclusiveId`）
2. **新增 `openGeneralEdit()` 函数**：接收一行数据，回填表单并打开弹窗（参考 `openExclusiveEdit`）
3. **修改 `showGeneralModal` 弹窗**：弹窗标题改为动态 `editingGeneralId ? '编辑通用资源' : '新增通用资源'`，确认按钮文字动态切换
4. **重构 `handleGeneralSubmit()` 函数**：增加 `editingGeneralId` 分支，编辑模式下更新已有数据而不是新增
5. **新增 `handleGeneralDelete()` 函数**：按 id 过滤删除数据
6. **新增操作列**：在 `generalColumns` 末尾添加 `{ title: '操作', key: 'actions', ... }`，渲染编辑和删除按钮

### 文件改动

仅修改一个文件：`/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/admin-dashboard/src/views/platform/BirthdayThemeResource.vue`

### 设计要点

- 编辑弹窗复用已有的新增弹窗组件和表单验证规则
- 编辑时表单回填主题、顺序、素材类型、素材名称等字段
- 删除前无确认弹窗（与 Tab 2 的删除行为一致，均为直接删除）