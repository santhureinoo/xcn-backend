import { Test, TestingModule } from '@nestjs/testing';
import { RegionGameVendorService } from './region-game-vendor.service';

describe('RegionGameVendorService', () => {
  let service: RegionGameVendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegionGameVendorService],
    }).compile();

    service = module.get<RegionGameVendorService>(RegionGameVendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
