import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  workflowStateSchema,
  finalOutputSchema,
  WorkflowState,
  FinalOutput,
  IntentAnalysis,
  ContentGeneration,
  QualityEvaluation
} from '../types';
import { ContentGenerationStepLogic } from './content-generation';
import { QualityEvaluationStepLogic } from './quality-evaluation';

/**
 * 重试步骤业务逻辑
 * 负责重新生成内容和重新评估质量
 */
export class RetryStepLogic {
  /**
   * 执行重试逻辑
   * @param inputData 当前工作流状态
   * @param mastra Mastra 实例
   * @returns 更新后的工作流状态
   */
  static async execute(inputData: WorkflowState, mastra: any): Promise<WorkflowState> {
    if (!inputData.intentAnalysis) {
      throw new Error('Intent analysis data not found for retry');
    }

    // 增加重试计数
    const updatedData = {
      ...inputData,
      currentRetry: inputData.currentRetry + 1,
    };

    // 获取之前的改进建议
    const improvementSuggestions = inputData.qualityEvaluation?.improvementSuggestions || [];

    // 重新生成内容
    const contentGeneration = await ContentGenerationStepLogic.execute(
      updatedData.intentAnalysis,
      mastra,
      improvementSuggestions
    );

    // 重新评估质量
    const qualityEvaluation = await QualityEvaluationStepLogic.execute(
      updatedData.userInput,
      updatedData.intentAnalysis,
      contentGeneration,
      mastra,
      updatedData.currentRetry
    );

    return {
      ...updatedData,
      contentGeneration,
      qualityEvaluation,
    };
  }
}

/**
 * 最终化步骤业务逻辑
 * 负责整理最终结果
 */
export class FinalizeStepLogic {
  /**
   * 执行结果最终化
   * @param inputData 当前工作流状态
   * @returns 最终输出结果
   */
  static async execute(inputData: WorkflowState): Promise<FinalOutput> {
    if (!inputData.intentAnalysis || !inputData.contentGeneration || !inputData.qualityEvaluation) {
      throw new Error('Missing required data for finalization');
    }

    return {
      success: inputData.qualityEvaluation.overallQuality === 'PASS',
      userInput: inputData.userInput,
      intentAnalysis: inputData.intentAnalysis,
      finalContent: inputData.contentGeneration,
      qualityEvaluation: inputData.qualityEvaluation,
      totalRetries: inputData.currentRetry,
      processingTime: new Date().toISOString(),
    };
  }
}

/**
 * 重试内容生成步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 RetryStepLogic
 */
export const retryContentGenerationStep = createStep({
  id: 'retry-content-generation',
  description: '重试内容生成和质量评估',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    return await RetryStepLogic.execute(inputData, mastra);
  },
});

/**
 * 最终结果整理步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 FinalizeStepLogic
 */
export const finalizeResultStep = createStep({
  id: 'finalize-result',
  description: '整理最终结果',
  inputSchema: workflowStateSchema,
  outputSchema: finalOutputSchema,
  execute: async ({ inputData }) => {
    return await FinalizeStepLogic.execute(inputData);
  },
});

/**
 * 重试计数步骤定义
 * 简单的重试计数器，用于某些特殊场景
 */
export const incrementRetryStep = createStep({
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