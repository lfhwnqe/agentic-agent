import { Injectable, Logger } from '@nestjs/common';
import { mastra } from './mastra/src/mastra/index.js';

export interface IntelligentWorkflowInput {
  userInput: string;
  maxRetries?: number;
}

@Injectable()
export class MastraService {
  private readonly logger = new Logger(MastraService.name);

  constructor() {
    this.logger.log('Mastra service initialized');
  }

  /**
   * 执行智能工作流
   */
  async runIntelligentWorkflow(input: IntelligentWorkflowInput) {
    try {
      const workflow = mastra.getWorkflow('intelligentWorkflow');
      const run = workflow.createRun();

      const result = await run.start({
        inputData: {
          userInput: input.userInput,
          maxRetries: input.maxRetries || 3,
        },
      });

      this.logger.log(`Intelligent workflow completed for input: ${input.userInput}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to run intelligent workflow', error);
      throw error;
    }
  }


}
