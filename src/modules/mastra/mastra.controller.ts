import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MastraService, IntelligentWorkflowInput } from './mastra.service';

@Controller('mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  /**
   * 执行智能工作流
   */
  @Post('workflows/intelligent')
  async runIntelligentWorkflow(@Body() input: IntelligentWorkflowInput) {
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
  healthCheck() {
    return {
      success: true,
      message: 'Mastra service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
