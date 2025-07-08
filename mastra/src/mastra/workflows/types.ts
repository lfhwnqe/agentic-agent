import { z } from 'zod';

// 用户输入数据模式
export const userInputSchema = z.object({
  userInput: z.string().describe('用户的原始输入'),
  maxRetries: z.number().default(3).describe('最大重试次数'),
});

// 意图分析结果模式
export const intentAnalysisSchema = z.object({
  originalInput: z.string(),
  analyzedIntent: z.string(),
  optimizedPrompt: z.string(),
  expectedOutputType: z.string(),
  contextualHints: z.array(z.string()),
  qualityCriteria: z.array(z.string()),
});

// 内容生成结果模式
export const contentGenerationSchema = z.object({
  generatedContent: z.string(),
  contentType: z.string(),
  keyPoints: z.array(z.string()),
  additionalInfo: z.string(),
  confidence: z.number(),
  sources: z.array(z.string()),
});

// 质量评估结果模式
export const qualityEvaluationSchema = z.object({
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

// 工作流状态模式
export const workflowStateSchema = z.object({
  userInput: z.string(),
  maxRetries: z.number(),
  currentRetry: z.number().default(0),
  intentAnalysis: intentAnalysisSchema.optional(),
  contentGeneration: contentGenerationSchema.optional(),
  qualityEvaluation: qualityEvaluationSchema.optional(),
  finalResult: z.any().optional(),
});

// 最终输出结果模式
export const finalOutputSchema = z.object({
  success: z.boolean(),
  userInput: z.string(),
  intentAnalysis: intentAnalysisSchema,
  finalContent: contentGenerationSchema,
  qualityEvaluation: qualityEvaluationSchema,
  totalRetries: z.number(),
  processingTime: z.string(),
});

// TypeScript 类型定义
export type UserInput = z.infer<typeof userInputSchema>;
export type IntentAnalysis = z.infer<typeof intentAnalysisSchema>;
export type ContentGeneration = z.infer<typeof contentGenerationSchema>;
export type QualityEvaluation = z.infer<typeof qualityEvaluationSchema>;
export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type FinalOutput = z.infer<typeof finalOutputSchema>;

// 步骤执行上下文接口
export interface StepExecutionContext {
  inputData: WorkflowState;
  mastra?: any; // Mastra 实例
}

// 步骤执行结果接口
export interface StepExecutionResult<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// 通用步骤接口
export interface WorkflowStep<TInput = any, TOutput = any> {
  id: string;
  description: string;
  execute: (context: StepExecutionContext) => Promise<TOutput>;
}