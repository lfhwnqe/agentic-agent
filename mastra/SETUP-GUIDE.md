# 🚀 Mastra智能Workflow系统配置指南

## 📋 前置要求

- Node.js >= 20.9.0
- pnpm 包管理器
- Google Gemini API密钥

## 🔑 获取Google Gemini API密钥

### 步骤1：访问Google AI Studio

1. 打开浏览器，访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用Google账号登录

### 步骤2：创建API密钥

1. 点击 "Create API Key" 按钮
2. 选择一个Google Cloud项目（如果没有，系统会提示创建）
3. 复制生成的API密钥

### 步骤3：配置环境变量

1. 在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，添加你的API密钥：

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

## 🛠️ 安装和启动

### 1. 安装依赖

```bash
cd mastra
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm run dev
```

服务器启动后，你会看到：

```
INFO [2025-07-08 15:17:08.647 +0800] (Mastra):  Mastra API running on port http://localhost:4111/api
INFO [2025-07-08 15:17:08.649 +0800] (Mastra): 👨‍💻 Playground available at http://localhost:4111
```

### 3. 访问Playground

打开浏览器访问 `http://localhost:4111` 来使用Mastra Playground界面。

## 🧪 运行测试

### 测试单个Agent

```bash
npx tsx src/run-test.ts
```

### 测试完整Workflow

```bash
npx tsx src/test-simple-workflow.ts
```

## 📊 验证系统功能

### 1. 检查Agent状态

运行测试后，你应该看到类似输出：

```
🔍 测试单个Agent功能...

📊 测试意图分析Agent
==============================
✅ 成功获取意图分析Agent
📊 意图分析结果（前200字符）：
{
  "originalInput": "什么是机器学习？",
  "analyzedIntent": "用户想要了解机器学习的基本概念...",
  ...
}
```

### 2. 检查Workflow执行

成功的workflow执行应该显示：

```
📝 测试简化版智能workflow
========================================
✅ 成功获取workflow: simple-intelligent-workflow
✅ 成功创建workflow run
🔄 开始执行workflow...
⏱️  执行时间: 15234ms
✅ Workflow执行完成！

📊 执行结果:
- 成功状态: true
- 用户输入: 什么是机器学习？
- 质量分数: 8.5
- 重试次数: 0
- 处理时间: 2025-07-08T07:19:16.858Z
```

## 🔧 常见问题解决

### 问题1：API密钥错误

**错误信息**：
```
Google Generative AI API key is missing
```

**解决方案**：
1. 确认 `.env` 文件存在且包含正确的API密钥
2. 重启开发服务器
3. 检查API密钥是否有效

### 问题2：模块导入错误

**错误信息**：
```
Cannot find module '@mastra/core/workflows/vNext'
```

**解决方案**：
1. 确认使用正确的导入路径：`@mastra/core/workflows`
2. 重新安装依赖：`pnpm install`

### 问题3：Workflow执行失败

**错误信息**：
```
Error executing step
```

**解决方案**：
1. 检查所有Agent是否正确注册
2. 验证输入数据格式
3. 查看详细错误日志

## 🎯 使用示例

### 基础用法

```typescript
import { mastra } from './mastra/index';

async function testWorkflow() {
  const workflow = mastra.getWorkflow('simpleIntelligentWorkflow');
  const run = workflow.createRun();

  const result = await run.start({
    inputData: {
      userInput: '解释一下深度学习的概念',
      maxRetries: 2,
    },
  });

  console.log('结果:', result);
}

testWorkflow();
```

### 高级配置

```typescript
// 自定义重试次数和质量阈值
const result = await run.start({
  inputData: {
    userInput: '复杂的技术问题',
    maxRetries: 5,  // 最多重试5次
  },
});
```

## 📈 性能优化建议

### 1. API调用优化

- 使用合适的模型（gemini-2.5-flash vs gemini-pro）
- 控制输入文本长度
- 实现请求缓存

### 2. 内存管理

- 定期清理workflow运行历史
- 使用流式处理大文本
- 监控内存使用情况

### 3. 错误处理

- 实现指数退避重试
- 设置合理的超时时间
- 记录详细的错误日志

## 🔍 调试技巧

### 启用详细日志

```bash
MASTRA_LOG_LEVEL=debug pnpm run dev
```

### 查看Workflow状态

```typescript
// 在workflow步骤中添加调试信息
execute: async ({ inputData }) => {
  console.log('当前步骤输入:', inputData);
  // ... 执行逻辑
  console.log('当前步骤输出:', result);
  return result;
}
```

### 使用Playground调试

1. 访问 `http://localhost:4111`
2. 在Playground中测试单个Agent
3. 查看详细的执行日志

## 📞 获取帮助

如果遇到问题，可以：

1. 查看 [Mastra官方文档](https://docs.mastra.ai)
2. 检查 [GitHub Issues](https://github.com/mastra-ai/mastra/issues)
3. 参考项目中的示例代码

## 🎉 下一步

配置完成后，你可以：

1. 自定义Agent指令
2. 创建新的Workflow
3. 集成到你的应用中
4. 扩展系统功能

祝你使用愉快！🚀
