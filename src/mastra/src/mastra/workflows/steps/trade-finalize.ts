import { createStep } from '@mastra/core/workflows';
import {
  tradeWorkflowStateSchema,
  tradeFinalOutputSchema,
  TradeWorkflowState,
  TradeFinalOutput,
  TradeAnalysis,
  TradeStrategy,
  TradeEvaluation
} from '../trade-types.js';

/**
 * 交易重试步骤业务逻辑
 * 负责处理策略生成重试逻辑
 */
export class TradeRetryStepLogic {
  /**
   * 执行重试逻辑
   * @param inputData 工作流状态数据
   * @param mastra Mastra 实例
   * @returns 更新后的工作流状态
   */
  static async execute(
    inputData: TradeWorkflowState,
    mastra: any
  ): Promise<TradeWorkflowState> {
    if (!inputData.tradeAnalysis || !inputData.tradeEvaluation) {
      throw new Error('Required data not found for retry');
    }

    // 使用评估反馈重新生成策略
    const { StrategyGenerationStepLogic } = await import('./strategy-generation.js');
    const tradeStrategy = await StrategyGenerationStepLogic.execute(
      inputData.tradeAnalysis,
      mastra,
      inputData.tradeEvaluation.improvementSuggestions
    );

    // 重新评估新生成的策略
    const { TradeEvaluationStepLogic } = await import('./trade-evaluation.js');
    const tradeEvaluation = await TradeEvaluationStepLogic.execute(
      inputData.userInput,
      inputData.tradeAnalysis,
      tradeStrategy,
      mastra,
      inputData.currentRetry + 1
    );

    return {
      ...inputData,
      currentRetry: inputData.currentRetry + 1,
      tradeStrategy,
      tradeEvaluation,
    };
  }
}

/**
 * 交易最终化步骤业务逻辑
 * 负责整理最终的交易策略结果
 */
export class TradeFinalizeStepLogic {
  /**
   * 执行最终化逻辑
   * @param inputData 工作流状态数据
   * @param startTime 开始时间
   * @returns 最终输出结果
   */
  static async execute(
    inputData: TradeWorkflowState,
    startTime: Date = new Date()
  ): Promise<TradeFinalOutput> {
    if (!inputData.tradeAnalysis || !inputData.tradeStrategy || !inputData.tradeEvaluation) {
      throw new Error('Required data not found for finalization');
    }

    const endTime = new Date();
    const processingTime = `${endTime.getTime() - startTime.getTime()}ms`;

    return {
      success: inputData.tradeEvaluation.overallQuality === 'PASS',
      userInput: inputData.userInput,
      tradeAnalysis: inputData.tradeAnalysis,
      finalStrategy: inputData.tradeStrategy,
      tradeEvaluation: inputData.tradeEvaluation,
      totalRetries: inputData.currentRetry,
      processingTime,
    };
  }
}

/**
 * 交易重试策略生成步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 TradeRetryStepLogic
 */
export const retryTradeStrategyStep = createStep({
  id: 'retry-trade-strategy',
  description: '重试策略生成和交易评估',
  inputSchema: tradeWorkflowStateSchema,
  outputSchema: tradeWorkflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    return await TradeRetryStepLogic.execute(inputData, mastra);
  },
});

/**
 * 交易最终结果整理步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 TradeFinalizeStepLogic
 */
export const tradeFinalizationStep = createStep({
  id: 'trade-finalization',
  description: '整理最终交易策略结果',
  inputSchema: tradeWorkflowStateSchema,
  outputSchema: tradeFinalOutputSchema,
  execute: async ({ inputData }) => {
    return await TradeFinalizeStepLogic.execute(inputData);
  },
});
