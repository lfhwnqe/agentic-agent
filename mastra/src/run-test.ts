import { mastra } from './mastra/index';

async function runSimpleTest() {
  console.log('🚀 开始测试简化版智能workflow系统...\n');

  try {
    console.log('📋 可用的workflows:');
    console.log('- weatherWorkflow');
    console.log('- intelligentWorkflow');
    console.log('- simpleIntelligentWorkflow');
    console.log('');

    console.log('👥 可用的agents:');
    console.log('- weatherAgent');
    console.log('- intentAnalyzerAgent');
    console.log('- contentGeneratorAgent');
    console.log('- qualityEvaluatorAgent');
    console.log('');

    // 测试简化版workflow
    console.log('📝 测试简化版智能workflow');
    console.log('=' .repeat(40));
    
    const workflow = mastra.getWorkflow('simpleIntelligentWorkflow');
    console.log('✅ 成功获取workflow:', workflow.id);

    const run = workflow.createRun();
    console.log('✅ 成功创建workflow run');

    console.log('🔄 开始执行workflow...');
    const startTime = Date.now();

    const result = await run.start({
      inputData: {
        userInput: '什么是人工智能？请简单解释一下。',
        maxRetries: 2,
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  执行时间: ${duration}ms`);
    console.log('✅ Workflow执行完成！');
    console.log('');
    console.log('📊 执行结果:');
    console.log('- 成功状态:', result.success);
    console.log('- 用户输入:', result.userInput);
    console.log('- 质量分数:', result.qualityScore);
    console.log('- 重试次数:', result.totalRetries);
    console.log('- 处理时间:', result.processingTime);
    console.log('');
    
    console.log('📋 意图分析结果（前300字符）:');
    console.log(result.intentAnalysis.substring(0, 300) + '...');
    console.log('');
    
    console.log('📝 最终生成内容（前500字符）:');
    console.log(result.finalContent.substring(0, 500) + '...');
    console.log('');

  } catch (error) {
    console.error('❌ 测试失败：', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
  }
}

async function testIndividualAgents() {
  console.log('🔍 测试单个Agent功能...\n');

  try {
    // 测试意图分析Agent
    console.log('📊 测试意图分析Agent');
    console.log('=' .repeat(30));
    
    const intentAgent = mastra.getAgent('intentAnalyzerAgent');
    console.log('✅ 成功获取意图分析Agent');

    const intentResult = await intentAgent.generate([
      {
        role: 'user',
        content: '请分析以下用户输入并优化提示词：\n\n用户输入：什么是机器学习？\n\n请严格按照指定的JSON格式输出分析结果。',
      },
    ]);

    console.log('📊 意图分析结果（前200字符）：');
    console.log(intentResult.text.substring(0, 200) + '...');
    console.log('');

    // 测试内容生成Agent
    console.log('📝 测试内容生成Agent');
    console.log('=' .repeat(30));
    
    const contentAgent = mastra.getAgent('contentGeneratorAgent');
    console.log('✅ 成功获取内容生成Agent');

    const contentResult = await contentAgent.generate([
      {
        role: 'user',
        content: `请根据以下优化后的提示词生成高质量内容：

优化提示词：请详细解释机器学习的概念、主要算法类型和实际应用

请严格按照指定的JSON格式输出生成结果。`,
      },
    ]);

    console.log('📝 内容生成结果（前200字符）：');
    console.log(contentResult.text.substring(0, 200) + '...');
    console.log('');

    // 测试质量评估Agent
    console.log('⭐ 测试质量评估Agent');
    console.log('=' .repeat(30));
    
    const qualityAgent = mastra.getAgent('qualityEvaluatorAgent');
    console.log('✅ 成功获取质量评估Agent');

    const qualityResult = await qualityAgent.generate([
      {
        role: 'user',
        content: `请评估以下内容的质量：

用户原始输入：什么是机器学习？

优化提示词：请详细解释机器学习的概念、主要算法类型和实际应用

生成内容：机器学习是人工智能的一个重要分支，它使计算机能够在没有明确编程的情况下学习和改进。

请严格按照指定的JSON格式输出评估结果。`,
      },
    ]);

    console.log('⭐ 质量评估结果（前200字符）：');
    console.log(qualityResult.text.substring(0, 200) + '...');
    console.log('');

  } catch (error) {
    console.error('❌ Agent测试失败：', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  }
}

// 主测试函数
async function main() {
  console.log('🎯 Mastra智能workflow系统测试');
  console.log('=' .repeat(60));
  console.log('');

  // 首先测试单个Agent
  await testIndividualAgents();
  
  console.log('=' .repeat(60));
  console.log('');
  
  // 然后测试完整的workflow
  await runSimpleTest();
  
  console.log('🎉 所有测试完成！');
}

// 运行测试
main().catch(console.error);
