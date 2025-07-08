/**
 * 增强版意图分析步骤
 * 展示如何使用配置管理、日志记录和错误处理工具
 */

import { createStep } from '@mastra/core/workflows';
import {
  userInputSchema,
  workflowStateSchema,
  WorkflowState,
  IntentAnalysis
} from '../types';
import { getWorkflowConfig } from '../config';
import { createWorkflowUtils } from '../utils';

/**
 * 增强版意图分析步骤业务逻辑
 * 集成了配置管理、日志记录、错误处理和性能监控
 */
export class EnhancedIntentAnalysisStepLogic {
  private static config = getWorkflowConfig();
  private static utils = createWorkflowUtils(EnhancedIntentAnalysisStepLogic.config);

  /**
   * 执行意图分析（增强版）
   * @param userInput 用户输入
   * @param mastra Mastra 实例
   * @returns 意图分析结果
   */
  static async execute(userInput: string, mastra: any): Promise<IntentAnalysis> {
    const stepId = 'enhanced-intent-analysis';
    const { logger, errorHandler, performanceMonitor } = this.utils;

    logger.stepStart(stepId);
    const startTime = Date.now();

    try {
      // 获取代理
      const agentName = this.config.agents.intentAnalyzer;
      const agent = mastra?.getAgent(agentName);

      if (!agent) {
        throw errorHandler.handleAgentError(stepId, agentName, new Error('Agent not found'));
      }

      logger.debug(stepId, 'Starting intent analysis', { userInput, agentName });

      // 构建提示词
      const prompt = this.buildAnalysisPrompt(userInput);
      logger.debug(stepId, 'Built analysis prompt', { promptLength: prompt.length });

      // 调用代理（带超时）
      const response = await this.callAgentWithTimeout(agent, prompt, stepId);

      // 解析响应
      const result = this.parseIntentAnalysisResponse(response.text, userInput, stepId);

      // 记录性能指标
      const duration = Date.now() - startTime;
      performanceMonitor.recordStepDuration(stepId, duration);

      logger.stepEnd(stepId, true);
      logger.info(stepId, 'Intent analysis completed successfully', {
        analyzedIntent: result.analyzedIntent,
        duration: `${duration}ms`
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordStepDuration(stepId, duration);

      logger.stepEnd(stepId, false);
      throw errorHandler.handleStepError(stepId, error, { userInput });
    }
  }

  /**
   * 构建分析提示词
   */
  private static buildAnalysisPrompt(userInput: string): string {
    return `请分析以下用户输入并优化提示词：

用户输入：${userInput}

请严格按照以下JSON格式输出分析结果：
{
  "originalInput": "用户原始输入",
  "analyzedIntent": "分析得出的用户意图",
  "optimizedPrompt": "优化后的提示词",
  "expectedOutputType": "期望的输出类型",
  "contextualHints": ["上下文提示1", "上下文提示2"],
  "qualityCriteria": ["质量标准1", "质量标准2"]
}

注意：请确保输出是有效的JSON格式。`;
  }

  /**
   * 带超时的代理调用
   */
  private static async callAgentWithTimeout(agent: any, prompt: string, stepId: string): Promise<any> {
    const timeout = this.config.timeouts.intentAnalysis;
    const { logger } = this.utils;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Agent call timeout after ${timeout}ms`));
      }, timeout);

      agent.generate([{ role: 'user', content: prompt }])
        .then((response: any) => {
          clearTimeout(timer);
          logger.debug(stepId, 'Agent response received', {
            responseLength: response.text?.length || 0
          });
          resolve(response);
        })
        .catch((error: any) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 解析意图分析响应（增强版）
   */
  private static parseIntentAnalysisResponse(
    responseText: string,
    originalInput: string,
    stepId: string
  ): IntentAnalysis {
    const { logger } = this.utils;

    try {
      // 尝试解析JSON响应
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 验证解析结果的完整性
        this.validateParsedResult(parsed, stepId);

        logger.debug(stepId, 'Successfully parsed intent analysis response');
        return parsed;
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      logger.warn(stepId, 'Failed to parse intent analysis response, using default', { error });
      return this.getDefaultIntentAnalysis(originalInput);
    }
  }

  /**
   * 验证解析结果的完整性
   */
  private static validateParsedResult(parsed: any, stepId: string): void {
    const { logger } = this.utils;
    const requiredFields = [
      'originalInput', 'analyzedIntent', 'optimizedPrompt',
      'expectedOutputType', 'contextualHints', 'qualityCriteria'
    ];

    for (const field of requiredFields) {
      if (!parsed[field]) {
        logger.warn(stepId, `Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(parsed.contextualHints)) {
      logger.warn(stepId, 'contextualHints should be an array');
      parsed.contextualHints = [];
    }

    if (!Array.isArray(parsed.qualityCriteria)) {
      logger.warn(stepId, 'qualityCriteria should be an array');
      parsed.qualityCriteria = [];
    }
  }

  /**
   * 获取默认的意图分析结果（增强版）
   */
  private static getDefaultIntentAnalysis(originalInput: string): IntentAnalysis {
    const { logger } = this.utils;

    logger.info('enhanced-intent-analysis', 'Using default intent analysis result');

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
 * 增强版意图分析步骤定义
 */
export const enhancedIntentAnalysisStep = createStep({
  id: 'enhanced-intent-analysis',
  description: '增强版意图分析步骤，包含完整的日志记录和错误处理',
  inputSchema: userInputSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    const intentAnalysis = await EnhancedIntentAnalysisStepLogic.execute(
      inputData.userInput,
      mastra
    );

    return {
      userInput: inputData.userInput,
      maxRetries: inputData.maxRetries,
      currentRetry: 0,
      intentAnalysis,
    };
  },
});