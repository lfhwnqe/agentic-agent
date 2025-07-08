/**
 * 工作流工具函数
 * 提供日志记录、错误处理、性能监控等通用功能
 */

import { WorkflowConfig } from './config';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 工作流日志记录器
 */
export class WorkflowLogger {
  private config: WorkflowConfig;
  private stepStartTimes: Map<string, number> = new Map();

  constructor(config: WorkflowConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.logging.enabled) return false;

    const configLevel = this.getLogLevel(this.config.logging.level);
    return level >= configLevel;
  }

  private getLogLevel(level: string): LogLevel {
    switch (level) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, stepId: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${stepId}] ${message}`;

    if (data && this.config.logging.includeStepDetails) {
      return `${baseMessage}\nData: ${JSON.stringify(data, null, 2)}`;
    }

    return baseMessage;
  }

  debug(stepId: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('debug', stepId, message, data));
    }
  }

  info(stepId: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('info', stepId, message, data));
    }
  }

  warn(stepId: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('warn', stepId, message, data));
    }
  }

  error(stepId: string, message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('error', stepId, message, error));
    }
  }

  /**
   * 记录步骤开始时间
   */
  stepStart(stepId: string): void {
    this.stepStartTimes.set(stepId, Date.now());
    this.info(stepId, 'Step started');
  }

  /**
   * 记录步骤结束时间并计算执行时长
   */
  stepEnd(stepId: string, success: boolean = true): void {
    const startTime = this.stepStartTimes.get(stepId);
    if (startTime) {
      const duration = Date.now() - startTime;
      const status = success ? 'completed' : 'failed';
      this.info(stepId, `Step ${status} in ${duration}ms`);
      this.stepStartTimes.delete(stepId);
    }
  }
}

/**
 * 错误处理工具
 */
export class WorkflowErrorHandler {
  private logger: WorkflowLogger;

  constructor(logger: WorkflowLogger) {
    this.logger = logger;
  }

  /**
   * 处理步骤执行错误
   */
  handleStepError(stepId: string, error: any, context?: any): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const enhancedError = new Error(`Step '${stepId}' failed: ${errorMessage}`);

    this.logger.error(stepId, 'Step execution failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context,
    });

    return enhancedError;
  }

  /**
   * 处理代理调用错误
   */
  handleAgentError(stepId: string, agentName: string, error: any): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const enhancedError = new Error(`Agent '${agentName}' in step '${stepId}' failed: ${errorMessage}`);

    this.logger.error(stepId, `Agent ${agentName} call failed`, {
      agent: agentName,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return enhancedError;
  }
}

/**
 * 性能监控工具
 */
export class WorkflowPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private logger: WorkflowLogger;

  constructor(logger: WorkflowLogger) {
    this.logger = logger;
  }

  /**
   * 记录步骤执行时间
   */
  recordStepDuration(stepId: string, duration: number): void {
    if (!this.metrics.has(stepId)) {
      this.metrics.set(stepId, []);
    }
    this.metrics.get(stepId)!.push(duration);
  }

  /**
   * 获取步骤性能统计
   */
  getStepStats(stepId: string): { avg: number; min: number; max: number; count: number } | null {
    const durations = this.metrics.get(stepId);
    if (!durations || durations.length === 0) {
      return null;
    }

    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return { avg, min, max, count: durations.length };
  }

  /**
   * 输出性能报告
   */
  generateReport(): void {
    this.logger.info('performance', 'Performance Report:');

    for (const [stepId, durations] of this.metrics.entries()) {
      const stats = this.getStepStats(stepId);
      if (stats) {
        this.logger.info('performance',
          `${stepId}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min}ms, max=${stats.max}ms, count=${stats.count}`
        );
      }
    }
  }
}

/**
 * 创建工作流工具实例
 */
export function createWorkflowUtils(config: WorkflowConfig) {
  const logger = new WorkflowLogger(config);
  const errorHandler = new WorkflowErrorHandler(logger);
  const performanceMonitor = new WorkflowPerformanceMonitor(logger);

  return {
    logger,
    errorHandler,
    performanceMonitor,
  };
}