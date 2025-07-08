/**
 * 重构后工作流系统使用示例
 * 展示各种使用场景和最佳实践
 */

import { intelligentWorkflow } from './intelligent-workflow';
import {
  IntentAnalysisStepLogic,
  ContentGenerationStepLogic,
  QualityEvaluationStepLogic
} from './steps';
import { getWorkflowConfig, validateWorkflowConfig } from './config';
import { createWorkflowUtils } from './utils';

/**
 * 示例 1: 基本工作流使用
 */
async function basicWorkflowExample() {
  console.log('🔄 示例 1: 基本工作流使用');

  try {
    // 模拟 Mastra 实例（在实际使用中，这将是真实的 Mastra 实例）
    const mockMastra = createMockMastra();

    // 执行工作流
    const result = await intelligentWorkflow.execute({
      userInput: "请解释什么是人工智能，以及它在现代社会中的应用",
      maxRetries: 3
    });

    console.log('✅ 工作流执行成功');
    console.log('📊 结果摘要:', {
      success: result.success,
      totalRetries: result.totalRetries,
      qualityScore: result.qualityEvaluation.totalScore,
      contentLength: result.finalContent.generatedContent.length
    });

  } catch (error) {
    console.error('❌ 工作流执行失败:', error);
  }
}

/**
 * 示例 2: 使用自定义配置
 */
async function customConfigExample() {
  console.log('\n🔄 示例 2: 使用自定义配置');

  // 获取并验证配置
  const config = getWorkflowConfig();

  if (!validateWorkflowConfig(config)) {
    console.error('❌ 配置验证失败');
    return;
  }

  console.log('✅ 配置验证通过');
  console.log('📋 当前配置:', {
    maxRetries: config.retry.maxRetries,
    qualityThreshold: config.quality.passThreshold,
    logLevel: config.logging.level
  });

  // 创建工具实例
  const { logger, errorHandler, performanceMonitor } = createWorkflowUtils(config);

  logger.info('example', '开始自定义配置示例');

  // 模拟一些操作
  const startTime = Date.now();
  await new Promise(resolve => setTimeout(resolve, 100)); // 模拟异步操作
  const duration = Date.now() - startTime;

  performanceMonitor.recordStepDuration('example-operation', duration);
  logger.info('example', `操作完成，耗时 ${duration}ms`);
}

/**
 * 示例 3: 独立使用步骤模块
 */
async function independentStepExample() {
  console.log('\n🔄 示例 3: 独立使用步骤模块');

  const mockMastra = createMockMastra();
  const userInput = "什么是区块链技术？";

  try {
    // 步骤 1: 意图分析
    console.log('📝 执行意图分析...');
    const intentResult = await IntentAnalysisStepLogic.execute(userInput, mockMastra);
    console.log('✅ 意图分析完成:', intentResult.analyzedIntent);

    // 步骤 2: 内容生成
    console.log('📝 执行内容生成...');
    const contentResult = await ContentGenerationStepLogic.execute(intentResult, mockMastra);
    console.log('✅ 内容生成完成，长度:', contentResult.generatedContent.length);

    // 步骤 3: 质量评估
    console.log('📝 执行质量评估...');
    const qualityResult = await QualityEvaluationStepLogic.execute(
      userInput,
      intentResult,
      contentResult,
      mockMastra
    );
    console.log('✅ 质量评估完成，评分:', qualityResult.totalScore);

  } catch (error) {
    console.error('❌ 步骤执行失败:', error);
  }
}

/**
 * 示例 4: 错误处理和重试机制
 */
async function errorHandlingExample() {
  console.log('\n🔄 示例 4: 错误处理和重试机制');

  const config = getWorkflowConfig();
  const { logger, errorHandler } = createWorkflowUtils(config);

  // 模拟一个可能失败的操作
  async function riskyOperation(shouldFail: boolean = false): Promise<string> {
    if (shouldFail) {
      throw new Error('模拟的操作失败');
    }
    return '操作成功';
  }

  // 带错误处理的操作
  try {
    logger.info('error-example', '尝试执行可能失败的操作...');

    // 第一次尝试（失败）
    try {
      await riskyOperation(true);
    } catch (error) {
      const handledError = errorHandler.handleStepError('risky-operation', error, {
        attempt: 1,
        context: 'first attempt'
      });
      logger.warn('error-example', '第一次尝试失败，准备重试');
    }

    // 第二次尝试（成功）
    const result = await riskyOperation(false);
    logger.info('error-example', '操作成功完成', { result });

  } catch (error) {
    logger.error('error-example', '所有尝试都失败了', error);
  }
}

/**
 * 示例 5: 性能监控和分析
 */
async function performanceMonitoringExample() {
  console.log('\n🔄 示例 5: 性能监控和分析');

  const config = getWorkflowConfig();
  const { performanceMonitor, logger } = createWorkflowUtils(config);

  // 模拟多次操作以收集性能数据
  for (let i = 0; i < 5; i++) {
    const startTime = Date.now();

    // 模拟不同耗时的操作
    const delay = Math.random() * 200 + 50; // 50-250ms
    await new Promise(resolve => setTimeout(resolve, delay));

    const duration = Date.now() - startTime;
    performanceMonitor.recordStepDuration('sample-operation', duration);

    logger.debug('performance-example', `操作 ${i + 1} 完成`, { duration: `${duration}ms` });
  }

  // 生成性能报告
  console.log('📊 生成性能报告:');
  performanceMonitor.generateReport();

  // 获取详细统计
  const stats = performanceMonitor.getStepStats('sample-operation');
  if (stats) {
    console.log('📈 详细统计:', {
      平均耗时: `${stats.avg.toFixed(2)}ms`,
      最短耗时: `${stats.min}ms`,
      最长耗时: `${stats.max}ms`,
      执行次数: stats.count
    });
  }
}

/**
 * 创建模拟的 Mastra 实例
 */
function createMockMastra() {
  return {
    getAgent: (agentName: string) => ({
      generate: async (messages: any[]) => {
        // 根据代理类型返回不同的模拟响应
        if (agentName.includes('intent')) {
          return {
            text: JSON.stringify({
              originalInput: messages[0].content.split('：')[1] || "测试输入",
              analyzedIntent: "用户需要了解技术概念",
              optimizedPrompt: "请详细解释相关技术概念，包括定义、原理和应用",
              expectedOutputType: "技术解释",
              contextualHints: ["准确性", "通俗易懂", "实例说明"],
              qualityCriteria: ["准确性", "完整性", "清晰度", "实用性"]
            })
          };
        } else if (agentName.includes('content')) {
          return {
            text: JSON.stringify({
              generatedContent: "这是一个详细的技术解释，包含了相关概念的定义、工作原理、应用场景和未来发展趋势。内容结构清晰，语言通俗易懂，适合不同背景的读者理解。",
              contentType: "技术解释",
              keyPoints: ["核心概念", "工作原理", "应用场景", "发展趋势"],
              additionalInfo: "包含实际案例和参考资料",
              confidence: 0.85,
              sources: ["技术文档", "学术论文", "行业报告"]
            })
          };
        } else if (agentName.includes('quality')) {
          return {
            text: JSON.stringify({
              overallQuality: "PASS",
              totalScore: 8.2,
              dimensionScores: {
                relevance: 8.5,
                accuracy: 8.0,
                completeness: 8.0,
                clarity: 8.5,
                usefulness: 8.0
              },
              feedback: "内容质量良好，结构清晰，信息准确，适合目标受众",
              improvementSuggestions: ["可以增加更多实际案例", "可以添加图表说明"],
              retryRecommended: false
            })
          };
        }

        return { text: '{"result": "mock response"}' };
      }
    })
  };
}

/**
 * 主函数：运行所有示例
 */
async function runAllExamples() {
  console.log('🚀 开始运行重构后工作流系统示例\n');

  try {
    await basicWorkflowExample();
    await customConfigExample();
    await independentStepExample();
    await errorHandlingExample();
    await performanceMonitoringExample();

    console.log('\n🎉 所有示例运行完成！');
    console.log('\n📚 更多信息请参考:');
    console.log('  - USAGE-GUIDE.md: 详细使用指南');
    console.log('  - REFACTORING-SUMMARY.md: 重构总结');
    console.log('  - 各步骤模块文件: 具体实现细节');

  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 运行示例
runAllExamples().catch(console.error);

export {
  basicWorkflowExample,
  customConfigExample,
  independentStepExample,
  errorHandlingExample,
  performanceMonitoringExample
};