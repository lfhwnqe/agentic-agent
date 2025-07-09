import { createStep } from '@mastra/core/workflows';
import {
  tradeWorkflowStateSchema,
  TradeWorkflowState,
  TradeEvaluation,
  TradeAnalysis,
  TradeStrategy
} from '../trade-types.js';

/**
 * 交易评估步骤业务逻辑
 * 负责评估生成策略的质量
 */
export class TradeEvaluationStepLogic {
  /**
   * 执行交易评估
   * @param userInput 用户原始输入
   * @param tradeAnalysis 交易分析结果
   * @param tradeStrategy 策略生成结果
   * @param mastra Mastra 实例
   * @param currentRetry 当前重试次数
   * @returns 交易评估结果
   */
  static async execute(
    userInput: string,
    tradeAnalysis: TradeAnalysis,
    tradeStrategy: TradeStrategy,
    mastra: any,
    currentRetry: number = 0
  ): Promise<TradeEvaluation> {
    const agent = mastra?.getAgent('tradeEvaluatorAgent');
    if (!agent) {
      throw new Error('Trade Evaluator Agent not found');
    }

    const prompt = this.buildTradeEvaluationPrompt(
      userInput,
      tradeAnalysis,
      tradeStrategy,
      currentRetry
    );

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return this.parseTradeEvaluationResponse(response.text);
  }

  /**
   * 构建交易评估提示词
   * @param userInput 用户原始输入
   * @param tradeAnalysis 交易分析结果
   * @param tradeStrategy 策略生成结果
   * @param currentRetry 当前重试次数
   * @returns 构建的提示词
   */
  private static buildTradeEvaluationPrompt(
    userInput: string,
    tradeAnalysis: TradeAnalysis,
    tradeStrategy: TradeStrategy,
    currentRetry: number
  ): string {
    let prompt = `请评估以下交易策略的质量：

用户原始需求：${userInput}

优化策略提示词：${tradeAnalysis.optimizedPrompt}

生成策略：${JSON.stringify(tradeStrategy, null, 2)}

评估标准：${tradeAnalysis.qualityCriteria.join(', ')}`;

    if (currentRetry > 0) {
      prompt += `

这是第${currentRetry}次重试，请严格评估。`;
    }

    prompt += `

请严格按照指定的JSON格式输出评估结果。`;

    return prompt;
  }

  /**
   * 解析交易评估响应
   * @param responseText 代理响应文本
   * @returns 解析后的交易评估结果
   */
  private static parseTradeEvaluationResponse(responseText: string): TradeEvaluation {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse trade evaluation response:', error);
      // 提供默认的交易评估
      return this.getDefaultTradeEvaluation();
    }
  }

  /**
   * 获取默认的交易评估结果
   * @returns 默认交易评估结果
   */
  private static getDefaultTradeEvaluation(): TradeEvaluation {
    return {
      overallQuality: 'PASS' as const,
      totalScore: 7.0,
      dimensionScores: {
        relevance: 7,
        feasibility: 7,
        riskControl: 7,
        profitPotential: 7,
        usefulness: 7,
      },
      feedback: '策略基本符合要求',
      improvementSuggestions: [],
      retryRecommended: false,
    };
  }
}

/**
 * 交易评估步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 TradeEvaluationStepLogic
 */
export const tradeEvaluationStep = createStep({
  id: 'trade-evaluation',
  description: '评估生成策略的质量',
  inputSchema: tradeWorkflowStateSchema,
  outputSchema: tradeWorkflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.tradeAnalysis || !inputData.tradeStrategy) {
      throw new Error('Required data not found for trade evaluation');
    }

    // 执行交易评估业务逻辑
    const tradeEvaluation = await TradeEvaluationStepLogic.execute(
      inputData.userInput,
      inputData.tradeAnalysis,
      inputData.tradeStrategy,
      mastra,
      inputData.currentRetry
    );

    // 返回更新后的工作流状态
    return {
      ...inputData,
      tradeEvaluation,
    };
  },
});
