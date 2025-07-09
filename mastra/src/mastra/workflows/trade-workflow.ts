import { createWorkflow, createStep } from '@mastra/core/workflows';
import {
  tradeUserInputSchema,
  tradeWorkflowStateSchema,
  tradeFinalOutputSchema
} from './trade-types.js';
import { tradeAnalysisStep } from './steps/trade-analysis.js';
import { strategyGenerationStep } from './steps/strategy-generation.js';
import { tradeEvaluationStep } from './steps/trade-evaluation.js';
import { tradeFinalizationStep } from './steps/trade-finalize.js';

/**
 * 智能三代理交易协作工作流
 *
 * 使用 Mastra 的 dountil 循环工作流替代复杂的分支逻辑
 * 
 * 工作流架构：
 * 1. 交易分析 - 分析用户交易需求并优化策略提示词（一次性执行）
 * 2. 循环执行：策略生成 → 交易评估，直到质量达标或达到最大重试次数
 * 3. 最终化结果 - 输出最终交易策略结果
 *
 * 此工作流专门针对交易策略生成和评估，利用循环工作流的优势减少重复代码，
 * 更符合 Mastra 框架的设计理念和最佳实践。
 */

// 重试计数步骤 - 用于在循环中增加重试次数
const incrementTradeRetryStep = createStep({
  id: 'increment-trade-retry',
  description: '增加交易重试计数',
  inputSchema: tradeWorkflowStateSchema,
  outputSchema: tradeWorkflowStateSchema,
  execute: async ({ inputData }) => {
    return {
      ...inputData,
      currentRetry: inputData.currentRetry + 1,
    };
  },
});

// 创建策略生成和交易评估的嵌套工作流
const strategyEvaluationLoopWorkflow = createWorkflow({
  id: 'strategy-evaluation-loop',
  description: '策略生成和交易评估循环工作流',
  inputSchema: tradeWorkflowStateSchema,
  outputSchema: tradeWorkflowStateSchema,
  steps: [strategyGenerationStep, tradeEvaluationStep, incrementTradeRetryStep],
})
  .then(strategyGenerationStep)
  .then(tradeEvaluationStep)
  .then(incrementTradeRetryStep)
  .commit();

// 主交易工作流 - 使用 dountil 循环
const tradeWorkflow = createWorkflow({
  id: 'trade-workflow',
  description: '智能三agent交易协作workflow，使用循环工作流优化重试逻辑',
  inputSchema: tradeUserInputSchema,
  outputSchema: tradeFinalOutputSchema,
  steps: [
    tradeAnalysisStep,
    strategyEvaluationLoopWorkflow,
    tradeFinalizationStep,
  ],
})
  // 第一步：执行交易分析
  .then(tradeAnalysisStep)
  // 第二步：使用 dountil 循环执行策略生成和交易评估
  .dountil(
    // 嵌套工作流：策略生成 → 交易评估 → 增加重试次数
    strategyEvaluationLoopWorkflow,
    // 停止条件：质量达标 OR 达到最大重试次数
    async ({ inputData }) => {
      const qualityPass = inputData.tradeEvaluation?.overallQuality === 'PASS';
      const maxRetriesReached = inputData.currentRetry >= inputData.maxRetries;
      return qualityPass || maxRetriesReached;
    }
  )
  // 第三步：最终化结果
  .then(tradeFinalizationStep);

// 提交工作流
tradeWorkflow.commit();

// 导出交易工作流
export { tradeWorkflow };

// 重新导出类型定义，保持向后兼容
export {
  tradeUserInputSchema,
  tradeWorkflowStateSchema,
  tradeAnalysisSchema,
  tradeStrategySchema,
  tradeEvaluationSchema,
  tradeFinalOutputSchema
} from './trade-types';

// 重新导出步骤定义，保持向后兼容
export {
  tradeAnalysisStep,
  strategyGenerationStep,
  tradeEvaluationStep,
  tradeFinalizationStep
} from './steps';

// 导出内联定义的步骤
export { incrementTradeRetryStep };
