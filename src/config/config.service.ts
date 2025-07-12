import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('port') || 3000;
  }

  get googleApiKey(): string {
    const apiKey = this.configService.get<string>('google.apiKey');
    if (!apiKey) {
      throw new Error(
        'GOOGLE_GENERATIVE_AI_API_KEY is required but not provided',
      );
    }
    return apiKey;
  }

  get workflowMaxRetries(): number {
    return this.configService.get<number>('workflow.maxRetries') || 3;
  }

  get workflowQualityThreshold(): number {
    return this.configService.get<number>('workflow.qualityThreshold') || 7.0;
  }

  get workflowLogLevel(): string {
    return this.configService.get<string>('workflow.logLevel') || 'info';
  }

  // 验证必需的环境变量
  validateConfig(): void {
    try {
      this.googleApiKey; // 这会触发验证
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Configuration validation failed: ${errorMessage}`);
    }
  }
}
