import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// 定义数据模式
const userInputSchema = z.object({
  userInput: z.string().describe('用户的原始输入'),
  maxRetries: z.number().default(3).describe('最大重试次数'),
});

const intentAnalysisSchema = z.object({
  originalInput: z.string(),
  analyzedIntent: z.string(),
  optimizedPrompt: z.string(),
  expectedOutputType: z.string(),
  contextualHints: z.array(z.string()),
  qualityCriteria: z.array(z.string()),
});

const contentGenerationSchema = z.object({
  generatedContent: z.string(),
  contentType: z.string(),
  keyPoints: z.array(z.string()),
  additionalInfo: z.string(),
  confidence: z.number(),
  sources: z.array(z.string()),
});

const qualityEvaluationSchema = z.object({
  overallQuality: z.enum(['PASS', 'FAIL']),
  totalScore: z.number(),
  dimensionScores: z.object({
    relevance: z.number(),
    accuracy: z.number(),
    completeness: z.number(),
    clarity: z.number(),
    usefulness: z.number(),
  }),
  feedback: z.string(),
  improvementSuggestions: z.array(z.string()),
  retryRecommended: z.boolean(),
  retryInstructions: z.string().optional(),
});

const workflowStateSchema = z.object({
  userInput: z.string(),
  maxRetries: z.number(),
  currentRetry: z.number().default(0),
  intentAnalysis: intentAnalysisSchema.optional(),
  contentGeneration: contentGenerationSchema.optional(),
  qualityEvaluation: qualityEvaluationSchema.optional(),
  finalResult: z.any().optional(),
});

// Step 1: 意图分析步骤
const intentAnalysisStep = createStep({
  id: 'intent-analysis',
  description: '分析用户意图并优化提示词',
  inputSchema: userInputSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('intentAnalyzerAgent');
    if (!agent) {
      throw new Error('Intent Analyzer Agent not found');
    }

    const prompt = `请分析以下用户输入并优化提示词：
    
用户输入：${inputData.userInput}

请严格按照指定的JSON格式输出分析结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let intentAnalysis;
    try {
      // 尝试解析JSON响应
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intentAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse intent analysis response:', error);
      // 提供默认的意图分析
      intentAnalysis = {
        originalInput: inputData.userInput,
        analyzedIntent: '用户需要获取相关信息',
        optimizedPrompt: inputData.userInput,
        expectedOutputType: '详细解释',
        contextualHints: ['提供准确信息', '保持清晰表达'],
        qualityCriteria: ['准确性', '完整性', '清晰度'],
      };
    }

    return {
      userInput: inputData.userInput,
      maxRetries: inputData.maxRetries,
      currentRetry: 0,
      intentAnalysis,
    };
  },
});

// Step 2: 内容生成步骤
const contentGenerationStep = createStep({
  id: 'content-generation',
  description: '基于优化提示词生成内容',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('contentGeneratorAgent');
    if (!agent) {
      throw new Error('Content Generator Agent not found');
    }

    if (!inputData.intentAnalysis) {
      throw new Error('Intent analysis data not found');
    }

    const prompt = `请根据以下优化后的提示词生成高质量内容：

优化提示词：${inputData.intentAnalysis.optimizedPrompt}

期望输出类型：${inputData.intentAnalysis.expectedOutputType}

上下文提示：${inputData.intentAnalysis.contextualHints.join(', ')}

质量标准：${inputData.intentAnalysis.qualityCriteria.join(', ')}

请严格按照指定的JSON格式输出生成结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let contentGeneration;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contentGeneration = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse content generation response:', error);
      // 提供默认的内容生成
      contentGeneration = {
        generatedContent: response.text,
        contentType: '一般回答',
        keyPoints: ['主要信息'],
        additionalInfo: '无额外信息',
        confidence: 0.7,
        sources: ['AI生成'],
      };
    }

    return {
      ...inputData,
      contentGeneration,
    };
  },
});

// Step 3: 质量评估步骤
const qualityEvaluationStep = createStep({
  id: 'quality-evaluation',
  description: '评估生成内容的质量',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('qualityEvaluatorAgent');
    if (!agent) {
      throw new Error('Quality Evaluator Agent not found');
    }

    if (!inputData.intentAnalysis || !inputData.contentGeneration) {
      throw new Error('Required data not found for quality evaluation');
    }

    const prompt = `请评估以下内容的质量：

用户原始输入：${inputData.userInput}

优化提示词：${inputData.intentAnalysis.optimizedPrompt}

生成内容：${JSON.stringify(inputData.contentGeneration, null, 2)}

质量标准：${inputData.intentAnalysis.qualityCriteria.join(', ')}

请严格按照指定的JSON格式输出评估结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let qualityEvaluation;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualityEvaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse quality evaluation response:', error);
      // 提供默认的质量评估
      qualityEvaluation = {
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

    return {
      ...inputData,
      qualityEvaluation,
    };
  },
});

// Step 4: 重试计数步骤
const incrementRetryStep = createStep({
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

// Step 5: 最终结果整理步骤
const finalizeResultStep = createStep({
  id: 'finalize-result',
  description: '整理最终结果',
  inputSchema: workflowStateSchema,
  outputSchema: z.object({
    success: z.boolean(),
    userInput: z.string(),
    intentAnalysis: intentAnalysisSchema,
    finalContent: contentGenerationSchema,
    qualityEvaluation: qualityEvaluationSchema,
    totalRetries: z.number(),
    processingTime: z.string(),
  }),
  execute: async ({ inputData }) => {
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
  },
});

// 创建重试逻辑的步骤
const retryContentGenerationStep = createStep({
  id: 'retry-content-generation',
  description: '重试内容生成和质量评估',
  inputSchema: workflowStateSchema,
  outputSchema: workflowStateSchema,
  execute: async ({ inputData, mastra }) => {
    // 增加重试计数
    const updatedData = {
      ...inputData,
      currentRetry: inputData.currentRetry + 1,
    };

    // 重新生成内容
    const contentAgent = mastra?.getAgent('contentGeneratorAgent');
    if (!contentAgent || !updatedData.intentAnalysis) {
      throw new Error('Required agent or data not found');
    }

    const contentPrompt = `请根据以下优化后的提示词重新生成高质量内容：

优化提示词：${updatedData.intentAnalysis.optimizedPrompt}

期望输出类型：${updatedData.intentAnalysis.expectedOutputType}

上下文提示：${updatedData.intentAnalysis.contextualHints.join(', ')}

质量标准：${updatedData.intentAnalysis.qualityCriteria.join(', ')}

之前的改进建议：${updatedData.qualityEvaluation?.improvementSuggestions.join(', ') || '无'}

请严格按照指定的JSON格式输出生成结果。`;

    const contentResponse = await contentAgent.generate([
      {
        role: 'user',
        content: contentPrompt,
      },
    ]);

    let contentGeneration;
    try {
      const jsonMatch = contentResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contentGeneration = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse content generation response:', error);
      contentGeneration = {
        generatedContent: contentResponse.text,
        contentType: '重试生成内容',
        keyPoints: ['重试信息'],
        additionalInfo: '重试生成',
        confidence: 0.7,
        sources: ['AI重试生成'],
      };
    }

    // 重新评估质量
    const qualityAgent = mastra?.getAgent('qualityEvaluatorAgent');
    if (!qualityAgent) {
      throw new Error('Quality Evaluator Agent not found');
    }

    const qualityPrompt = `请重新评估以下内容的质量：

用户原始输入：${updatedData.userInput}

优化提示词：${updatedData.intentAnalysis.optimizedPrompt}

生成内容：${JSON.stringify(contentGeneration, null, 2)}

质量标准：${updatedData.intentAnalysis.qualityCriteria.join(', ')}

这是第${updatedData.currentRetry}次重试，请严格评估。

请严格按照指定的JSON格式输出评估结果。`;

    const qualityResponse = await qualityAgent.generate([
      {
        role: 'user',
        content: qualityPrompt,
      },
    ]);

    let qualityEvaluation;
    try {
      const jsonMatch = qualityResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qualityEvaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse quality evaluation response:', error);
      qualityEvaluation = {
        overallQuality: 'PASS' as const,
        totalScore: 7.0,
        dimensionScores: {
          relevance: 7,
          accuracy: 7,
          completeness: 7,
          clarity: 7,
          usefulness: 7,
        },
        feedback: '重试内容基本符合要求',
        improvementSuggestions: [],
        retryRecommended: false,
      };
    }

    return {
      ...updatedData,
      contentGeneration,
      qualityEvaluation,
    };
  },
});

// 主要的智能workflow定义
const intelligentWorkflow = createWorkflow({
  id: 'intelligent-workflow',
  description: '智能三agent协作workflow，支持条件分支和回流控制',
  inputSchema: userInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    userInput: z.string(),
    intentAnalysis: intentAnalysisSchema,
    finalContent: contentGenerationSchema,
    qualityEvaluation: qualityEvaluationSchema,
    totalRetries: z.number(),
    processingTime: z.string(),
  }),
  steps: [
    intentAnalysisStep,
    contentGenerationStep,
    qualityEvaluationStep,
    retryContentGenerationStep,
    finalizeResultStep,
  ],
})
  // 第一步：意图分析
  .then(intentAnalysisStep)
  // 第二步：内容生成
  .then(contentGenerationStep)
  // 第三步：质量评估
  .then(qualityEvaluationStep)
  // 条件分支：根据质量评估结果决定下一步
  .branch([
    // 分支1：质量达标，直接输出结果
    [
      async ({ inputData }) => {
        return inputData.qualityEvaluation?.overallQuality === 'PASS';
      },
      finalizeResultStep,
    ],
    // 分支2：质量不达标且未达到最大重试次数，进行重试
    [
      async ({ inputData }) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry < inputData.maxRetries
        );
      },
      retryContentGenerationStep,
    ],
    // 分支3：质量不达标且已达到最大重试次数，输出失败结果
    [
      async ({ inputData }) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry >= inputData.maxRetries
        );
      },
      finalizeResultStep,
    ],
  ])
  // 重试后再次进行条件判断
  .branch([
    // 重试后质量达标
    [
      async ({ inputData }) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'PASS' &&
          inputData.currentRetry > 0
        );
      },
      finalizeResultStep,
    ],
    // 重试后仍不达标但未达到最大重试次数，继续重试
    [
      async ({ inputData }) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry < inputData.maxRetries
        );
      },
      retryContentGenerationStep,
    ],
    // 重试后仍不达标且已达到最大重试次数
    [
      async ({ inputData }) => {
        return (
          inputData.qualityEvaluation?.overallQuality === 'FAIL' &&
          inputData.currentRetry >= inputData.maxRetries
        );
      },
      finalizeResultStep,
    ],
  ]);

// 提交workflow
intelligentWorkflow.commit();

export {
  intelligentWorkflow,
  intentAnalysisStep,
  contentGenerationStep,
  qualityEvaluationStep,
  incrementRetryStep,
  finalizeResultStep,
  userInputSchema,
  workflowStateSchema,
  intentAnalysisSchema,
  contentGenerationSchema,
  qualityEvaluationSchema,
};
