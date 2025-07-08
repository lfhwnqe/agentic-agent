import { mastra } from './mastra/index';

async function testSimpleIntelligentWorkflow() {
  console.log('🚀 开始测试简化版智能workflow系统...\n');

  // 测试用例1：基础问题
  console.log('📝 测试用例1：基础问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('simpleIntelligentWorkflow');
    const run = workflow.createRun();

    console.log('🔄 开始执行workflow...');
    const startTime = Date.now();

    const result1 = await run.start({
      inputData: {
        userInput: '什么是机器学习？',
        maxRetries: 2,
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  执行时间: ${duration}ms`);
    console.log('✅ 测试用例1结果：');
    console.log('成功状态:', result1.success);
    console.log('用户输入:', result1.userInput);
    console.log('质量分数:', result1.qualityScore);
    console.log('重试次数:', result1.totalRetries);
    console.log('处理时间:', result1.processingTime);
    console.log('\n📊 意图分析结果:');
    console.log(result1.intentAnalysis.substring(0, 200) + '...');
    console.log('\n📝 最终内容:');
    console.log(result1.finalContent.substring(0, 300) + '...');
    console.log('\n');
  } catch (error) {
    console.error('❌ 测试用例1失败：', error);
    console.log('\n');
  }

  // 测试用例2：复杂技术问题
  console.log('📝 测试用例2：复杂技术问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('simpleIntelligentWorkflow');
    const run = workflow.createRun();

    console.log('🔄 开始执行workflow...');
    const startTime = Date.now();

    const result2 = await run.start({
      inputData: {
        userInput: '如何在TypeScript中实现一个支持条件分支的workflow系统？请提供详细的代码示例。',
        maxRetries: 3,
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  执行时间: ${duration}ms`);
    console.log('✅ 测试用例2结果：');
    console.log('成功状态:', result2.success);
    console.log('用户输入:', result2.userInput);
    console.log('质量分数:', result2.qualityScore);
    console.log('重试次数:', result2.totalRetries);
    console.log('\n📊 意图分析结果:');
    console.log(result2.intentAnalysis.substring(0, 200) + '...');
    console.log('\n📝 最终内容:');
    console.log(result2.finalContent.substring(0, 300) + '...');
    console.log('\n');
  } catch (error) {
    console.error('❌ 测试用例2失败：', error);
    console.log('\n');
  }

  // 测试用例3：简短模糊问题
  console.log('📝 测试用例3：简短模糊问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('simpleIntelligentWorkflow');
    const run = workflow.createRun();

    console.log('🔄 开始执行workflow...');
    const startTime = Date.now();

    const result3 = await run.start({
      inputData: {
        userInput: '帮我解释一下AI',
        maxRetries: 2,
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  执行时间: ${duration}ms`);
    console.log('✅ 测试用例3结果：');
    console.log('成功状态:', result3.success);
    console.log('用户输入:', result3.userInput);
    console.log('质量分数:', result3.qualityScore);
    console.log('重试次数:', result3.totalRetries);
    console.log('\n📊 意图分析结果:');
    console.log(result3.intentAnalysis.substring(0, 200) + '...');
    console.log('\n📝 最终内容:');
    console.log(result3.finalContent.substring(0, 300) + '...');
    console.log('\n');
  } catch (error) {
    console.error('❌ 测试用例3失败：', error);
    console.log('\n');
  }

  console.log('🎉 简化版智能workflow系统测试完成！');
}

// 测试workflow的各个步骤
async function testWorkflowSteps() {
  console.log('🔍 测试workflow各个步骤...\n');

  try {
    // 测试意图分析Agent
    console.log('📊 测试意图分析Agent');
    console.log('=' .repeat(30));
    
    const intentAgent = mastra.getAgent('intentAnalyzerAgent');
    const intentResult = await intentAgent.generate([
      {
        role: 'user',
        content: '请分析以下用户输入并优化提示词：\n\n用户输入：什么是深度学习？\n\n请严格按照指定的JSON格式输出分析结果。',
      },
    ]);

    console.log('意图分析结果（前200字符）：');
    console.log(intentResult.text.substring(0, 200) + '...');
    console.log('\n');

    // 测试内容生成Agent
    console.log('📝 测试内容生成Agent');
    console.log('=' .repeat(30));
    
    const contentAgent = mastra.getAgent('contentGeneratorAgent');
    const contentResult = await contentAgent.generate([
      {
        role: 'user',
        content: `请根据以下优化后的提示词生成高质量内容：

优化提示词：请详细解释深度学习的概念、核心技术和实际应用

请严格按照指定的JSON格式输出生成结果。`,
      },
    ]);

    console.log('内容生成结果（前200字符）：');
    console.log(contentResult.text.substring(0, 200) + '...');
    console.log('\n');

    // 测试质量评估Agent
    console.log('⭐ 测试质量评估Agent');
    console.log('=' .repeat(30));
    
    const qualityAgent = mastra.getAgent('qualityEvaluatorAgent');
    const qualityResult = await qualityAgent.generate([
      {
        role: 'user',
        content: `请评估以下内容的质量：

用户原始输入：什么是深度学习？

优化提示词：请详细解释深度学习的概念、核心技术和实际应用

生成内容：深度学习是机器学习的一个子领域，使用多层神经网络来学习数据的复杂模式。

请严格按照指定的JSON格式输出评估结果。`,
      },
    ]);

    console.log('质量评估结果（前200字符）：');
    console.log(qualityResult.text.substring(0, 200) + '...');
    console.log('\n');

  } catch (error) {
    console.error('❌ 步骤测试失败：', error);
  }

  console.log('🎉 workflow步骤测试完成！');
}

// 主测试函数
async function main() {
  console.log('🎯 Mastra简化版智能workflow系统测试');
  console.log('=' .repeat(60));
  console.log('\n');

  // 首先测试各个步骤
  await testWorkflowSteps();
  
  console.log('\n' + '=' .repeat(60) + '\n');
  
  // 然后测试完整的workflow
  await testSimpleIntelligentWorkflow();
}

// 运行测试
main().catch(console.error);
