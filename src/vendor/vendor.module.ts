import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorRetryService } from './vendor-retry.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VendorService, VendorRetryService],
  exports: [VendorService, VendorRetryService],
})
export class VendorModule {}
