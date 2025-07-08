import { mastra } from './mastra/index';

async function testIntelligentWorkflow() {
  console.log('🚀 开始测试智能workflow系统...\n');

  // 测试用例1：简单问题
  console.log('📝 测试用例1：简单问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('intelligentWorkflow');
    const run = workflow.createRun();

    const result1 = await run.start({
      inputData: {
        userInput: '什么是机器学习？',
        maxRetries: 2,
      },
    });

    console.log('✅ 测试用例1结果：');
    console.log(JSON.stringify(result1, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ 测试用例1失败：', error);
    console.log('\n');
  }

  // 测试用例2：复杂问题
  console.log('📝 测试用例2：复杂技术问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('intelligentWorkflow');
    const run = workflow.createRun();

    const result2 = await run.start({
      inputData: {
        userInput: '如何在TypeScript中实现一个支持条件分支和回流控制的workflow系统？',
        maxRetries: 3,
      },
    });

    console.log('✅ 测试用例2结果：');
    console.log(JSON.stringify(result2, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ 测试用例2失败：', error);
    console.log('\n');
  }

  // 测试用例3：模糊问题（可能触发重试机制）
  console.log('📝 测试用例3：模糊问题（测试重试机制）');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('intelligentWorkflow');
    const run = workflow.createRun();

    const result3 = await run.start({
      inputData: {
        userInput: '帮我',
        maxRetries: 2,
      },
    });

    console.log('✅ 测试用例3结果：');
    console.log(JSON.stringify(result3, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ 测试用例3失败：', error);
    console.log('\n');
  }

  console.log('🎉 智能workflow系统测试完成！');
}

// 测试单个Agent的功能
async function testIndividualAgents() {
  console.log('🔍 测试单个Agent功能...\n');

  // 测试意图分析Agent
  console.log('📊 测试意图分析Agent');
  console.log('=' .repeat(30));
  
  try {
    const intentAgent = mastra.getAgent('intentAnalyzerAgent');
    const intentResult = await intentAgent.generate([
      {
        role: 'user',
        content: '请分析以下用户输入并优化提示词：\n\n用户输入：什么是人工智能？\n\n请严格按照指定的JSON格式输出分析结果。',
      },
    ]);

    console.log('意图分析结果：');
    console.log(intentResult.text);
    console.log('\n');
  } catch (error) {
    console.error('❌ 意图分析Agent测试失败：', error);
    console.log('\n');
  }

  // 测试内容生成Agent
  console.log('📝 测试内容生成Agent');
  console.log('=' .repeat(30));
  
  try {
    const contentAgent = mastra.getAgent('contentGeneratorAgent');
    const contentResult = await contentAgent.generate([
      {
        role: 'user',
        content: `请根据以下优化后的提示词生成高质量内容：

优化提示词：请详细解释人工智能的概念、发展历史、主要技术分支和应用领域

期望输出类型：详细解释

上下文提示：提供准确信息, 保持清晰表达

质量标准：准确性, 完整性, 清晰度

请严格按照指定的JSON格式输出生成结果。`,
      },
    ]);

    console.log('内容生成结果：');
    console.log(contentResult.text);
    console.log('\n');
  } catch (error) {
    console.error('❌ 内容生成Agent测试失败：', error);
    console.log('\n');
  }

  // 测试质量评估Agent
  console.log('⭐ 测试质量评估Agent');
  console.log('=' .repeat(30));
  
  try {
    const qualityAgent = mastra.getAgent('qualityEvaluatorAgent');
    const qualityResult = await qualityAgent.generate([
      {
        role: 'user',
        content: `请评估以下内容的质量：

用户原始输入：什么是人工智能？

优化提示词：请详细解释人工智能的概念、发展历史、主要技术分支和应用领域

生成内容：{
  "generatedContent": "人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。",
  "contentType": "详细解释",
  "keyPoints": ["AI定义", "技术分支", "应用领域"],
  "additionalInfo": "包含基础概念和实际应用",
  "confidence": 0.9,
  "sources": ["计算机科学理论"]
}

质量标准：准确性, 完整性, 清晰度

请严格按照指定的JSON格式输出评估结果。`,
      },
    ]);

    console.log('质量评估结果：');
    console.log(qualityResult.text);
    console.log('\n');
  } catch (error) {
    console.error('❌ 质量评估Agent测试失败：', error);
    console.log('\n');
  }

  console.log('🎉 单个Agent测试完成！');
}

// 主测试函数
async function main() {
  console.log('🎯 Mastra智能workflow系统测试');
  console.log('=' .repeat(60));
  console.log('\n');

  // 首先测试单个Agent
  await testIndividualAgents();
  
  console.log('\n' + '=' .repeat(60) + '\n');
  
  // 然后测试完整的workflow
  await testIntelligentWorkflow();
}

// 运行测试
main().catch(console.error);
