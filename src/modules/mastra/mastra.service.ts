import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';

export interface IntelligentWorkflowInput {
  userInput: string;
  maxRetries?: number;
}

@Injectable()
export class MastraService implements OnModuleInit {
  private readonly logger = new Logger(MastraService.name);
  private mastra: any;

  constructor(private readonly configService: AppConfigService) {}

  async onModuleInit() {
    try {
      // 验证配置
      this.configService.validateConfig();

      // 设置环境变量以确保Mastra能够访问
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = this.configService.googleApiKey;

      // 动态导入Mastra实例
      const { mastra } = await import('../../../mastra/src/mastra/index');
      this.mastra = mastra;

      this.logger.log('Mastra service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Mastra service', error);
      throw error;
    }
  }

  /**
   * 执行智能工作流
   */
  async runIntelligentWorkflow(input: IntelligentWorkflowInput) {
    if (!this.mastra) {
      throw new Error('Mastra service not initialized');
    }

    try {
      const workflow = this.mastra.getWorkflow('intelligentWorkflow');
      const run = workflow.createRun();

      const result = await run.start({
        inputData: {
          userInput: input.userInput,
          maxRetries: input.maxRetries || this.configService.workflowMaxRetries,
        },
      });

      this.logger.log(
        `Intelligent workflow completed for input: ${input.userInput}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to run intelligent workflow', error);
      throw error;
    }
  }
}
