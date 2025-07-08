import { createWorkflow } from '@mastra/core/workflows';
import {
  userInputSchema,
  finalOutputSchema
} from './types';
import {
  intentAnalysisStep,
  contentGenerationStep,
  qualityEvaluationStep,
  retryContentGenerationStep,
  finalizeResultStep
} from './steps';











/**
 * 智能三代理协作工作流
 *
 * 工作流架构：
 * 1. 意图分析 - 分析用户输入并优化提示词
 * 2. 内容生成 - 基于优化提示词生成内容
 * 3. 质量评估 - 评估生成内容质量
 * 4. 条件分支 - 根据质量评估结果决定是否重试或输出结果
 * 5. 重试机制 - 支持最大重试次数限制的智能重试
 *
 * 此文件只负责工作流的步骤编排和条件控制，
 * 具体的业务逻辑实现在各个步骤模块中。
 */
const intelligentWorkflow = createWorkflow({
  id: 'intelligent-workflow',
  description: '智能三agent协作workflow，支持条件分支和回流控制',
  inputSchema: userInputSchema,
  outputSchema: finalOutputSchema,
  steps: [
    intentAnalysisStep,
    contentGenerationStep,
    qualityEvaluationStep,
    retryContentGenerationStep,
    finalizeResultStep,
  ],
})
  // 工作流执行序列：意图分析 → 内容生成 → 质量评估
  .then(intentAnalysisStep)
  .then(contentGenerationStep)
  .then(qualityEvaluationStep)
  // 条件分支：根据质量评估结果决定下一步
  .branch([
    // 分支1：质量达标，直接输出结果
    [
      async ({ inputData }: any) => {
        return inputData.qualityEvaluation?.overallQuality === 'PASS';
      },
      finalizeResultStep as any,
    ],
    // 分支2：质量不达标且未达到最大重试次数，进行重试
    [
      async ({ inputData }: any) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry < inputData.maxRetries
        );
      },
      retryContentGenerationStep as any,
    ],
    // 分支3：质量不达标且已达到最大重试次数，输出失败结果
    [
      async ({ inputData }: any) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry >= inputData.maxRetries
        );
      },
      finalizeResultStep as any,
    ],
  ])
  // 重试后再次进行条件判断
  .branch([
    // 重试后质量达标
    [
      async ({ inputData }: any) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'PASS' &&
          inputData.currentRetry > 0
        );
      },
      finalizeResultStep as any,
    ],
    // 重试后仍不达标但未达到最大重试次数，继续重试
    [
      async ({ inputData }: any) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry < inputData.maxRetries
        );
      },
      retryContentGenerationStep as any,
    ],
    // 重试后仍不达标且已达到最大重试次数
    [
      async ({ inputData }: any) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry >= inputData.maxRetries
        );
      },
      finalizeResultStep as any,
    ],
  ]);

// 提交workflow
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
  finalizeResultStep,
  retryContentGenerationStep
} from './steps';
