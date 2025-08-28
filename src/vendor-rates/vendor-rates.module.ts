import { Module } from '@nestjs/common';
import { VendorRatesService } from './vendor-rates.service';
import { VendorRatesController } from './vendor-rates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VendorRatesController],
  providers: [VendorRatesService],
  exports: [VendorRatesService],
})
export class VendorRatesModule {}