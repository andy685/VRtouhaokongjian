---
name: vr-touhaokongjian-product-design-doc
overview: 为"头号空间"VR体验店运营管理系统编写一份完整的产品设计文档，包含产品概述、商业模式、业务流程、系统架构图、各端功能详解（C端小程序、B端收银/PC终端/VR头显/商家后台、代理商系统、官方总运营后台）、技术架构、数据模型等，可直接用于技术团队执行开发。
design:
  styleKeywords:
    - Professional Documentation
    - Technical PRD
    - Architecture Diagrams
    - Business Process Flows
    - Data Modeling
  fontSystem:
    fontFamily: system-ui
    heading:
      size: 24px
      weight: 700
    subheading:
      size: 18px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#0F172A"
      - "#3B82F6"
    background:
      - "#FFFFFF"
      - "#F8FAFC"
    text:
      - "#1E293B"
      - "#64748B"
    functional:
      - "#10B981"
      - "#EF4444"
      - "#F59E0B"
todos:
  - id: write-document-skeleton
    content: 编写产品文档骨架：确定完整目录结构、章节划分、图表索引
    status: completed
  - id: write-ch1-overview
    content: 编写第1-2章：产品定位、愿景使命、目标用户画像、市场规模分析、商业模式与定价体系
    status: completed
    dependencies:
      - write-document-skeleton
  - id: write-ch2-architecture
    content: 编写第3章：系统整体架构图(6大子系统)、技术选型方案、部署架构图、数据流总览，使用code-explorer核查各子系统边界
    status: completed
    dependencies:
      - write-ch1-overview
  - id: write-ch3-subsystems
    content: 编写第4章：六大子系统(C端小程序/收银系统/PC游戏终端/VR头显/商家后台/代理商/总运营)功能结构图及功能详述，基于router/index.ts的100+路由逐项映射
    status: completed
    dependencies:
      - write-ch2-architecture
  - id: write-ch4-business-flows
    content: 编写第5章：核心业务流程图（用户消费全流程、订单流转、结算分润、会员 lifecycle、设备状态机），使用Mermaid flowchart和sequence diagram
    status: completed
    dependencies:
      - write-ch3-subsystems
  - id: write-ch5-data-model
    content: 编写第6章：数据模型设计（核心实体ERD）、RBAC权限体系（8角色完整权限矩阵）、API接口规划方向
    status: completed
    dependencies:
      - write-ch4-business-flows
  - id: write-ch6-competitive
    content: 编写第7章：竞品差异化分析（基于幻影星空对比）、实施路线图（3阶段）、风险与决策点、附录（术语表/图标说明）
    status: completed
    dependencies:
      - write-ch5-data-model
  - id: generate-pdf
    content: 使用PDF文档生成技能将完整Markdown文档转换为专业排版PDF，确保封面、目录、图表渲染正确
    status: completed
    dependencies:
      - write-ch6-competitive
---

## 产品概述

**头号空间（VR Touhao Kongjian）**是一套面向VR线下体验店的全链路SaaS运营管理系统，涵盖C端用户触达、B端门店运营、渠道代理拓展、平台总控运营四大板块。

## 核心需求

编写一份**完整的产品设计文档（PRD）**，以资深产品经理+技术专家视角撰写，内容需包含：

1. **产品定位与商业模式**：目标市场、价值主张、盈利模式（SaaS订阅+平台抽成）、定价体系
2. **系统整体架构图**：六大子系统（C端小程序、PC收银系统、PC游戏终端、VR头显终端、商家管理后台、代理商系统、官方总运营后台）的关系与交互
3. **各子系统功能结构图**：每个子系统的模块划分、页面清单、功能点详情
4. **业务流程图**：核心业务流程，包括用户到店消费全流程、订单流转流程、结算分润流程、会员生命周期流程、设备管理流程等
5. **数据模型与接口规划**：核心实体关系、关键API定义方向
6. **角色权限体系（RBAC）**：8大角色的权限矩阵
7. **技术架构方案**：前端/后端/数据库/中间件选型与部署架构
8. **竞品差异化分析**：基于幻影星空等竞品的对比优势

文档要求足够详尽，使技术团队可直接据此执行开发。

## 文档输出形式

- **输出格式**：Markdown文档（.md），后续可转换为PDF
- **输出路径**：`docs/头号空间-产品设计文档-v1.0.md`
- **图表方案**：使用Mermaid语法绘制架构图、流程图、思维导图、时序图等
- **文档规模预估**：约8000-12000字，含15-20张图表

## 技术实现策略

采用分章节递进式写作：

1. 先搭建文档骨架（目录结构）
2. 逐章填充内容，每章包含文字描述 + Mermaid图表
3. 基于已有 `docs/运营后台设计方案.md`(123KB) 提取已确认的设计决策
4. 基于路由配置(`router/index.ts`, 334行)提取完整的功能清单
5. 基于三套Layout组件提取菜单结构和交互逻辑
6. 结合用户提供的3张UI设计稿补充C端和B端细节
7. 整合竞品分析文档的差异化要点

## 关键参考源

| 参考文件 | 用途 | 信息密度 |
| --- | --- | --- |
| `router/index.ts` (334行) | 全量路由/页面清单 | 100+页面定义 |
| `PlatformLayout.vue` (21.8KB) | 总运营后台菜单/50+功能 | 完整菜单树 |
| `ShopLayout.vue` (19.5KB) | 商家后台菜单/75+功能 | 完整菜单树 |
| `AgentLayout.vue` (14.1KB) | 代理商后台菜单/13个功能 | 菜单树 |
| `运营后台设计方案.md` (123KB) | 已定案的设计决策 | 核心权威参考 |
| `内调沟通总结.md` | 竞品分析与差异点 | 商业洞察 |
| `功能差异分析-店铺运营后台.md` | 功能覆盖度矩阵 | 功能对标 |
| 3张UI设计稿(用户附件) | 收银端/小程序/PC终端 | UI/UX参考 |


## 文档设计方案

本任务产出为Markdown格式的产品设计文档，重点在于**内容的系统性、完整性和可执行性**。文档将采用专业PRD的标准结构，使用Mermaid语法嵌入各类架构图和流程图。

### 文档视觉风格

- 专业级技术文档风格，类似阿里/腾讯内部PRD规范
- 清晰的信息层级：一级标题(章节)、二级标题(模块)、三级标题(功能点)
- 表格用于展示功能矩阵、权限矩阵、字段定义
- Mermaid图表用于架构图、流程图、ER图、时序图
- 代码块用于接口示例和数据结构定义

### 核心图表规划（共15-20张）

1. 系统整体架构图（六大子系统关系）
2. 产品功能思维导图（全局）
3. C端小程序功能结构图
4. PC收银系统功能结构图
5. PC游戏终端功能结构图
6. 商家管理后台功能结构图
7. 代理商系统功能结构图
8. 总运营后台功能结构图
9. 用户到店消费业务流程图
10. 订单全生命周期流转图
11. 结算分润流程图
12. 会员生命周期流程图
13. 设备管理状态机图
14. RBAC角色权限层级图
15. 技术部署架构图
16. 数据实体关系图(ERD)
17. 竞品能力对比雷达图

## Agent Extensions

### Skill: PDF 文档生成

- **Purpose**: 将编写完成的Markdown格式产品设计文档转换为排版精美、专业级的PDF文档，确保封面、目录、页眉页脚、图表渲染等均达到交付标准
- **Expected outcome**: 产出一份可直接用于内部评审和外部技术团队执行的PDF版PRD文档

### SubAgent: code-explorer

- **Purpose**: 在文档编写过程中，对特定模块的代码实现进行深度核查，确保文档中描述的功能点与实际代码一致（如某个页面的字段列表、按钮操作、数据结构等）
- **Expected outcome**: 文档中所有功能描述均有代码依据，避免文档与实现脱节