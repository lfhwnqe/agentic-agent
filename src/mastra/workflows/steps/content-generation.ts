import { createStep } from '@mastra/core/workflows';
import {
  workflowStateSchema,
  WorkflowState,
  ContentGeneration,
  IntentAnalysis
} from '../types';

/**
 * 内容生成步骤业务逻辑
 * 负责基于优化提示词生成高质量内容
 */
export class ContentGenerationStepLogic {
  /**
   * 执行内容生成
   * @param intentAnalysis 意图分析结果
   * @param mastra Mastra 实例
   * @param improvementSuggestions 改进建议（用于重试）
   * @returns 内容生成结果
   */
  static async execute(
    intentAnalysis: IntentAnalysis,
    mastra: any,
    improvementSuggestions?: string[]
  ): Promise<ContentGeneration> {
    const agent = mastra?.getAgent('contentGeneratorAgent');
    if (!agent) {
      throw new Error('Content Generator Agent not found');
    }

    const prompt = this.buildContentGenerationPrompt(intentAnalysis, improvementSuggestions);

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return this.parseContentGenerationResponse(response.text);
  }

  /**
   * 构建内容生成提示词
   * @param intentAnalysis 意图分析结果
   * @param improvementSuggestions 改进建议
   * @returns 构建的提示词
   */
  private static buildContentGenerationPrompt(
    intentAnalysis: IntentAnalysis,
    improvementSuggestions?: string[]
  ): string {
    let prompt = `请根据以下优化后的提示词生成高质量内容：

优化提示词：${intentAnalysis.optimizedPrompt}

期望输出类型：${intentAnalysis.expectedOutputType}

上下文提示：${intentAnalysis.contextualHints.join(', ')}

质量标准：${intentAnalysis.qualityCriteria.join(', ')}`;

    if (improvementSuggestions && improvementSuggestions.length > 0) {
      prompt += `

之前的改进建议：${improvementSuggestions.join(', ')}`;
    }

    prompt += `

请严格按照指定的JSON格式输出生成结果。`;

    return prompt;
  }

  /**
   * 解析内容生成响应
   * @param responseText 代理响应文本
   * @returns 解析后的内容生成结果
   */
  private static parseContentGenerationResponse(responseText: string): ContentGeneration {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse content generation response:', error);
      // 提供默认的内容生成
      return this.getDefaultContentGeneration(responseText);
    }
  }

  /**
   * 获取默认的内容生成结果
   * @param responseText 原始响应文本
   * @returns 默认内容生成结果
   */
  private static getDefaultContentGeneration(responseText: string): ContentGeneration {
    return {
      generatedContent: responseText,
      contentType: '一般回答',
      keyPoints: ['主要信息'],
      additionalInfo: '无额外信息',
      confidence: 0.7,
      sources: ['AI生成'],
    };
  }
}

/**
 * 内容生成步骤定义
 * 只负责步骤的配置和数据流转，具体业务逻辑委托给 ContentGenerationStepLogic
 */
export const contentGenerationStep = createStep({
  id: 'content-generation',
  description: '基于优化提示词生成内容',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData.intentAnalysis) {
      throw new Error('Intent analysis data not found');
    }

    // 执行内容生成业务逻辑
    const contentGeneration = await ContentGenerationStepLogic.execute(
      inputData.intentAnalysis,
      mastra
    );

    // 返回更新后的工作流状态
    return {
      ...inputData,
      contentGeneration,
    };
  },
});