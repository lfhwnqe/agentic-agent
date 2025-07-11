import { Controller, Get, Post, Body } from '@nestjs/common';
import { MastraService } from './mastra.service';

@Controller('mastra')
export class MastraController {
  constructor(private readonly mastraService: MastraService) {}

  @Get('agents')
  getAgents() {
    return this.mastraService.getAgents();
  }

  @Get('workflows')
  getWorkflows() {
    return this.mastraService.getWorkflows();
  }

  @Post('intelligent-workflow')
  async runIntelligentWorkflow(@Body() input: any) {
    try {
      const result = await this.mastraService.runIntelligentWorkflow(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('trade-workflow')
  async runTradeWorkflow(@Body() input: any) {
    try {
      const result = await this.mastraService.runTradeWorkflow(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
