import { createStep } from '@mastra/core/workflows';
import {
  userInputSchema,
  workflowStateSchema,
  WorkflowState,
  IntentAnalysis
} from '../types';

/**
 * 意图分析步骤业务逻辑
 * 负责分析用户输入并优化提示词
 */
export class IntentAnalysisStepLogic {
  /**
   * 执行意图分析
   * @param userInput 用户输入
   * @param mastra Mastra 实例
   * @returns 意图分析结果
   */
  static async execute(userInput: string, mastra: any): Promise<IntentAnalysis> {
    const agent = mastra?.getAgent('intentAnalyzerAgent');
    if (!agent) {
      throw new Error('Intent Analyzer Agent not found');
    }

    const prompt = `请分析以下用户输入并优化提示词：

用户输入：${userInput}

请严格按照指定的JSON格式输出分析结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return this.parseIntentAnalysisResponse(response.text, userInput);
  }

  /**
   * 解析意图分析响应
   * @param responseText 代理响应文本
   * @param originalInput 原始用户输入
   * @returns 解析后的意图分析结果
   */
  private static parseIntentAnalysisResponse(
    responseText: string,
    originalInput: string
  ): IntentAnalysis {
    try {
      // 尝试解析JSON响应
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse intent analysis response:', error);
      // 提供默认的意图分析
      return this.getDefaultIntentAnalysis(originalInput);
    }
  }

  /**
   * 获取默认的意图分析结果
   * @param originalInput 原始用户输入
   * @returns 默认意图分析结果
   */
  private static getDefaultIntentAnalysis(originalInput: string): IntentAnalysis {
    return {
      originalInput,
      analyzedIntent: '用户需要获取相关信息',
      optimizedPrompt: originalInput,
      expectedOutputType: '详细解释',
      contextualHints: ['提供准确信息', '保持清晰表达'],
      qualityCriteria: ['准确性', '完整性', '清晰度'],
    };
  }
}

/**
 * 意图分析步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 IntentAnalysisStepLogic
 */
export const intentAnalysisStep = createStep({
  id: 'intent-analysis',
  description: '分析用户意图并优化提示词',
  inputSchema: userInputSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    // 执行意图分析业务逻辑
    const intentAnalysis = await IntentAnalysisStepLogic.execute(
      inputData.userInput,
      mastra
    );

    // 返回更新后的工作流状态
    return {
      userInput: inputData.userInput,
      maxRetries: inputData.maxRetries,
      currentRetry: 0,
      intentAnalysis,
    };
  },
});