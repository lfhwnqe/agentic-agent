import { mastra } from './mastra/index.js';

async function testTradeWorkflow() {
  console.log('🚀 开始测试交易workflow系统...\n');

  // 测试用例1：简单交易问题
  console.log('📝 测试用例1：简单交易问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('tradeWorkflow');
    const run = workflow.createRun();

    const result1 = await run.start({
      inputData: {
        userInput: '我想做股票短线交易，有什么好的策略？',
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

  // 测试用例2：复杂交易问题
  console.log('📝 测试用例2：复杂交易技术问题');
  console.log('=' .repeat(50));
  
  try {
    const workflow = mastra.getWorkflow('tradeWorkflow');
    const run = workflow.createRun();

    const result2 = await run.start({
      inputData: {
        userInput: '如何在波动性较大的加密货币市场中实现稳定盈利？需要考虑风险管理和资金配置。',
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
    const workflow = mastra.getWorkflow('tradeWorkflow');
    const run = workflow.createRun();

    const result3 = await run.start({
      inputData: {
        userInput: '帮我赚钱',
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

  console.log('🎉 交易workflow系统测试完成！');
}

// 测试单个交易Agent的功能
async function testIndividualTradeAgents() {
  console.log('🔍 测试单个交易Agent功能...\n');

  // 测试交易分析Agent
  console.log('📊 测试交易分析Agent');
  console.log('=' .repeat(30));
  
  try {
    const tradeAnalyzerAgent = mastra.getAgent('tradeAnalyzerAgent');
    const analysisResult = await tradeAnalyzerAgent.generate([
      {
        role: 'user',
        content: '请分析以下用户交易需求并优化策略提示词：\n\n用户输入：我想学习外汇交易，制定一个适合新手的策略\n\n请严格按照指定的JSON格式输出分析结果。',
      },
    ]);

    console.log('交易分析结果：');
    console.log(analysisResult.text);
    console.log('\n');
  } catch (error) {
    console.error('❌ 交易分析Agent测试失败：', error);
    console.log('\n');
  }

  // 测试策略生成Agent
  console.log('📝 测试策略生成Agent');
  console.log('=' .repeat(30));
  
  try {
    const tradeStrategyAgent = mastra.getAgent('tradeStrategyAgent');
    const strategyResult = await tradeStrategyAgent.generate([
      {
        role: 'user',
        content: `请根据以下优化后的策略提示词生成高质量交易方案：

优化策略提示词：请为外汇交易新手制定一个详细的入门策略，包括基础知识学习、风险控制和实际操作步骤

期望输出类型：详细交易策略

市场分析提示：提供风险控制措施, 保持策略可执行性

评估标准：可行性, 风险控制, 盈利潜力

请严格按照指定的JSON格式输出策略生成结果。`,
      },
    ]);

    console.log('策略生成结果：');
    console.log(strategyResult.text);
    console.log('\n');
  } catch (error) {
    console.error('❌ 策略生成Agent测试失败：', error);
    console.log('\n');
  }

  // 测试交易评估Agent
  console.log('⭐ 测试交易评估Agent');
  console.log('=' .repeat(30));
  
  try {
    const tradeEvaluatorAgent = mastra.getAgent('tradeEvaluatorAgent');
    const evaluationResult = await tradeEvaluatorAgent.generate([
      {
        role: 'user',
        content: `请评估以下交易策略的质量：

用户原始需求：我想学习外汇交易，制定一个适合新手的策略

优化策略提示词：请为外汇交易新手制定一个详细的入门策略，包括基础知识学习、风险控制和实际操作步骤

生成策略：{
  "generatedStrategy": "外汇交易新手入门策略：1. 学习基础知识 2. 模拟交易练习 3. 小额实盘操作",
  "strategyType": "新手入门策略",
  "keyPoints": ["基础学习", "模拟练习", "风险控制"],
  "riskManagement": "严格止损，小额开始",
  "confidence": 0.85,
  "marketConditions": ["稳定市场", "低波动期"]
}

评估标准：可行性, 风险控制, 盈利潜力

请严格按照指定的JSON格式输出评估结果。`,
      },
    ]);

    console.log('交易评估结果：');
    console.log(evaluationResult.text);
    console.log('\n');
  } catch (error) {
    console.error('❌ 交易评估Agent测试失败：', error);
    console.log('\n');
  }
}

// 运行测试
async function runAllTests() {
  console.log('🎯 开始运行所有交易系统测试...\n');
  
  await testIndividualTradeAgents();
  console.log('\n' + '='.repeat(60) + '\n');
  await testTradeWorkflow();
  
  console.log('\n🏁 所有测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testTradeWorkflow, testIndividualTradeAgents, runAllTests };
