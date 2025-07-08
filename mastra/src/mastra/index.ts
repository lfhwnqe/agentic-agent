
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { intelligentWorkflow } from './workflows/intelligent-workflow';
import { intentAnalyzerAgent } from './agents/intent-analyzer-agent';
import { contentGeneratorAgent } from './agents/content-generator-agent';
import { qualityEvaluatorAgent } from './agents/quality-evaluator-agent';

export const mastra = new Mastra({
  workflows: {
    intelligentWorkflow,
  },
  agents: {
    intentAnalyzerAgent,
    contentGeneratorAgent,
    qualityEvaluatorAgent,
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
