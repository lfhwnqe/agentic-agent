/**
 * 工作流配置管理
 * 集中管理工作流的配置参数，便于维护和调整
 */

export interface WorkflowConfig {
  // 重试配置
  retry: {
    maxRetries: number;
    retryDelay: number; // 重试延迟（毫秒）
  };

  // 质量评估配置
  quality: {
    passThreshold: number; // 通过阈值
    dimensions: string[]; // 评估维度
  };

  // 代理配置
  agents: {
    intentAnalyzer: string;
    contentGenerator: string;
    qualityEvaluator: string;
  };

  // 超时配置
  timeouts: {
    intentAnalysis: number;
    contentGeneration: number;
    qualityEvaluation: number;
  };

  // 日志配置
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includeStepDetails: boolean;
  };
}

/**
 * 默认工作流配置
 */
export const defaultWorkflowConfig: WorkflowConfig = {
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },

  quality: {
    passThreshold: 7.0,
    dimensions: ['relevance', 'accuracy', 'completeness', 'clarity', 'usefulness'],
  },

  agents: {
    intentAnalyzer: 'intentAnalyzerAgent',
    contentGenerator: 'contentGeneratorAgent',
    qualityEvaluator: 'qualityEvaluatorAgent',
  },

  timeouts: {
    intentAnalysis: 30000,    // 30秒
    contentGeneration: 60000, // 60秒
    qualityEvaluation: 30000, // 30秒
  },

  logging: {
    enabled: true,
    level: 'info',
    includeStepDetails: false,
  },
};

/**
 * 获取工作流配置
 * 支持环境变量覆盖默认配置
 */
export function getWorkflowConfig(): WorkflowConfig {
  const config = { ...defaultWorkflowConfig };

  // 从环境变量读取配置覆盖
  if (process.env.WORKFLOW_MAX_RETRIES) {
    config.retry.maxRetries = parseInt(process.env.WORKFLOW_MAX_RETRIES, 10);
  }

  if (process.env.WORKFLOW_QUALITY_THRESHOLD) {
    config.quality.passThreshold = parseFloat(process.env.WORKFLOW_QUALITY_THRESHOLD);
  }

  if (process.env.WORKFLOW_LOG_LEVEL) {
    config.logging.level = process.env.WORKFLOW_LOG_LEVEL as any;
  }

  return config;
}

/**
 * 验证配置的有效性
 */
export function validateWorkflowConfig(config: WorkflowConfig): boolean {
  try {
    // 验证重试配置
    if (config.retry.maxRetries < 0 || config.retry.maxRetries > 10) {
      throw new Error('maxRetries must be between 0 and 10');
    }

    // 验证质量阈值
    if (config.quality.passThreshold < 0 || config.quality.passThreshold > 10) {
      throw new Error('passThreshold must be between 0 and 10');
    }

    // 验证超时配置
    Object.values(config.timeouts).forEach(timeout => {
      if (timeout < 1000 || timeout > 300000) {
        throw new Error('timeout must be between 1000ms and 300000ms');
      }
    });

    return true;
  } catch (error) {
    console.error('Invalid workflow configuration:', error);
    return false;
  }
}