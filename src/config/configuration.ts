export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  google: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
  workflow: {
    maxRetries: parseInt(process.env.WORKFLOW_MAX_RETRIES || '3', 10),
    qualityThreshold: parseFloat(process.env.WORKFLOW_QUALITY_THRESHOLD || '7.0'),
    logLevel: process.env.WORKFLOW_LOG_LEVEL || 'info',
  },
});
