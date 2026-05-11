import express from 'express'
import cors from 'cors'
import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { config } from './config'
import { errorHandler } from './middleware'
import authRoutes from './routes/auth'
import platformRoutes from './routes/platform'
import shopRoutes from './routes/shop'
import agentRoutes from './routes/agent'
import pcRoutes from './routes/pc'
import miniRoutes from './routes/mini'
import cashierRoutes from './routes/cashier'

const app = express()

// ===== 中间件 =====
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ===== Swagger 配置 =====
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: '头号空间系统 API 接口文档',
      version: '1.0.0',
      description: `
# 头号空间 VR 体验馆管理系统

## 系统架构
本系统包含以下子系统和终端：
1. **总运营后台** - 平台超管运营管理
2. **店铺管理** - 商家门店运营管理
3. **代理商系统** - 代理商运营管理
4. **PC 点播系统** - VR头显点播终端
5. **小程序** - 微信小程序用户端
6. **电脑端收银系统** - 门店收银终端
7. **基础设施** - 认证、支付、分账等基础服务

## 里程碑说明
- ⭐ **1期** - 最优先开发（绿色标记）
- 🟡 **2期** - 次优先（黄色标记）  
- 🟦 **3期** - 后续迭代（蓝色标记）
- ⬜ **待定** - 待确认需求（灰色标记）

## 认证方式
所有受保护的接口需要在 Header 中携带：
\`\`\`
Authorization: Bearer <你的Token>
\`\`\`

测试账号：
- \`admin/123456\` → 总运营后台
- \`shop/123456\` → 店铺管理
- \`agent/123456\` → 代理商系统
      `,
      contact: { name: '头号空间开发团队' },
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: '本地开发环境' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info { margin: 20px 0 }',
  customSiteTitle: '头号空间系统 API 文档',
}))

// 提供 swagger.json 下载
app.get('/api/swagger.json', (_req, res) => {
  res.json(swaggerSpec)
})

// ===== 注册路由 =====
app.use('/api/auth', authRoutes)
app.use('/api/platform', platformRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/pc', pcRoutes)
app.use('/api/mini', miniRoutes)
app.use('/api/cashier', cashierRoutes)

// ===== 健康检查 =====
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, message: 'ok', timestamp: new Date().toISOString() })
})

// ===== 错误处理 =====
app.use(errorHandler)

// ===== 启动服务 =====
app.listen(config.port, () => {
  console.log('═══════════════════════════════════════════')
  console.log('  头号空间系统  API 服务已启动')
  console.log(`  端口: ${config.port}`)
  console.log(`  接口文档: http://localhost:${config.port}/api-docs`)
  console.log(`  健康检查: http://localhost:${config.port}/api/health`)
  console.log('═══════════════════════════════════════════')
})

export default app
