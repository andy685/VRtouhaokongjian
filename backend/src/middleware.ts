import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config'
import { AuthRequest, JwtPayload, ApiResponse, UserRole } from './types'

// ===== JWT 认证中间件 =====
export function authMiddleware(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供认证Token' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ code: 401, message: 'Token无效或已过期' })
  }
}

// ===== 角色权限中间件 =====
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }
    next()
  }
}

// ===== 统一错误处理 =====
export function errorHandler(err: Error, req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) {
  console.error('[Error]', err.message)
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
  })
}

// ===== 分页辅助 =====
export function paginate<T>(data: T[], page = 1, pageSize = 10) {
  const total = data.length
  const list = data.slice((page - 1) * pageSize, page * pageSize)
  return { list, total, page, pageSize }
}
