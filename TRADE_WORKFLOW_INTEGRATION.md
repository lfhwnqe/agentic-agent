# 交易工作流 NestJS 集成文档

## 概述

成功将 `tradeWorkflow` 集成到 NestJS 的 Mastra 模块中，提供了完整的 REST API 接口用于交易策略生成和评估。

## 功能特性

### 🎯 核心功能
- **交易分析**: 分析用户交易需求并优化策略提示词
- **策略生成**: 基于优化提示词生成高质量交易方案
- **交易评估**: 评估策略质量并提供改进建议
- **循环优化**: 自动重试直到质量达标或达到最大重试次数

### 🤖 三代理协作系统
1. **交易分析代理** (`tradeAnalyzerAgent`) - 分析交易需求，优化策略提示词
2. **策略生成代理** (`tradeStrategyAgent`) - 生成具体的交易策略方案
3. **交易评估代理** (`tradeEvaluatorAgent`) - 评估策略质量，提供反馈

## API 接口

### 1. 执行交易工作流

**端点**: `POST /mastra/workflows/trade`

**请求格式**:
```json
{
  "userInput": "我想做股票短线交易，有什么好的策略？",
  "maxRetries": 3
}
```

**请求参数**:
- `userInput` (string, 必需): 用户的交易需求或问题
- `maxRetries` (number, 可选): 最大重试次数 (1-10，默认为配置值)

**响应格式**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "userInput": "我想做股票短线交易，有什么好的策略？",
    "tradeAnalysis": {
      "originalInput": "我想做股票短线交易，有什么好的策略？",
      "analyzedIntent": "用户希望获得股票短线交易的具体策略建议",
      "optimizedPrompt": "请提供适合股票短线交易的具体策略...",
      "expectedOutputType": "交易策略方案",
      "contextualHints": ["关注技术指标", "控制风险", "设置止损"],
      "qualityCriteria": ["策略可行性", "风险控制", "盈利潜力"]
    },
    "finalStrategy": {
      "generatedStrategy": "基于移动平均线的短线交易策略...",
      "strategyType": "技术分析策略",
      "keyPoints": ["使用5日和20日移动平均线", "设置2%止损", "目标收益3%"],
      "riskManagement": "严格执行止损，单次交易风险不超过总资金的2%",
      "confidence": 0.85,
      "marketConditions": ["震荡市场", "中等波动率"]
    },
    "tradeEvaluation": {
      "overallQuality": "PASS",
      "totalScore": 8.5,
      "dimensionScores": {
        "relevance": 9,
        "feasibility": 8,
        "riskControl": 8,
        "profitPotential": 8,
        "usefulness": 9
      },
      "feedback": "策略整体可行，风险控制措施合理...",
      "improvementSuggestions": ["可以考虑加入成交量指标"],
      "retryRecommended": false
    },
    "totalRetries": 1,
    "processingTime": "2500ms"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 健康检查

**端点**: `GET /mastra/health`

**响应格式**:
```json
{
  "success": true,
  "message": "Mastra service is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 使用示例

### cURL 示例

```bash
# 健康检查
curl -X GET http://localhost:3000/mastra/health

# 执行交易工作流
curl -X POST http://localhost:3000/mastra/workflows/trade \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "我想做股票短线交易，有什么好的策略？",
    "maxRetries": 2
  }'
```

### JavaScript 示例

```javascript
// 使用 axios
const response = await axios.post('http://localhost:3000/mastra/workflows/trade', {
  userInput: '我想做外汇交易，EUR/USD货币对有什么好的策略？',
  maxRetries: 3
});

console.log('交易策略:', response.data.data.finalStrategy);
```

### Python 示例

```python
import requests

response = requests.post('http://localhost:3000/mastra/workflows/trade', json={
    'userInput': '比特币现在适合做波段交易吗？',
    'maxRetries': 2
})

result = response.json()
if result['success']:
    strategy = result['data']['finalStrategy']
    print(f"策略类型: {strategy['strategyType']}")
    print(f"信心度: {strategy['confidence']}")
```

## 日志记录

系统提供详细的日志记录，包括：

### 请求级别日志
- 请求开始时间和参数
- 执行过程中的关键步骤
- 完成时间和结果摘要
- 错误详情和堆栈跟踪

### 日志示例
```
[INFO] [abc123] Trade workflow request started
[INFO] [abc123] Executing trade workflow...
[INFO] [abc123] Trade workflow completed successfully
```

## 错误处理

### 常见错误类型

1. **输入验证错误** (400)
   - 空输入或无效参数
   - 重试次数超出范围

2. **服务初始化错误** (500)
   - Mastra 服务未初始化
   - 工作流或代理未找到

3. **执行错误** (500)
   - API 密钥无效
   - 网络连接问题
   - 代理执行失败

### 错误响应格式
```json
{
  "success": false,
  "message": "Failed to run trade workflow",
  "error": "Trade analyzer agent not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 测试

### 运行测试脚本

```bash
# 安装依赖
npm install axios

# 启动 NestJS 应用
npm run start:dev

# 运行测试脚本
npx ts-node src/test-trade-workflow-api.ts
```

### 测试用例

测试脚本包含以下测试用例：
- 股票短线交易策略
- 外汇交易策略  
- 加密货币交易策略
- 期货交易策略
- 异常情况测试（空输入、超长输入、无效参数）

## 性能考虑

### 执行时间
- 典型执行时间：2-5秒
- 复杂查询可能需要10-30秒
- 设置了2分钟的超时限制

### 并发处理
- 支持多个并发请求
- 每个请求都有独立的执行上下文
- 建议在测试时添加请求间隔

## 配置要求

### 环境变量
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 依赖项
- NestJS 框架
- Mastra 核心库
- Google Generative AI API

## 故障排除

### 常见问题

1. **API 密钥错误**
   - 确保设置了正确的 `GOOGLE_GENERATIVE_AI_API_KEY`
   - 检查 API 密钥是否有效且有足够配额

2. **工作流未找到**
   - 确认 `tradeWorkflow` 已正确注册到 Mastra 实例
   - 检查工作流 ID 是否匹配

3. **代理未找到**
   - 确认三个交易代理都已正确配置
   - 检查代理名称是否匹配

4. **超时错误**
   - 增加客户端超时设置
   - 检查网络连接
   - 考虑减少 `maxRetries` 参数

## 下一步建议

1. **添加认证授权** - 为 API 接口添加安全认证
2. **添加缓存机制** - 缓存相似查询的结果
3. **性能监控** - 添加性能指标和监控
4. **批量处理** - 支持批量交易策略生成
5. **WebSocket 支持** - 实时推送执行进度

## 总结

交易工作流已成功集成到 NestJS 中，提供了：
- 完整的 REST API 接口
- 详细的日志记录和错误处理
- 类型安全的 TypeScript 支持
- 全面的测试用例
- 清晰的文档和使用示例

系统已准备好用于生产环境，只需配置 API 密钥即可开始使用。
