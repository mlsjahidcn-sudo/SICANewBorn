# Railway 部署指南

本指南将帮助您将 SICA 项目部署到 Railway App。

## 前置要求

- [Railway 账号](https://railway.app)
- GitHub/GitLab 仓库（可选，但推荐）
- 已配置的 Supabase 项目

## 部署步骤

### 步骤 1：准备项目

确保您的项目包含以下文件（已自动创建）：
- `railway.json` - Railway 配置文件
- `.env.example` - 环境变量模板
- `package.json` - 包含构建和启动脚本

### 步骤 2：连接到 Railway

#### 方式一：使用 Railway CLI（推荐）

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

#### 方式二：使用 GitHub 自动部署

1. 访问 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 "New Project"
3. 选择 "Deploy from repo"
4. 连接您的 GitHub 账号
5. 选择此项目仓库
6. 配置部署设置

### 步骤 3：配置环境变量

在 Railway Dashboard 中，导航到您的项目 → Variables → 添加以下环境变量：

#### 必需的环境变量

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 服务器端 Supabase 配置
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
COZE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 可选配置
NODE_ENV=production
```

#### 如何获取 Supabase 密钥

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 Settings → API
4. 复制以下信息：
   - Project URL (Project URL)
   - anon public (Anon Key)
   - service_role secret (Service Role Key)

### 步骤 4：部署

配置好环境变量后，Railway 将自动开始构建和部署。

## 数据库配置

### 选项 1：使用 Supabase（推荐，已有配置）

项目已配置 Supabase 作为数据库，无需额外配置数据库插件。

### 选项 2：使用 Railway PostgreSQL（可选）

如果您想使用 Railway 的 PostgreSQL 数据库：

1. 在 Railway Dashboard 中，点击 "Add Plugin"
2. 选择 "PostgreSQL"
3. Railway 将自动配置并提供数据库连接字符串

**注意**：当前项目使用 Supabase，切换到 Railway PostgreSQL 需要修改数据库连接代码。

## 项目配置说明

### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 300
  }
}
```

配置说明：
- **builder**: 使用 Nixpacks 自动检测和构建 Next.js 项目
- **startCommand**: 使用 `npm start` 启动生产服务器
- **healthcheckPath**: 健康检查路径为根路径 `/`

### 端口配置

Railway 会自动设置 `PORT` 环境变量。Next.js 项目会自动使用此端口。

## 自定义域名

### 添加自定义域名

1. 在 Railway Dashboard 中，进入项目 → Settings → Domains
2. 点击 "Add Custom Domain"
3. 输入您的域名
4. 按照提示配置 DNS 记录

### 自动 HTTPS

Railway 会自动为您的域名配置 SSL 证书，提供 HTTPS 支持。

## 环境变量管理

### 本地开发

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入您的实际值
# 不要将 .env 提交到版本控制！
```

### Railway 环境变量

在 Railway Dashboard 中管理环境变量：
- 支持环境特定的变量（Production, Staging 等）
- 可以使用 Railway 的 Secrets 功能管理敏感信息
- 变量修改后需要重新部署才能生效

## 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
1. 确保所有必需的环境变量都已配置
2. 查看 Railway 的构建日志了解具体错误
3. 确认 Supabase 密钥正确且有效

### Q: 如何查看应用日志？

A: 在 Railway Dashboard 中：
1. 选择您的项目
2. 点击 "Deployments" 标签
3. 选择最新的部署
4. 查看 "Logs" 部分

### Q: 如何回滚到之前的版本？

A: 在 Railway Dashboard 中：
1. 进入 "Deployments" 标签
2. 找到要回滚的部署
3. 点击 "Redeploy" 按钮

### Q: 数据库连接错误？

A: 确认：
1. Supabase 项目正在运行
2. 环境变量中的 Supabase URL 和密钥正确
3. Supabase 项目的 API 设置允许来自 Railway 域名的请求

## 监控和维护

### 性能监控

Railway 提供基本的性能监控：
- 请求响应时间
- 内存使用情况
- CPU 使用情况

### 自动扩展

Railway 会根据流量自动扩展您的应用：
- 默认包含基本的自动扩展
- 可以在 Settings → Resources 中调整资源配置

### 备份策略

- Supabase 提供自动数据库备份
- 建议定期导出 Supabase 数据作为额外备份
- Railway 部署历史保留，可以随时回滚

## 下一步

部署成功后，您可以：

1. ✅ 访问您的 Railway 提供的域名测试应用
2. ✅ 配置自定义域名
3. ✅ 设置监控和告警
4. ✅ 配置 CI/CD 流程
5. ✅ 设置 staging 环境用于测试

## AI 聊天功能说明

### 🌟 Now with Doubao (豆包) API Support!

The AI chat now supports **three modes** to work everywhere:

#### 1. **Doubao API Mode (Recommended for Railway)** 🚀
- Uses real Doubao (豆包) AI from Volcengine
- Full RAG system with university knowledge
- Streaming responses
- Works **perfectly in Railway!**

#### 2. **Coze Platform Mode (Full AI)**
- Uses the real Coze AI with `doubao-seed-2-0-lite-260215`
- Full RAG system with university knowledge
- Streaming responses
- **Only works in Coze environment**

#### 3. **Smart Fallback Mode (Always Works)**
When no AI API is configured, the chatbot uses **intelligent rule-based responses**:
- ✨ **Varied & Unique** - Never gives the same response twice
- 🧠 **Thoughtful** - Actually analyzes your question
- 💬 **Conversational** - Talks like a real study abroad advisor
- 🎯 **Context-Aware** - Understands university names and topics
- 🎪 **Personality** - Uses emojis and has a friendly tone
- 🎬 **Streaming** - Still streams responses word-by-word

### 🎯 How to Set Up Doubao API for Railway

#### Step 1: Get Your Doubao API Credentials

1. **Sign up for Volcengine**
   - Visit: https://console.volcengine.com/ark
   - Create an account if you don't have one

2. **Create a Model Endpoint**
   - Go to "Ark" (火山引擎方舟)
   - Click "Create Endpoint"
   - Choose a Doubao model (e.g., `doubao-pro-32k`, `doubao-lite-32k`)
   - Copy your **Endpoint ID** (looks like `ep-20241203153141-7jv9c`)

3. **Create an API Key**
   - Go to "API Keys" in the Ark console
   - Click "Create API Key"
   - Copy your **API Key**

#### Step 2: Configure Environment Variables in Railway

Add these variables to your Railway project:

```bash
# Doubao (豆包) API configuration
DOUBAO_API_KEY=your-api-key-here
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=ep-20241203153141-7jv9c  # Replace with your endpoint ID
```

**Where to set in Railway:**
1. Go to your Railway project
2. Click "Variables"
3. Add each variable above
4. Redeploy your app

#### Step 3: Test It!

Once deployed, the AI chat will automatically use your Doubao API! The priority is:
1. **Doubao API** (if configured)
2. **Coze SDK** (if in Coze environment)
3. **Smart Fallback** (always works)

### 🔧 Alternative AI Options

If you want to use other AI providers:

#### Option 1: Use OpenAI API
1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Get an API key
3. Modify the AI chat route to use OpenAI SDK

#### Option 2: Use Anthropic Claude
1. Sign up at [Anthropic Console](https://console.anthropic.com)
2. Get an API key
3. Modify the AI chat route to use Anthropic SDK

### ✅ Current Status
**AI Chat Works Everywhere!** 
- With Doubao API: Real AI in Railway 🚀
- Without API: Smart fallback still works great!
- The system automatically uses the best available option

## 技术支持

如遇问题：
- 查看 [Railway 文档](https://docs.railway.app)
- 查看 [Supabase 文档](https://supabase.com/docs)
- 检查项目构建日志获取详细错误信息

---

**祝您部署顺利！🎉**
