import { Module } from '@nestjs/common';
import { MastraService } from './mastra.service';
import { MastraController } from './mastra.controller';
import { AppConfigService } from '../../config/config.service';

@Module({
  providers: [MastraService, AppConfigService],
  controllers: [MastraController],
  exports: [MastraService],
})
export class MastraModule {}
