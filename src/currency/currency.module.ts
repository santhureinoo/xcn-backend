import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

@Module({
  imports: [PrismaModule],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService], // Export service so other modules can use it
})
export class CurrencyModule {}