import { Module } from '@nestjs/common';
import { MastraService } from './mastra.service';
import { MastraController } from './mastra.controller';

@Module({
  providers: [MastraService],
  controllers: [MastraController],
  exports: [MastraService],
})
export class MastraModule {}
