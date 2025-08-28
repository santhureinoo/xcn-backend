import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VendorModule } from '../vendor/vendor.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PackagesService } from 'src/packages/packages.service';

@Module({
  imports: [PrismaModule, VendorModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PackagesService],
  exports: [TransactionsService],
})
export class TransactionsModule {}