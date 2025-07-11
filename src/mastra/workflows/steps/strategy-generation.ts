import { createStep } from '@mastra/core/workflows';
import {
  tradeWorkflowStateSchema,
  TradeWorkflowState,
  TradeStrategy,
  TradeAnalysis
} from '../trade-types.js';

/**
 * 交易策略生成步骤业务逻辑
 * 负责基于优化策略提示词生成高质量交易方案
 */
export class StrategyGenerationStepLogic {
  /**
   * 执行策略生成
   * @param tradeAnalysis 交易分析结果
   * @param mastra Mastra 实例
   * @param improvementSuggestions 改进建议（用于重试）
   * @returns 策略生成结果
   */
  static async execute(
    tradeAnalysis: TradeAnalysis,
    mastra: any,
    improvementSuggestions?: string[]
  ): Promise<TradeStrategy> {
    const agent = mastra?.getAgent('tradeStrategyAgent');
    if (!agent) {
      throw new Error('Trade Strategy Agent not found');
    }

    const prompt = this.buildStrategyGenerationPrompt(tradeAnalysis, improvementSuggestions);

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return this.parseStrategyGenerationResponse(response.text);
  }

  /**
   * 构建策略生成提示词
   * @param tradeAnalysis 交易分析结果
   * @param improvementSuggestions 改进建议
   * @returns 构建的提示词
   */
  private static buildStrategyGenerationPrompt(
    tradeAnalysis: TradeAnalysis,
    improvementSuggestions?: string[]
  ): string {
    let prompt = `请根据以下优化后的策略提示词生成高质量交易方案：

优化策略提示词：${tradeAnalysis.optimizedPrompt}

期望输出类型：${tradeAnalysis.expectedOutputType}

市场分析提示：${tradeAnalysis.contextualHints.join(', ')}

评估标准：${tradeAnalysis.qualityCriteria.join(', ')}`;

    if (improvementSuggestions && improvementSuggestions.length > 0) {
      prompt += `

之前的改进建议：${improvementSuggestions.join(', ')}`;
    }

    prompt += `

请严格按照指定的JSON格式输出策略生成结果。`;

    return prompt;
  }

  /**
   * 解析策略生成响应
   * @param responseText 代理响应文本
   * @returns 解析后的策略生成结果
   */
  private static parseStrategyGenerationResponse(responseText: string): TradeStrategy {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse strategy generation response:', error);
      // 提供默认的策略生成
      return this.getDefaultStrategyGeneration(responseText);
    }
  }

  /**
   * 获取默认的策略生成结果
   * @param responseText 原始响应文本
   * @returns 默认策略生成结果
   */
  private static getDefaultStrategyGeneration(responseText: string): TradeStrategy {
    return {
      generatedStrategy: responseText,
      strategyType: '一般交易策略',
      keyPoints: ['主要策略要点'],
      riskManagement: '基础风险控制措施',
      confidence: 0.7,
      marketConditions: ['一般市场条件'],
    };
  }
}

/**
 * 策略生成步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 StrategyGenerationStepLogic
 */
export const strategyGenerationStep = createStep({
  id: 'strategy-generation',
  description: '基于优化策略提示词生成交易方案',
  inputSchema: tradeWorkflowStateSchema,
  outputSchema: tradeWorkflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.tradeAnalysis) {
      throw new Error('Trade analysis data not found');
    }

    // 执行策略生成业务逻辑
    const tradeStrategy = await StrategyGenerationStepLogic.execute(
      inputData.tradeAnalysis,
      mastra
    );

    // 返回更新后的工作流状态
    return {
      ...inputData,
      tradeStrategy,
    };
  },
});
