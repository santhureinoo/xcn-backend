import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SmileOneService } from './smile-one.service';
import { SmileOneController } from './smile-one.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [SmileOneService],
  controllers: [SmileOneController],
  exports: [SmileOneService],
})
export class SmileOneModule {}