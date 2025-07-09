import { z } from 'zod';

// 用户交易输入数据模式
export const tradeUserInputSchema = z.object({
  userInput: z.string().describe('用户的原始交易需求'),
  maxRetries: z.number().default(3).describe('最大重试次数'),
});

// 交易分析结果模式
export const tradeAnalysisSchema = z.object({
  originalInput: z.string(),
  analyzedIntent: z.string(),
  optimizedPrompt: z.string(),
  expectedOutputType: z.string(),
  contextualHints: z.array(z.string()),
  qualityCriteria: z.array(z.string()),
});

// 交易策略生成结果模式
export const tradeStrategySchema = z.object({
  generatedStrategy: z.string(),
  strategyType: z.string(),
  keyPoints: z.array(z.string()),
  riskManagement: z.string(),
  confidence: z.number(),
  marketConditions: z.array(z.string()),
});

// 交易评估结果模式
export const tradeEvaluationSchema = z.object({
  overallQuality: z.enum(['PASS', 'FAIL']),
  totalScore: z.number(),
  dimensionScores: z.object({
    relevance: z.number(),
    feasibility: z.number(),
    riskControl: z.number(),
    profitPotential: z.number(),
    usefulness: z.number(),
  }),
  feedback: z.string(),
  improvementSuggestions: z.array(z.string()),
  retryRecommended: z.boolean(),
  retryInstructions: z.string().optional(),
});

// 交易工作流状态模式
export const tradeWorkflowStateSchema = z.object({
  userInput: z.string(),
  maxRetries: z.number(),
  currentRetry: z.number().default(0),
  tradeAnalysis: tradeAnalysisSchema.optional(),
  tradeStrategy: tradeStrategySchema.optional(),
  tradeEvaluation: tradeEvaluationSchema.optional(),
  finalResult: z.any().optional(),
});

// 最终交易输出结果模式
export const tradeFinalOutputSchema = z.object({
  success: z.boolean(),
  userInput: z.string(),
  tradeAnalysis: tradeAnalysisSchema,
  finalStrategy: tradeStrategySchema,
  tradeEvaluation: tradeEvaluationSchema,
  totalRetries: z.number(),
  processingTime: z.string(),
});

// TypeScript 类型定义
export type TradeUserInput = z.infer<typeof tradeUserInputSchema>;
export type TradeAnalysis = z.infer<typeof tradeAnalysisSchema>;
export type TradeStrategy = z.infer<typeof tradeStrategySchema>;
export type TradeEvaluation = z.infer<typeof tradeEvaluationSchema>;
export type TradeWorkflowState = z.infer<typeof tradeWorkflowStateSchema>;
export type TradeFinalOutput = z.infer<typeof tradeFinalOutputSchema>;

// 步骤执行上下文接口
export interface TradeStepExecutionContext {
  inputData: TradeWorkflowState;
  mastra?: any; // Mastra 实例
}

// 步骤执行结果接口
export interface TradeStepExecutionResult<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

// 通用交易步骤接口
export interface TradeWorkflowStep<TInput = any, TOutput = any> {
  id: string;
  description: string;
  execute: (context: TradeStepExecutionContext) => Promise<TOutput>;
}
