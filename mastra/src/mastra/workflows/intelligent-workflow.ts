import { createWorkflow, createStep } from '@mastra/core/workflows';
import {
  userInputSchema,
  workflowStateSchema,
  finalOutputSchema
} from './types';
import {
  intentAnalysisStep,
  contentGenerationStep,
  qualityEvaluationStep,
  finalizeResultStep
} from './steps';

/**
 * 智能三代理协作工作流 - 重构版本
 *
 * 使用 Mastra 的 dountil 循环工作流替代复杂的分支逻辑
 * 
 * 工作流架构：
 * 1. 意图分析 - 分析用户输入并优化提示词（一次性执行）
 * 2. 循环执行：内容生成 → 质量评估，直到质量达标或达到最大重试次数
 * 3. 最终化结果 - 输出最终结果
 *
 * 此重构版本简化了步骤数量，利用循环工作流的优势减少重复代码，
 * 更符合 Mastra 框架的设计理念和最佳实践。
 */

// 重试计数步骤 - 用于在循环中增加重试次数
const incrementRetryStep = createStep({
  id: 'increment-retry',
  description: '增加重试计数',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData }) => {
    return {
      ...inputData,
      currentRetry: inputData.currentRetry + 1,
    };
  },
});

// 创建内容生成和质量评估的嵌套工作流
const contentQualityLoopWorkflow = createWorkflow({
  id: 'content-quality-loop',
  description: '内容生成和质量评估循环工作流',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  steps: [contentGenerationStep, qualityEvaluationStep, incrementRetryStep],
})
  .then(contentGenerationStep)
  .then(qualityEvaluationStep)
  .then(incrementRetryStep)
  .commit();

// 主工作流 - 使用 dountil 循环
const intelligentWorkflow = createWorkflow({
  id: 'intelligent-workflow',
  description: '智能三agent协作workflow，使用循环工作流优化重试逻辑',
  inputSchema: userInputSchema,
  outputSchema: finalOutputSchema,
  steps: [
    intentAnalysisStep,
    contentQualityLoopWorkflow,
    finalizeResultStep,
  ],
})
  // 第一步：执行意图分析
  .then(intentAnalysisStep)
  // 第二步：使用 dountil 循环执行内容生成和质量评估
  .dountil(
    // 嵌套工作流：内容生成 → 质量评估 → 增加重试次数
    contentQualityLoopWorkflow,
    // 停止条件：质量达标 OR 达到最大重试次数
    async ({ inputData }) => {
      const qualityPass = inputData.qualityEvaluation?.overallQuality === 'PASS';
      const maxRetriesReached = inputData.currentRetry >= inputData.maxRetries;
      return qualityPass || maxRetriesReached;
    }
  )
  // 第三步：最终化结果
  .then(finalizeResultStep);

// 提交工作流
intelligentWorkflow.commit();

// 导出重构后的工作流
export { intelligentWorkflow };

// 重新导出类型定义，保持向后兼容
export {
  userInputSchema,
  workflowStateSchema,
  intentAnalysisSchema,
  contentGenerationSchema,
  qualityEvaluationSchema,
  finalOutputSchema
} from './types';

// 重新导出步骤定义，保持向后兼容
export {
  intentAnalysisStep,
  contentGenerationStep,
  qualityEvaluationStep,
  incrementRetryStep,
  finalizeResultStep
} from './steps';
