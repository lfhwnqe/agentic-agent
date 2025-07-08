import { mastra } from './mastra/index';

/**
 * 演示智能workflow系统的基本功能
 * 
 * 注意：运行此脚本前，请确保已设置 GOOGLE_GENERATIVE_AI_API_KEY 环境变量
 */

async function demonstrateIntelligentWorkflow() {
  console.log('🎯 Mastra智能Workflow系统演示');
  console.log('=' .repeat(60));
  console.log('');

  // 检查API密钥
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('❌ 错误：未找到Google Gemini API密钥');
    console.log('');
    console.log('请按照以下步骤配置：');
    console.log('1. 访问 https://makersuite.google.com/app/apikey');
    console.log('2. 创建API密钥');
    console.log('3. 复制 .env.example 为 .env');
    console.log('4. 在 .env 文件中设置 GOOGLE_GENERATIVE_AI_API_KEY');
    console.log('');
    console.log('配置完成后重新运行此脚本。');
    return;
  }

  console.log('✅ API密钥已配置');
  console.log('');

  // 演示案例
  const testCases = [
    {
      name: '基础概念解释',
      input: '什么是人工智能？',
      description: '测试系统对基础概念的解释能力'
    },
    {
      name: '技术问题解答',
      input: '如何在TypeScript中实现装饰器模式？',
      description: '测试系统对技术问题的详细解答能力'
    },
    {
      name: '模糊问题处理',
      input: '帮我了解一下机器学习',
      description: '测试系统对模糊问题的意图分析和优化能力'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 测试案例 ${i + 1}: ${testCase.name}`);
    console.log(`描述: ${testCase.description}`);
    console.log(`输入: "${testCase.input}"`);
    console.log('=' .repeat(50));

    try {
      const workflow = mastra.getWorkflow('simpleIntelligentWorkflow');
      const run = workflow.createRun();

      console.log('🔄 开始执行workflow...');
      const startTime = Date.now();

      const result = await run.start({
        inputData: {
          userInput: testCase.input,
          maxRetries: 2,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`⏱️  执行时间: ${duration}ms`);
      console.log('');

      if (result && result.success !== undefined) {
        console.log('📊 执行结果:');
        console.log(`- 成功状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
        console.log(`- 质量分数: ${result.qualityScore || 'N/A'}`);
        console.log(`- 重试次数: ${result.totalRetries || 0}`);
        console.log('');

        if (result.intentAnalysis) {
          console.log('🧠 意图分析结果:');
          console.log(result.intentAnalysis.substring(0, 200) + '...');
          console.log('');
        }

        if (result.finalContent) {
          console.log('📝 生成内容:');
          console.log(result.finalContent.substring(0, 400) + '...');
          console.log('');
        }
      } else {
        console.log('❌ Workflow执行失败，未返回预期结果');
        console.log('返回值:', result);
        console.log('');
      }

    } catch (error) {
      console.error('❌ 执行失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
      }
      console.log('');
    }

    if (i < testCases.length - 1) {
      console.log('⏳ 等待3秒后继续下一个测试...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('');
    }
  }

  console.log('🎉 演示完成！');
  console.log('');
  console.log('💡 系统特点总结:');
  console.log('- ✅ 三Agent协作：意图分析 → 内容生成 → 质量评估');
  console.log('- ✅ 智能条件分支：根据质量评估结果决定流程');
  console.log('- ✅ 自动重试机制：质量不达标时自动重新生成');
  console.log('- ✅ 完整状态管理：全程跟踪处理状态和数据');
  console.log('- ✅ 错误处理：完善的降级和恢复策略');
}

async function demonstrateIndividualAgents() {
  console.log('🔍 单个Agent功能演示');
  console.log('=' .repeat(40));
  console.log('');

  const agents = [
    {
      name: 'intentAnalyzerAgent',
      displayName: '意图分析Agent',
      prompt: '请分析以下用户输入并优化提示词：\n\n用户输入：什么是区块链技术？\n\n请严格按照指定的JSON格式输出分析结果。'
    },
    {
      name: 'contentGeneratorAgent',
      displayName: '内容生成Agent',
      prompt: '请根据以下优化后的提示词生成高质量内容：\n\n优化提示词：请详细解释区块链技术的概念、核心特点、工作原理和主要应用领域\n\n请严格按照指定的JSON格式输出生成结果。'
    },
    {
      name: 'qualityEvaluatorAgent',
      displayName: '质量评估Agent',
      prompt: '请评估以下内容的质量：\n\n用户原始输入：什么是区块链技术？\n\n生成内容：区块链是一种分布式账本技术，通过密码学方法确保数据的安全性和不可篡改性。\n\n请严格按照指定的JSON格式输出评估结果。'
    }
  ];

  for (const agentInfo of agents) {
    console.log(`🤖 测试 ${agentInfo.displayName}`);
    console.log('-' .repeat(30));

    try {
      const agent = mastra.getAgent(agentInfo.name);
      console.log('✅ 成功获取Agent');

      const result = await agent.generate([
        {
          role: 'user',
          content: agentInfo.prompt,
        },
      ]);

      console.log('📤 Agent响应（前300字符）:');
      console.log(result.text.substring(0, 300) + '...');
      console.log('');

    } catch (error) {
      console.error(`❌ ${agentInfo.displayName}测试失败:`, error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
      }
      console.log('');
    }
  }
}

// 主函数
async function main() {
  try {
    // 首先演示单个Agent
    await demonstrateIndividualAgents();
    
    console.log('=' .repeat(60));
    console.log('');
    
    // 然后演示完整workflow
    await demonstrateIntelligentWorkflow();
    
  } catch (error) {
    console.error('演示过程中发生错误:', error);
  }
}

// 运行演示
if (require.main === module) {
  main().catch(console.error);
}

export { demonstrateIntelligentWorkflow, demonstrateIndividualAgents };
