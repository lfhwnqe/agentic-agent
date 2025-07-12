import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

/**
 * 交易工作流输入 DTO
 */
export class TradeWorkflowInputDto {
  @ApiProperty({
    description: '用户的交易需求或问题',
    example: '我想做股票短线交易，有什么好的策略？',
  })
  @IsString()
  userInput!: string;

  @ApiProperty({
    description: '最大重试次数',
    example: 3,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number;
}

/**
 * 交易分析结果 DTO
 */
export class TradeAnalysisDto {
  @ApiProperty({
    description: '原始用户输入',
    example: '我想做股票短线交易，有什么好的策略？',
  })
  originalInput!: string;

  @ApiProperty({
    description: '分析后的交易意图',
    example: '用户希望获得股票短线交易的具体策略建议',
  })
  analyzedIntent!: string;

  @ApiProperty({
    description: '优化后的策略提示词',
    example: '请提供适合股票短线交易的具体策略，包括入场时机、止损止盈设置等',
  })
  optimizedPrompt!: string;

  @ApiProperty({
    description: '期望输出类型',
    example: '交易策略方案',
  })
  expectedOutputType!: string;

  @ApiProperty({
    description: '上下文提示',
    example: ['关注技术指标', '控制风险', '设置止损'],
    type: [String],
  })
  contextualHints!: string[];

  @ApiProperty({
    description: '质量评估标准',
    example: ['策略可行性', '风险控制', '盈利潜力'],
    type: [String],
  })
  qualityCriteria!: string[];
}

/**
 * 交易策略 DTO
 */
export class TradeStrategyDto {
  @ApiProperty({
    description: '生成的交易策略',
    example: '基于移动平均线的短线交易策略...',
  })
  generatedStrategy!: string;

  @ApiProperty({
    description: '策略类型',
    example: '技术分析策略',
  })
  strategyType!: string;

  @ApiProperty({
    description: '策略要点',
    example: ['使用5日和20日移动平均线', '设置2%止损', '目标收益3%'],
    type: [String],
  })
  keyPoints!: string[];

  @ApiProperty({
    description: '风险管理措施',
    example: '严格执行止损，单次交易风险不超过总资金的2%',
  })
  riskManagement!: string;

  @ApiProperty({
    description: '策略信心度',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  confidence!: number;

  @ApiProperty({
    description: '适用市场条件',
    example: ['震荡市场', '中等波动率'],
    type: [String],
  })
  marketConditions!: string[];
}

/**
 * 交易评估 DTO
 */
export class TradeEvaluationDto {
  @ApiProperty({
    description: '整体质量评估',
    example: 'PASS',
    enum: ['PASS', 'FAIL'],
  })
  overallQuality!: 'PASS' | 'FAIL';

  @ApiProperty({
    description: '总分',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  totalScore!: number;

  @ApiProperty({
    description: '各维度评分',
    example: {
      relevance: 9,
      feasibility: 8,
      riskControl: 8,
      profitPotential: 8,
      usefulness: 9,
    },
  })
  dimensionScores!: {
    relevance: number;
    feasibility: number;
    riskControl: number;
    profitPotential: number;
    usefulness: number;
  };

  @ApiProperty({
    description: '评估反馈',
    example: '策略整体可行，风险控制措施合理，建议在实际操作中严格执行止损规则',
  })
  feedback!: string;

  @ApiProperty({
    description: '改进建议',
    example: ['可以考虑加入成交量指标', '建议设置更严格的入场条件'],
    type: [String],
  })
  improvementSuggestions!: string[];

  @ApiProperty({
    description: '是否建议重试',
    example: false,
  })
  retryRecommended!: boolean;

  @ApiProperty({
    description: '重试指导（可选）',
    example: '如需重试，建议优化风险控制部分',
    required: false,
  })
  retryInstructions?: string;
}

/**
 * 交易工作流最终输出 DTO
 */
export class TradeFinalOutputDto {
  @ApiProperty({
    description: '执行是否成功',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: '用户原始输入',
    example: '我想做股票短线交易，有什么好的策略？',
  })
  userInput!: string;

  @ApiProperty({
    description: '交易分析结果',
    type: TradeAnalysisDto,
  })
  tradeAnalysis!: TradeAnalysisDto;

  @ApiProperty({
    description: '最终交易策略',
    type: TradeStrategyDto,
  })
  finalStrategy!: TradeStrategyDto;

  @ApiProperty({
    description: '交易评估结果',
    type: TradeEvaluationDto,
  })
  tradeEvaluation!: TradeEvaluationDto;

  @ApiProperty({
    description: '总重试次数',
    example: 1,
  })
  totalRetries!: number;

  @ApiProperty({
    description: '处理时间',
    example: '2500ms',
  })
  processingTime!: string;
}

/**
 * 交易工作流响应 DTO
 */
export class TradeWorkflowResponseDto {
  @ApiProperty({
    description: '请求是否成功',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: '交易工作流执行结果',
    type: TradeFinalOutputDto,
    required: false,
  })
  data?: TradeFinalOutputDto;

  @ApiProperty({
    description: '错误信息（仅在失败时返回）',
    example: 'Failed to run trade workflow',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: '详细错误信息（仅在失败时返回）',
    example: 'Trade analyzer agent not found',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: '请求时间戳',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp!: string;
}
