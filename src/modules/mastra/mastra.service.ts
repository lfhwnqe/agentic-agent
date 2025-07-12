import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';

export interface IntelligentWorkflowInput {
  userInput: string;
  maxRetries?: number;
}

export interface TradeWorkflowInput {
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
      process.env.GOOGLE_GENERATIVE_AI_API_KEY =
        this.configService.googleApiKey;

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

    const startTime = Date.now();
    this.logger.log(`Starting intelligent workflow for input: "${input.userInput}"`);

    try {
      const workflow = this.mastra.getWorkflow('intelligentWorkflow');
      const run = workflow.createRun();

      this.logger.log('Executing intelligent workflow steps...');
      const result = await run.start({
        inputData: {
          userInput: input.userInput,
          maxRetries: input.maxRetries || this.configService.workflowMaxRetries,
        },
      });

      const executionTime = Date.now() - startTime;
      this.logger.log(
        `Intelligent workflow completed successfully in ${executionTime}ms for input: "${input.userInput}"`,
      );
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `Failed to run intelligent workflow after ${executionTime}ms for input: "${input.userInput}"`,
        error,
      );
      throw error;
    }
  }

  /**
   * 执行交易工作流
   */
  async runTradeWorkflow(input: TradeWorkflowInput): Promise<any> {
    if (!this.mastra) {
      throw new Error('Mastra service not initialized');
    }

    const startTime = Date.now();
    this.logger.log(`Starting trade workflow for input: "${input.userInput}"`);
    this.logger.log(`Trade workflow parameters: maxRetries=${input.maxRetries || this.configService.workflowMaxRetries}`);

    try {
      // 获取交易工作流
      const workflow = this.mastra.getWorkflow('tradeWorkflow');
      if (!workflow) {
        throw new Error('Trade workflow not found in Mastra instance');
      }

      // 创建工作流运行实例
      const run = workflow.createRun();
      this.logger.log('Trade workflow run instance created');

      // 记录开始执行
      this.logger.log('Executing trade workflow steps: Analysis → Strategy Generation → Evaluation → Finalization');

      // 执行工作流
      const result = await run.start({
        inputData: {
          userInput: input.userInput,
          maxRetries: input.maxRetries || this.configService.workflowMaxRetries,
        },
      });

      const executionTime = Date.now() - startTime;

      // 记录成功完成
      this.logger.log(
        `Trade workflow completed successfully in ${executionTime}ms for input: "${input.userInput}"`,
      );

      // 记录结果摘要
      if (result && typeof result === 'object') {
        this.logger.log(`Trade workflow result summary:`, {
          success: result.success,
          totalRetries: result.totalRetries,
          strategyType: result.finalStrategy?.strategyType,
          overallQuality: result.tradeEvaluation?.overallQuality,
          processingTime: result.processingTime,
        });
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `Failed to run trade workflow after ${executionTime}ms for input: "${input.userInput}"`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          executionTime,
          inputLength: input.userInput.length,
          maxRetries: input.maxRetries || this.configService.workflowMaxRetries,
        },
      );
      throw error;
    }
  }
}
