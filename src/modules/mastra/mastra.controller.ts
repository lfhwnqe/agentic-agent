import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MastraService } from './mastra.service';
import {
  IntelligentWorkflowInputDto,
  WorkflowResponseDto,
  HealthCheckResponseDto,
} from './dto/intelligent-workflow.dto';

@ApiTags('mastra')
@Controller('mastra')
export class MastraController {
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
