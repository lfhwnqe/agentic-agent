
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { intelligentWorkflow } from './workflows/intelligent-workflow.js';
import { tradeWorkflow } from './workflows/trade-workflow.js';
import { intentAnalyzerAgent } from './agents/intent-analyzer-agent.js';
import { contentGeneratorAgent } from './agents/content-generator-agent.js';
import { qualityEvaluatorAgent } from './agents/quality-evaluator-agent.js';
import { tradeAnalyzerAgent } from './agents/trade-analyzer-agent.js';
import { tradeStrategyAgent } from './agents/trade-strategy-agent.js';
import { tradeEvaluatorAgent } from './agents/trade-evaluator-agent.js';

export const mastra = new Mastra({
  workflows: {
    intelligentWorkflow,
    tradeWorkflow,
  },
  agents: {
    intentAnalyzerAgent,
    contentGeneratorAgent,
    qualityEvaluatorAgent,
    tradeAnalyzerAgent,
    tradeStrategyAgent,
    tradeEvaluatorAgent,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
