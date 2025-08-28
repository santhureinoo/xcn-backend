import { Module } from '@nestjs/common';
import { RegionGameVendorService } from './region-game-vendor.service';
import { RegionGameVendorController } from './region-game-vendor.controller';
import { SmileOneModule } from '../smile-one/smile-one.module';

@Module({
  imports: [SmileOneModule],
  controllers: [RegionGameVendorController],
  providers: [RegionGameVendorService],
})
export class RegionGameVendorModule {}
