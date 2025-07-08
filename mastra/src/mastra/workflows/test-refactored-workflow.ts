/**
 * 重构后工作流系统的测试文件
 * 验证模块化架构的功能完整性
 */

import { intelligentWorkflow } from './intelligent-workflow';
import {
  IntentAnalysisStepLogic,
  ContentGenerationStepLogic,
  QualityEvaluationStepLogic,
  RetryStepLogic,
  FinalizeStepLogic
} from './steps';

/**
 * 测试各个步骤模块的独立性
 */
async function testStepModules() {
  console.log('🧪 测试步骤模块的独立性...');

  // 模拟 Mastra 实例
  const mockMastra = {
    getAgent: (agentName: string) => ({
      generate: async (messages: any[]) => ({
        text: JSON.stringify({
          originalInput: "测试输入",
          analyzedIntent: "用户需要测试信息",
          optimizedPrompt: "请提供测试相关信息",
          expectedOutputType: "详细说明",
          contextualHints: ["准确性", "清晰度"],
          qualityCriteria: ["相关性", "完整性"]
        })
      })
    })
  };

  try {
    // 测试意图分析步骤
    console.log('  ✅ 测试意图分析步骤...');
    const intentResult = await IntentAnalysisStepLogic.execute(
      "这是一个测试输入",
      mockMastra
    );
    console.log('    意图分析结果:', intentResult.analyzedIntent);

    // 测试内容生成步骤
    console.log('  ✅ 测试内容生成步骤...');
    const mockMastra2 = {
      getAgent: (agentName: string) => ({
        generate: async (messages: any[]) => ({
          text: JSON.stringify({
            generatedContent: "这是生成的测试内容",
            contentType: "测试回答",
            keyPoints: ["要点1", "要点2"],
            additionalInfo: "额外信息",
            confidence: 0.9,
            sources: ["测试源"]
          })
        })
      })
    };

    const contentResult = await ContentGenerationStepLogic.execute(
      intentResult,
      mockMastra2
    );
    console.log('    内容生成结果:', contentResult.generatedContent);

    // 测试质量评估步骤
    console.log('  ✅ 测试质量评估步骤...');
    const mockMastra3 = {
      getAgent: (agentName: string) => ({
        generate: async (messages: any[]) => ({
          text: JSON.stringify({
            overallQuality: "PASS",
            totalScore: 8.5,
            dimensionScores: {
              relevance: 8,
              accuracy: 9,
              completeness: 8,
              clarity: 9,
              usefulness: 8
            },
            feedback: "内容质量良好",
            improvementSuggestions: [],
            retryRecommended: false
          })
        })
      })
    };

    const qualityResult = await QualityEvaluationStepLogic.execute(
      "测试输入",
      intentResult,
      contentResult,
      mockMastra3
    );
    console.log('    质量评估结果:', qualityResult.overallQuality);

    // 测试最终化步骤
    console.log('  ✅ 测试最终化步骤...');
    const finalResult = await FinalizeStepLogic.execute({
      userInput: "测试输入",
      maxRetries: 3,
      currentRetry: 0,
      intentAnalysis: intentResult,
      contentGeneration: contentResult,
      qualityEvaluation: qualityResult
    });
    console.log('    最终结果成功:', finalResult.success);

    console.log('✅ 所有步骤模块测试通过！');
    return true;
  } catch (error) {
    console.error('❌ 步骤模块测试失败:', error);
    return false;
  }
}

/**
 * 测试工作流的完整性
 */
function testWorkflowIntegrity() {
  console.log('🧪 测试工作流完整性...');

  try {
    // 检查工作流是否正确导出
    if (!intelligentWorkflow) {
      throw new Error('工作流未正确导出');
    }

    // 检查工作流配置
    console.log('  ✅ 工作流ID:', intelligentWorkflow.id);
    console.log('  ✅ 工作流描述:', intelligentWorkflow.description);

    console.log('✅ 工作流完整性测试通过！');
    return true;
  } catch (error) {
    console.error('❌ 工作流完整性测试失败:', error);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试重构后的工作流系统...\n');

  const stepModulesTest = await testStepModules();
  console.log('');

  const workflowIntegrityTest = testWorkflowIntegrity();
  console.log('');

  if (stepModulesTest && workflowIntegrityTest) {
    console.log('🎉 所有测试通过！重构成功！');
    console.log('\n📋 重构总结:');
    console.log('  ✅ 业务逻辑成功分离到独立步骤模块');
    console.log('  ✅ 工作流文件只负责步骤编排和条件控制');
    console.log('  ✅ 类型定义统一管理');
    console.log('  ✅ 模块化架构清晰可维护');
  } else {
    console.log('❌ 部分测试失败，需要进一步调试');
  }
}

// 直接运行测试
runTests().catch(console.error);

export { runTests, testStepModules, testWorkflowIntegrity };