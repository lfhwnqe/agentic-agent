/**
 * 交易工作流 API 测试脚本
 * 
 * 此脚本用于测试集成到 NestJS 中的交易工作流 REST API 接口
 * 包括正常情况和异常情况的测试用例
 */

import axios from 'axios';

// API 基础配置
const API_BASE_URL = 'http://localhost:3000';
const TRADE_WORKFLOW_ENDPOINT = `${API_BASE_URL}/mastra/workflows/trade`;
const HEALTH_CHECK_ENDPOINT = `${API_BASE_URL}/mastra/health`;

// 测试用例数据
const testCases = [
  {
    name: '股票短线交易策略',
    input: {
      userInput: '我想做股票短线交易，有什么好的策略？请提供具体的技术指标和风险控制措施。',
      maxRetries: 2,
    },
  },
  {
    name: '外汇交易策略',
    input: {
      userInput: '我是外汇交易新手，想了解EUR/USD货币对的交易策略，包括入场时机和止损设置。',
      maxRetries: 3,
    },
  },
  {
    name: '加密货币交易策略',
    input: {
      userInput: '比特币现在适合做波段交易吗？请分析当前市场情况并给出交易建议。',
      maxRetries: 1,
    },
  },
  {
    name: '期货交易策略',
    input: {
      userInput: '商品期货交易中如何控制风险？请提供具体的资金管理和仓位控制策略。',
    },
  },
];

// 异常测试用例
const errorTestCases = [
  {
    name: '空输入测试',
    input: {
      userInput: '',
      maxRetries: 2,
    },
  },
  {
    name: '超长输入测试',
    input: {
      userInput: 'A'.repeat(10000), // 10000个字符的超长输入
      maxRetries: 1,
    },
  },
  {
    name: '无效重试次数测试',
    input: {
      userInput: '测试无效重试次数',
      maxRetries: 100, // 超出最大限制
    },
  },
];

/**
 * 执行健康检查
 */
async function testHealthCheck(): Promise<boolean> {
  try {
    console.log('🔍 执行健康检查...');
    const response = await axios.get(HEALTH_CHECK_ENDPOINT);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ 健康检查通过');
      console.log(`   消息: ${response.data.message}`);
      console.log(`   时间: ${response.data.timestamp}`);
      return true;
    } else {
      console.log('❌ 健康检查失败');
      return false;
    }
  } catch (error) {
    console.log('❌ 健康检查异常:', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * 执行交易工作流测试
 */
async function testTradeWorkflow(testCase: any, index: number): Promise<void> {
  console.log(`\n📝 测试用例 ${index + 1}: ${testCase.name}`);
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  try {
    console.log('📤 发送请求...');
    console.log(`   输入: ${testCase.input.userInput.substring(0, 100)}${testCase.input.userInput.length > 100 ? '...' : ''}`);
    console.log(`   最大重试次数: ${testCase.input.maxRetries || '默认'}`);
    
    const response = await axios.post(TRADE_WORKFLOW_ENDPOINT, testCase.input, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2分钟超时
    });
    
    const executionTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ 测试成功');
      console.log(`   执行时间: ${executionTime}ms`);
      
      const result = response.data.data;
      if (result) {
        console.log('📊 结果摘要:');
        console.log(`   成功状态: ${result.success}`);
        console.log(`   总重试次数: ${result.totalRetries}`);
        console.log(`   处理时间: ${result.processingTime}`);
        
        if (result.finalStrategy) {
          console.log(`   策略类型: ${result.finalStrategy.strategyType}`);
          console.log(`   信心度: ${result.finalStrategy.confidence}`);
        }
        
        if (result.tradeEvaluation) {
          console.log(`   整体质量: ${result.tradeEvaluation.overallQuality}`);
          console.log(`   总分: ${result.tradeEvaluation.totalScore}`);
        }
      }
    } else {
      console.log('❌ 测试失败');
      console.log(`   响应状态: ${response.status}`);
      console.log(`   响应数据:`, response.data);
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.log('❌ 测试异常');
    console.log(`   执行时间: ${executionTime}ms`);
    
    if (axios.isAxiosError(error)) {
      console.log(`   HTTP状态: ${error.response?.status}`);
      console.log(`   错误信息: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.error) {
        console.log(`   详细错误: ${error.response.data.error}`);
      }
    } else {
      console.log(`   错误信息: ${error instanceof Error ? error.message : error}`);
    }
  }
}

/**
 * 执行异常测试用例
 */
async function testErrorCases(): Promise<void> {
  console.log('\n🚨 异常情况测试');
  console.log('=' .repeat(60));
  
  for (let i = 0; i < errorTestCases.length; i++) {
    const testCase = errorTestCases[i];
    console.log(`\n⚠️  异常测试 ${i + 1}: ${testCase.name}`);
    
    try {
      const response = await axios.post(TRADE_WORKFLOW_ENDPOINT, testCase.input, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30秒超时
      });
      
      console.log(`   响应状态: ${response.status}`);
      console.log(`   成功状态: ${response.data.success}`);
      
      if (!response.data.success) {
        console.log(`   错误信息: ${response.data.message}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(`   预期错误 - HTTP状态: ${error.response?.status}`);
        console.log(`   错误信息: ${error.response?.data?.message || error.message}`);
      } else {
        console.log(`   异常: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
}

/**
 * 主测试函数
 */
async function runTests(): Promise<void> {
  console.log('🚀 开始交易工作流 API 测试');
  console.log('=' .repeat(60));
  
  // 1. 健康检查
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ 健康检查失败，终止测试');
    return;
  }
  
  // 2. 正常测试用例
  console.log('\n✨ 正常功能测试');
  for (let i = 0; i < testCases.length; i++) {
    await testTradeWorkflow(testCases[i], i);
    
    // 在测试用例之间添加延迟，避免过于频繁的请求
    if (i < testCases.length - 1) {
      console.log('\n⏳ 等待 2 秒...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // 3. 异常测试用例
  await testErrorCases();
  
  console.log('\n🎉 测试完成');
  console.log('=' .repeat(60));
}

// 执行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

export { runTests, testTradeWorkflow, testHealthCheck };
