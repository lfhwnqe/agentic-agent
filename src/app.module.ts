import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MastraModule } from './mastra.module';

@Module({
  imports: [MastraModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
