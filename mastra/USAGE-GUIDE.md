# 重构后工作流系统使用指南

## 📖 概述

本指南将帮助您了解如何使用重构后的模块化工作流系统，包括基本使用、自定义配置、扩展功能等。

## 🚀 快速开始

### 1. 基本使用

```typescript
import { intelligentWorkflow } from './src/mastra/workflows/intelligent-workflow';

// 执行工作流
const result = await intelligentWorkflow.execute({
  userInput: "请解释什么是机器学习",
  maxRetries: 3
});

console.log('工作流执行结果:', result);
```

### 2. 使用单独的步骤模块

```typescript
import { IntentAnalysisStepLogic } from './src/mastra/workflows/steps/intent-analysis';

// 单独使用意图分析步骤
const intentResult = await IntentAnalysisStepLogic.execute(
  "用户输入文本",
  mastraInstance
);
```

## ⚙️ 配置管理

### 1. 使用默认配置

```typescript
import { getWorkflowConfig } from './src/mastra/workflows/config';

const config = getWorkflowConfig();
console.log('当前配置:', config);
```

### 2. 环境变量配置

在 `.env` 文件中设置：

```bash
# 最大重试次数
WORKFLOW_MAX_RETRIES=5

# 质量评估阈值
WORKFLOW_QUALITY_THRESHOLD=8.0

# 日志级别
WORKFLOW_LOG_LEVEL=debug
```

### 3. 自定义配置

```typescript
import { WorkflowConfig } from './src/mastra/workflows/config';

const customConfig: WorkflowConfig = {
  retry: {
    maxRetries: 5,
    retryDelay: 2000,
  },
  quality: {
    passThreshold: 8.0,
    dimensions: ['relevance', 'accuracy', 'completeness'],
  },
  // ... 其他配置
};
```

## 🔧 扩展功能

### 1. 添加新的步骤

#### 步骤 1: 创建步骤文件

```typescript
// src/mastra/workflows/steps/my-custom-step.ts
import { createStep } from '@mastra/core/workflows';
import { workflowStateSchema } from '../types';

export class MyCustomStepLogic {
  static async execute(inputData: any, mastra: any): Promise<any> {
    // 实现您的业务逻辑
    return {
      customResult: "处理结果"
    };
  }
}

export const myCustomStep = createStep({
  id: 'my-custom-step',
  description: '我的自定义步骤',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    const result = await MyCustomStepLogic.execute(inputData, mastra);
    return { ...inputData, customResult: result };
  },
});
```

#### 步骤 2: 更新步骤索引

```typescript
// src/mastra/workflows/steps/index.ts
export { myCustomStep, MyCustomStepLogic } from './my-custom-step';
```

#### 步骤 3: 集成到工作流

```typescript
// src/mastra/workflows/intelligent-workflow.ts
import { myCustomStep } from './steps';

const intelligentWorkflow = createWorkflow({
  // ... 配置
})
  .then(intentAnalysisStep)
  .then(myCustomStep)  // 添加您的步骤
  .then(contentGenerationStep)
  // ... 其他步骤
```

### 2. 使用增强功能

#### 日志记录

```typescript
import { createWorkflowUtils } from './src/mastra/workflows/utils';
import { getWorkflowConfig } from './src/mastra/workflows/config';

const config = getWorkflowConfig();
const { logger } = createWorkflowUtils(config);

// 在您的步骤中使用日志
logger.info('my-step', '步骤开始执行');
logger.debug('my-step', '调试信息', { data: someData });
logger.error('my-step', '错误信息', error);
```

#### 错误处理

```typescript
const { errorHandler } = createWorkflowUtils(config);

try {
  // 执行可能失败的操作
  const result = await riskyOperation();
} catch (error) {
  throw errorHandler.handleStepError('my-step', error, context);
}
```

#### 性能监控

```typescript
const { performanceMonitor } = createWorkflowUtils(config);

const startTime = Date.now();
// 执行操作
const duration = Date.now() - startTime;
performanceMonitor.recordStepDuration('my-step', duration);

// 生成性能报告
performanceMonitor.generateReport();
```

## 🧪 测试

### 1. 运行现有测试

```bash
cd src/mastra/workflows
npx tsx test-refactored-workflow.ts
```

### 2. 编写自定义测试

```typescript
import { MyCustomStepLogic } from './steps/my-custom-step';

async function testMyCustomStep() {
  const mockMastra = {
    // 模拟 Mastra 实例
  };

  const result = await MyCustomStepLogic.execute(
    { userInput: "测试输入" },
    mockMastra
  );

  console.log('测试结果:', result);
}
```

## 📊 监控和调试

### 1. 启用详细日志

```typescript
// 在配置中启用详细日志
const config = {
  logging: {
    enabled: true,
    level: 'debug',
    includeStepDetails: true,
  }
};
```

### 2. 性能分析

```typescript
import { EnhancedIntentAnalysisStepLogic } from './steps/enhanced-intent-analysis';

// 使用增强版步骤获得详细的性能指标
const result = await EnhancedIntentAnalysisStepLogic.execute(
  userInput,
  mastraInstance
);
```

## 🔄 迁移指南

### 从旧版本迁移

如果您之前使用的是未重构的版本，以下是迁移步骤：

1. **更新导入语句**：
   ```typescript
   // 旧版本
   import { intelligentWorkflow } from './intelligent-workflow';

   // 新版本（相同，无需更改）
   import { intelligentWorkflow } from './intelligent-workflow';
   ```

2. **配置管理**：
   ```typescript
   // 新增：使用配置管理
   import { getWorkflowConfig } from './config';
   const config = getWorkflowConfig();
   ```

3. **错误处理**：
   ```typescript
   // 新增：使用统一的错误处理
   import { createWorkflowUtils } from './utils';
   const { errorHandler } = createWorkflowUtils(config);
   ```

## 💡 最佳实践

### 1. 步骤设计原则

- **单一职责**：每个步骤只负责一个明确的功能
- **无状态**：步骤之间通过数据传递，不依赖外部状态
- **可测试**：业务逻辑类可以独立测试
- **错误处理**：使用统一的错误处理机制

### 2. 配置管理

- **环境分离**：不同环境使用不同的配置
- **验证配置**：启动时验证配置的有效性
- **文档化**：为每个配置项提供清晰的说明

### 3. 日志记录

- **结构化日志**：使用结构化的日志格式
- **适当级别**：根据重要性选择合适的日志级别
- **性能考虑**：避免在生产环境中记录过多调试信息

### 4. 错误处理

- **分层处理**：在不同层次处理不同类型的错误
- **上下文信息**：提供足够的上下文信息用于调试
- **优雅降级**：在可能的情况下提供默认行为

## 🆘 故障排除

### 常见问题

1. **步骤执行失败**
   - 检查代理配置是否正确
   - 查看日志中的错误信息
   - 验证输入数据格式

2. **性能问题**
   - 启用性能监控
   - 检查超时配置
   - 分析步骤执行时间

3. **配置问题**
   - 验证环境变量设置
   - 检查配置文件格式
   - 使用配置验证功能

### 获取帮助

- 查看日志文件获取详细错误信息
- 使用调试模式运行工作流
- 检查每个步骤的独立功能

## 📚 参考资料

- [Mastra 框架文档](https://mastra.ai/docs)
- [重构总结文档](./REFACTORING-SUMMARY.md)
- [实现总结文档](./IMPLEMENTATION-SUMMARY.md)