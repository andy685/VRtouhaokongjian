# VR头号空间 - GitHub 推送与同步指南

## 一、首次推送项目到 GitHub

### 1. 在 GitHub 创建仓库

1. 打开 https://github.com/new
2. Repository name 填 `VRtouhaokongjian`
3. 选择 **Private**（私有仓库）
4. **不要**勾选 "Add a README file"、".gitignore"、"License"（保持空仓库）
5. 点击 **Create repository**
6. 记下仓库地址，格式如：`https://github.com/你的用户名/VRtouhaokongjian.git`

### 2. 本地初始化并推送

```bash
cd /Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian

# 初始化 git
git init

# 创建 .gitignore（忽略不需要上传的文件）
cat > .gitignore << 'EOF'
node_modules/
dist/
.vite/
*.local
.DS_Store
EOF

# 添加所有文件
git add .

# 首次提交
git commit -m "init: VR头号空间管理后台"

# 设置远程仓库（把"你的用户名"替换成你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/VRtouhaokongjian.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

> 如果提示登录，按指引完成 GitHub 身份验证即可。

---

## 二、在其他设备上同步项目

### 1. 首次克隆

```bash
git clone https://github.com/你的用户名/VRtouhaokongjian.git
cd VRtouhaokongjian/admin-dashboard
npm install
npm run dev -- --port 9527
```

### 2. 日常同步（每次开发前后）

```bash
# 拉取远程最新代码
git pull

# ... 进行开发 ...

# 提交并推送
git add .
git commit -m "描述你改了什么"
git push
```

---

## 三、常用 Git 命令速查

| 命令 | 说明 |
|------|------|
| `git status` | 查看当前修改状态 |
| `git add .` | 添加所有修改到暂存区 |
| `git commit -m "描述"` | 提交到本地仓库 |
| `git push` | 推送到 GitHub |
| `git pull` | 从 GitHub 拉取最新代码 |
| `git log --oneline` | 查看提交历史 |
| `git diff` | 查看具体修改内容 |

---

## 四、项目信息

- **项目路径**: `/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian`
- **管理后台**: `admin-dashboard/`
- **启动命令**: `cd admin-dashboard && npm run dev -- --port 9527`
- **访问地址**: http://localhost:9527
- **技术栈**: Vue 3 + Naive UI + Vite + TypeScript
