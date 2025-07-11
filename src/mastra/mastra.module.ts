import { Module } from '@nestjs/common';
import { MastraService } from './mastra.service';
import { MastraController } from './mastra.controller';

@Module({
  controllers: [MastraController],
  providers: [MastraService],
  exports: [MastraService],
})
export class MastraModule {}
