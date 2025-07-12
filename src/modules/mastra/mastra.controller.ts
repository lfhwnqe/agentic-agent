import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MastraService } from './mastra.service';
import {
  IntelligentWorkflowInputDto,
  WorkflowResponseDto,
  HealthCheckResponseDto,
} from './dto/intelligent-workflow.dto';
import {
  TradeWorkflowInputDto,
  TradeWorkflowResponseDto,
} from './dto/trade-workflow.dto';

@ApiTags('mastra')
@Controller('mastra')
export class MastraController {
  private readonly logger = new Logger(MastraController.name);

  constructor(private readonly mastraService: MastraService) {}

  /**
   * 执行智能工作流
   */
  @Post('workflows/intelligent')
  @ApiOperation({
    summary: '执行智能工作流',
    description:
      '使用三代理协作系统（意图分析、内容生成、质量评估）处理用户输入',
  })
  @ApiBody({ type: IntelligentWorkflowInputDto })
  @ApiResponse({
    status: 200,
    description: '工作流执行成功',
    type: WorkflowResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: '工作流执行失败',
    type: WorkflowResponseDto,
  })
  async runIntelligentWorkflow(@Body() input: IntelligentWorkflowInputDto) {
    try {
      const result = await this.mastraService.runIntelligentWorkflow(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to run intelligent workflow',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 执行交易工作流
   */
  @Post('workflows/trade')
  @ApiOperation({
    summary: '执行交易工作流',
    description:
      '使用三代理协作系统（交易分析、策略生成、交易评估）处理用户的交易需求',
  })
  @ApiBody({ type: TradeWorkflowInputDto })
  @ApiResponse({
    status: 200,
    description: '交易工作流执行成功',
    type: TradeWorkflowResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: '交易工作流执行失败',
    type: TradeWorkflowResponseDto,
  })
  async runTradeWorkflow(
    @Body() input: TradeWorkflowInputDto,
  ): Promise<TradeWorkflowResponseDto> {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`[${requestId}] Trade workflow request started`, {
      userInput:
        input.userInput.substring(0, 100) +
        (input.userInput.length > 100 ? '...' : ''),
      maxRetries: input.maxRetries,
      timestamp: new Date().toISOString(),
    });

    try {
      // 执行交易工作流
      this.logger.log(`[${requestId}] Executing trade workflow...`);
      const result = await this.mastraService.runTradeWorkflow(input);

      const executionTime = Date.now() - startTime;

      // 记录成功完成
      this.logger.log(`[${requestId}] Trade workflow completed successfully`, {
        executionTime: `${executionTime}ms`,
        success: result?.success,
        totalRetries: result?.totalRetries,
        strategyType: result?.finalStrategy?.strategyType,
        overallQuality: result?.tradeEvaluation?.overallQuality,
      });

      return {
        success: true,
        data: result as any,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // 记录错误详情
      this.logger.error(`[${requestId}] Trade workflow failed`, {
        executionTime: `${executionTime}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userInputLength: input.userInput.length,
        maxRetries: input.maxRetries,
      });

      throw new HttpException(
        {
          success: false,
          message: 'Failed to run trade workflow',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 健康检查
   */
  @Get('health')
  @ApiOperation({
    summary: '健康检查',
    description: '检查Mastra服务是否正常运行',
  })
  @ApiResponse({
    status: 200,
    description: '服务运行正常',
    type: HealthCheckResponseDto,
  })
  healthCheck(): HealthCheckResponseDto {
    return {
      success: true,
      message: 'Mastra service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
