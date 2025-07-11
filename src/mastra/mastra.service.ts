import { Injectable } from '@nestjs/common';
import { mastra } from './index';

@Injectable()
export class MastraService {
  constructor() {}

  getMastra() {
    return mastra;
  }

  async runIntelligentWorkflow(input: any) {
    // 这里可以调用智能工作流
    // 具体实现需要根据您的工作流逻辑来定制
    const workflow = mastra.getWorkflow('intelligentWorkflow');
    const run = workflow.createRun();
    return await run.start(input);
  }

  async runTradeWorkflow(input: any) {
    // 这里可以调用交易工作流
    // 具体实现需要根据您的工作流逻辑来定制
    const workflow = mastra.getWorkflow('tradeWorkflow');
    const run = workflow.createRun();
    return await run.start(input);
  }

  // 获取所有可用的代理
  getAgents() {
    return mastra.getAgents();
  }

  // 获取所有可用的工作流
  getWorkflows() {
    return mastra.getWorkflows();
  }
}
