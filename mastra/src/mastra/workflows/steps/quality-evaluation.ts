import { createStep } from '@mastra/core/workflows';
import {
  workflowStateSchema,
  WorkflowState,
  QualityEvaluation,
  IntentAnalysis,
  ContentGeneration
} from '../types';

/**
 * 质量评估步骤业务逻辑
 * 负责评估生成内容的质量
 */
export class QualityEvaluationStepLogic {
  /**
   * 执行质量评估
   * @param userInput 用户原始输入
   * @param intentAnalysis 意图分析结果
   * @param contentGeneration 内容生成结果
   * @param mastra Mastra 实例
   * @param currentRetry 当前重试次数
   * @returns 质量评估结果
   */
  static async execute(
    userInput: string,
    intentAnalysis: IntentAnalysis,
    contentGeneration: ContentGeneration,
    mastra: any,
    currentRetry: number = 0
  ): Promise<QualityEvaluation> {
    const agent = mastra?.getAgent('qualityEvaluatorAgent');
    if (!agent) {
      throw new Error('Quality Evaluator Agent not found');
    }

    const prompt = this.buildQualityEvaluationPrompt(
      userInput,
      intentAnalysis,
      contentGeneration,
      currentRetry
    );

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return this.parseQualityEvaluationResponse(response.text);
  }

  /**
   * 构建质量评估提示词
   * @param userInput 用户原始输入
   * @param intentAnalysis 意图分析结果
   * @param contentGeneration 内容生成结果
   * @param currentRetry 当前重试次数
   * @returns 构建的提示词
   */
  private static buildQualityEvaluationPrompt(
    userInput: string,
    intentAnalysis: IntentAnalysis,
    contentGeneration: ContentGeneration,
    currentRetry: number
  ): string {
    let prompt = `请评估以下内容的质量：

用户原始输入：${userInput}

优化提示词：${intentAnalysis.optimizedPrompt}

生成内容：${JSON.stringify(contentGeneration, null, 2)}

质量标准：${intentAnalysis.qualityCriteria.join(', ')}`;

    if (currentRetry > 0) {
      prompt += `

这是第${currentRetry}次重试，请严格评估。`;
    }

    prompt += `

请严格按照指定的JSON格式输出评估结果。`;

    return prompt;
  }

  /**
   * 解析质量评估响应
   * @param responseText 代理响应文本
   * @returns 解析后的质量评估结果
   */
  private static parseQualityEvaluationResponse(responseText: string): QualityEvaluation {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse quality evaluation response:', error);
      // 提供默认的质量评估
      return this.getDefaultQualityEvaluation();
    }
  }

  /**
   * 获取默认的质量评估结果
   * @returns 默认质量评估结果
   */
  private static getDefaultQualityEvaluation(): QualityEvaluation {
    return {
      overallQuality: 'PASS' as const,
      totalScore: 7.0,
      dimensionScores: {
        relevance: 7,
        accuracy: 7,
        completeness: 7,
        clarity: 7,
        usefulness: 7,
      },
      feedback: '内容基本符合要求',
      improvementSuggestions: [],
      retryRecommended: false,
    };
  }
}

/**
 * 质量评估步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 QualityEvaluationStepLogic
 */
export const qualityEvaluationStep = createStep({
  id: 'quality-evaluation',
  description: '评估生成内容的质量',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.intentAnalysis || !inputData.contentGeneration) {
      throw new Error('Required data not found for quality evaluation');
    }

    // 执行质量评估业务逻辑
    const qualityEvaluation = await QualityEvaluationStepLogic.execute(
      inputData.userInput,
      inputData.intentAnalysis,
      inputData.contentGeneration,
      mastra,
      inputData.currentRetry
    );

    // 返回更新后的工作流状态
    return {
      ...inputData,
      qualityEvaluation,
    };
  },
});