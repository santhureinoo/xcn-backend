import { Test, TestingModule } from '@nestjs/testing';
import { RegionGameVendorController } from './region-game-vendor.controller';
import { RegionGameVendorService } from './region-game-vendor.service';

describe('RegionGameVendorController', () => {
  let controller: RegionGameVendorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionGameVendorController],
      providers: [RegionGameVendorService],
    }).compile();

    controller = module.get<RegionGameVendorController>(RegionGameVendorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
