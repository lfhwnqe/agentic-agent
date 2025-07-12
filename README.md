# Agentic Agent - 智能代理API服务

基于NestJS和Mastra框架构建的智能代理API服务，提供三代理协作的智能工作流。

## ✅ 已完成功能

- ✅ 接入Swagger API文档
- ✅ 解决NestJS调用agent的环境变量问题
- ✅ 三代理智能工作流集成
- ✅ 完整的配置管理系统
- ✅ API输入验证和错误处理

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env` 文件并配置您的Google API密钥：
```bash
# 编辑 .env 文件
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

### 3. 启动应用
```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

### 4. 访问API文档
应用启动后，访问以下地址：
- **API服务**: http://localhost:3000
- **Swagger文档**: http://localhost:3000/api

## 📚 API接口

### 健康检查
```bash
GET /mastra/health
```

### 智能工作流
```bash
POST /mastra/workflows/intelligent
Content-Type: application/json

{
  "userInput": "什么是人工智能？",
  "maxRetries": 3
}
```

## 🔧 配置说明

### 环境变量
| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ | - | Google Gemini API密钥 |
| `PORT` | ❌ | 3000 | 应用端口 |
| `WORKFLOW_MAX_RETRIES` | ❌ | 3 | 工作流最大重试次数 |
| `WORKFLOW_QUALITY_THRESHOLD` | ❌ | 7.0 | 质量评估通过阈值 |
| `WORKFLOW_LOG_LEVEL` | ❌ | info | 日志级别 |

### 获取Google API密钥
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 将密钥添加到 `.env` 文件中

## 🏗️ 项目结构

```
src/
├── config/                    # 配置管理
│   ├── configuration.ts       # 配置定义
│   └── config.service.ts      # 配置服务
├── modules/
│   └── mastra/                # Mastra模块
│       ├── dto/               # 数据传输对象
│       ├── mastra.controller.ts
│       ├── mastra.service.ts
│       └── mastra.module.ts
├── app.module.ts              # 主应用模块
└── main.ts                    # 应用入口
```

## 🔍 技术特性

### 1. Swagger API文档
- 完整的API文档自动生成
- 交互式API测试界面
- 请求/响应模型定义
- 参数验证说明

### 2. 环境变量管理
- 统一的配置管理服务
- 环境变量验证
- 类型安全的配置访问
- 默认值支持

### 3. 三代理协作系统
- **意图分析代理**: 分析用户输入，优化提示词
- **内容生成代理**: 根据优化提示词生成高质量内容
- **质量评估代理**: 评估内容质量，提供改进建议

### 4. 错误处理
- 全局异常过滤器
- 详细的错误信息返回
- 优雅的错误处理机制

## 🧪 测试

### 健康检查测试
```bash
curl -X GET http://localhost:3000/mastra/health
```

### 智能工作流测试
```bash
curl -X POST http://localhost:3000/mastra/workflows/intelligent \
  -H "Content-Type: application/json" \
  -d '{"userInput": "什么是人工智能？", "maxRetries": 2}'
```

## 📝 开发说明

### 添加新的工作流
1. 在 `mastra/src/mastra/workflows/` 中创建新的工作流
2. 在 `mastra/src/mastra/index.ts` 中注册工作流
3. 在 `MastraService` 中添加对应的方法
4. 在 `MastraController` 中添加API接口

### 环境变量最佳实践
- 所有配置通过 `AppConfigService` 访问
- 敏感信息不要提交到版本控制
- 使用 `.env.example` 作为配置模板

## 🚨 故障排除

### 常见问题

1. **API密钥错误**
   ```
   Configuration validation failed: GOOGLE_GENERATIVE_AI_API_KEY is required
   ```
   解决方案：确保在 `.env` 文件中设置了正确的API密钥

2. **端口冲突**
   ```
   Error: listen EADDRINUSE: address already in use :::3000
   ```
   解决方案：修改 `.env` 文件中的 `PORT` 变量或停止占用端口的进程

3. **模块导入错误**
   确保所有依赖都已正确安装：
   ```bash
   npm install
   ```

## 📄 许可证

本项目采用 UNLICENSED 许可证。