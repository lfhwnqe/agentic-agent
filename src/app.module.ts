import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MastraModule } from './modules/mastra/mastra.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MastraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
