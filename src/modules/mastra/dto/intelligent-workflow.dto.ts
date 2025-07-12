import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class IntelligentWorkflowInputDto {
  @ApiProperty({
    description: '用户输入的问题或需求',
    example: '什么是人工智能？',
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

export class WorkflowResponseDto {
  @ApiProperty({
    description: '请求是否成功',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: '工作流执行结果',
    example: {
      finalResult: {
        content: '人工智能是...',
        quality: 'PASS',
      },
    },
  })
  data?: any;

  @ApiProperty({
    description: '错误信息（仅在失败时返回）',
    example: 'Failed to run intelligent workflow',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: '详细错误信息（仅在失败时返回）',
    example: 'API key not provided',
    required: false,
  })
  error?: string;
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: '健康检查是否成功',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: '健康检查消息',
    example: 'Mastra service is running',
  })
  message!: string;

  @ApiProperty({
    description: '检查时间戳',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp!: string;
}
