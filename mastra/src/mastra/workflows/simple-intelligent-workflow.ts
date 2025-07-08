import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// 定义输入输出模式
const inputSchema = z.object({
  userInput: z.string().describe('用户的原始输入'),
  maxRetries: z.number().default(3).describe('最大重试次数'),
});

const outputSchema = z.object({
  success: z.boolean(),
  userInput: z.string(),
  intentAnalysis: z.string(),
  finalContent: z.string(),
  qualityScore: z.number(),
  totalRetries: z.number(),
  processingTime: z.string(),
});

// Step 1: 意图分析步骤
const intentAnalysisStep = createStep({
  id: 'intent-analysis',
  description: '分析用户意图并优化提示词',
  inputSchema,
  outputSchema: z.object({
    userInput: z.string(),
    maxRetries: z.number(),
    intentAnalysis: z.string(),
    optimizedPrompt: z.string(),
  }),
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

    // 简化处理，直接使用响应文本
    const intentAnalysis = response.text;
    
    // 尝试提取优化后的提示词
    let optimizedPrompt = inputData.userInput;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        optimizedPrompt = parsed.optimizedPrompt || inputData.userInput;
      }
    } catch (error) {
      console.log('使用原始输入作为提示词');
    }

    return {
      userInput: inputData.userInput,
      maxRetries: inputData.maxRetries,
      intentAnalysis,
      optimizedPrompt,
    };
  },
});

// Step 2: 内容生成步骤
const contentGenerationStep = createStep({
  id: 'content-generation',
  description: '基于优化提示词生成内容',
  inputSchema: z.object({
    userInput: z.string(),
    maxRetries: z.number(),
    intentAnalysis: z.string(),
    optimizedPrompt: z.string(),
  }),
  outputSchema: z.object({
    userInput: z.string(),
    maxRetries: z.number(),
    intentAnalysis: z.string(),
    optimizedPrompt: z.string(),
    generatedContent: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('contentGeneratorAgent');
    if (!agent) {
      throw new Error('Content Generator Agent not found');
    }

    const prompt = `请根据以下优化后的提示词生成高质量内容：

优化提示词：${inputData.optimizedPrompt}

请严格按照指定的JSON格式输出生成结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    return {
      ...inputData,
      generatedContent: response.text,
    };
  },
});

// Step 3: 质量评估步骤
const qualityEvaluationStep = createStep({
  id: 'quality-evaluation',
  description: '评估生成内容的质量',
  inputSchema: z.object({
    userInput: z.string(),
    maxRetries: z.number(),
    intentAnalysis: z.string(),
    optimizedPrompt: z.string(),
    generatedContent: z.string(),
  }),
  outputSchema: z.object({
    userInput: z.string(),
    maxRetries: z.number(),
    intentAnalysis: z.string(),
    optimizedPrompt: z.string(),
    generatedContent: z.string(),
    qualityEvaluation: z.string(),
    qualityScore: z.number(),
    isQualityAcceptable: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('qualityEvaluatorAgent');
    if (!agent) {
      throw new Error('Quality Evaluator Agent not found');
    }

    const prompt = `请评估以下内容的质量：

用户原始输入：${inputData.userInput}

优化提示词：${inputData.optimizedPrompt}

生成内容：${inputData.generatedContent}

请严格按照指定的JSON格式输出评估结果。`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // 尝试解析质量分数
    let qualityScore = 7.0;
    let isQualityAcceptable = true;
    
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        qualityScore = parsed.totalScore || 7.0;
        isQualityAcceptable = parsed.overallQuality === 'PASS' || qualityScore >= 7.0;
      }
    } catch (error) {
      console.log('使用默认质量评估');
    }

    return {
      ...inputData,
      qualityEvaluation: response.text,
      qualityScore,
      isQualityAcceptable,
    };
  },
});

// Step 4: 最终结果整理步骤
const finalizeResultStep = createStep({
  id: 'finalize-result',
  description: '整理最终结果',
  inputSchema: z.object({
    userInput: z.string(),
    maxRetries: z.number(),
    intentAnalysis: z.string(),
    optimizedPrompt: z.string(),
    generatedContent: z.string(),
    qualityEvaluation: z.string(),
    qualityScore: z.number(),
    isQualityAcceptable: z.boolean(),
    retryCount: z.number().optional(),
  }),
  outputSchema,
  execute: async ({ inputData }) => {
    return {
      success: inputData.isQualityAcceptable,
      userInput: inputData.userInput,
      intentAnalysis: inputData.intentAnalysis,
      finalContent: inputData.generatedContent,
      qualityScore: inputData.qualityScore,
      totalRetries: inputData.retryCount || 0,
      processingTime: new Date().toISOString(),
    };
  },
});

// 创建简化的智能workflow
const simpleIntelligentWorkflow = createWorkflow({
  id: 'simple-intelligent-workflow',
  description: '简化版智能三agent协作workflow',
  inputSchema,
  outputSchema,
})
  .then(intentAnalysisStep)
  .then(contentGenerationStep)
  .then(qualityEvaluationStep)
  .then(finalizeResultStep);

simpleIntelligentWorkflow.commit();

export { simpleIntelligentWorkflow };
