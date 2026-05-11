# 头号空间系统 - 后端 API 服务

VR 体验馆管理系统后端服务，提供 RESTful API 接口。

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式启动（热重载）
npm run dev

# 生产构建
npm run build && npm start
```

服务启动后：
- **API 服务**: `http://localhost:3000`
- **Swagger 接口文档**: `http://localhost:3000/api-docs`
- **健康检查**: `http://localhost:3000/api/health`
- **Swagger JSON**: `http://localhost:3000/api-docs/swagger.json`

## 系统模块

| 模块 | API前缀 | 里程碑 | 接口数 |
|------|---------|--------|--------|
| 认证管理 | `/api/auth` | 1期 | 5 |
| 总运营后台 | `/api/platform` | 1~3期 | ~90 |
| 店铺管理 | `/api/shop` | 1~3期 | ~80 |
| 代理商系统 | `/api/agent` | 1~2期 | ~12 |
| PC点播系统 | `/api/pc` | 1期 | ~25 |
| 小程序 | `/api/mini` | 1~2期 | ~14 |
| 电脑端收银系统 | `/api/cashier` | 待定 | ~13 |

## 认证方式

所有受保护接口需要在 Header 中携带 JWT Token：

```
Authorization: Bearer <your_token>
```

### 测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| `admin` | `123456` | 总运营后台 |
| `shop` | `123456` | 店铺管理 |
| `agent` | `123456` | 代理商系统 |

## 里程碑开发优先级

```
1期 ⭐ (最优先) → 2期 🟡 (次优先) → 3期 🟦 (后续迭代) → 待定 ⬜
```

## 项目结构

```
backend/
├── src/
│   ├── index.ts          # 入口文件 + Swagger配置
│   ├── config.ts         # 配置管理
│   ├── types.ts          # 所有类型定义
│   ├── middleware.ts      # 认证/权限/错误处理
│   ├── store.ts          # 内存数据存储 + 种子数据
│   └── routes/
│       ├── auth.ts       # 认证接口
│       ├── platform.ts   # 总运营后台接口
│       ├── shop.ts       # 店铺管理接口
│       ├── agent.ts      # 代理商系统接口
│       ├── pc.ts         # PC点播系统接口
│       ├── mini.ts       # 小程序接口
│       └── cashier.ts    # 收银系统接口
├── docs/                 # 接口文档
├── package.json
└── tsconfig.json
```

## 后续接入真实数据库

当前使用内存数据存储（`store.ts`），如需接入真实数据库：

1. 安装 ORM（如 Prisma/TypeORM）
2. 创建数据库迁移文件
3. 替换 `store.ts` 中对应的 CRUD 方法
4. 接口层无需修改，适配器模式保证兼容
