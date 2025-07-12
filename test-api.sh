#!/bin/bash

echo "🚀 测试 Agentic Agent API"
echo "=========================="

# 测试健康检查
echo "📋 测试健康检查接口..."
curl -X GET http://localhost:3000/mastra/health \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n\n"

# 测试智能工作流（需要API密钥）
echo "🤖 测试智能工作流接口..."
echo "注意：此测试需要在 .env 文件中配置有效的 GOOGLE_GENERATIVE_AI_API_KEY"
curl -X POST http://localhost:3000/mastra/workflows/intelligent \
  -H "Content-Type: application/json" \
  -d '{"userInput": "什么是人工智能？", "maxRetries": 2}' \
  -w "\n状态码: %{http_code}\n\n"

echo "✅ API测试完成"
echo "📖 访问 http://localhost:3000/api 查看完整的Swagger文档"
