import { createStep } from '@mastra/core/workflows';
import {
  tradeUserInputSchema,
  tradeWorkflowStateSchema,
  TradeWorkflowState,
  TradeAnalysis
} from '../trade-types.js';

/**
 * 交易分析步骤业务逻辑
 * 负责分析用户交易需求并优化策略提示词
 */
export class TradeAnalysisStepLogic {
  /**
   * 执行交易分析
   * @param userInput 用户输入
   * @param mastra Mastra 实例
   * @returns 交易分析结果
   */
  static async execute(userInput: string, mastra: any): Promise<TradeAnalysis> {
    const agent = mastra?.getAgent('tradeAnalyzerAgent');
    if (!agent) {
      throw new Error('Trade Analyzer Agent not found');
    }

    const prompt = `请分析以下用户交易需求并优化策略提示词：

用户输入：${userInput}

请严格按照指定的JSON格式输出分析结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return this.parseTradeAnalysisResponse(response.text, userInput);
  }

  /**
   * 解析交易分析响应
   * @param responseText 代理响应文本
   * @param originalInput 原始用户输入
   * @returns 解析后的交易分析结果
   */
  private static parseTradeAnalysisResponse(
    responseText: string,
    originalInput: string
  ): TradeAnalysis {
    try {
      // 尝试解析JSON响应
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse trade analysis response:', error);
      // 提供默认的交易分析
      return this.getDefaultTradeAnalysis(originalInput);
    }
  }

  /**
   * 获取默认的交易分析结果
   * @param originalInput 原始用户输入
   * @returns 默认交易分析结果
   */
  private static getDefaultTradeAnalysis(originalInput: string): TradeAnalysis {
    return {
      originalInput,
      analyzedIntent: '用户需要获取交易策略建议',
      optimizedPrompt: originalInput,
      expectedOutputType: '详细交易策略',
      contextualHints: ['提供风险控制措施', '保持策略可执行性'],
      qualityCriteria: ['可行性', '风险控制', '盈利潜力'],
    };
  }
}

/**
 * 交易分析步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 TradeAnalysisStepLogic
 */
export const tradeAnalysisStep = createStep({
  id: 'trade-analysis',
  description: '分析用户交易需求并优化策略提示词',
  inputSchema: tradeUserInputSchema,
  outputSchema: tradeWorkflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    // 执行交易分析业务逻辑
    const tradeAnalysis = await TradeAnalysisStepLogic.execute(
      inputData.userInput,
      mastra
    );

    // 返回更新后的工作流状态
    return {
      userInput: inputData.userInput,
      maxRetries: inputData.maxRetries,
      currentRetry: 0,
      tradeAnalysis,
    };
  },
});
