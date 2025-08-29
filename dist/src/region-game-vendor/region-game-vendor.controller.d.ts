import { Response } from 'express';
import { RegionGameVendorService } from './region-game-vendor.service';
import { CreateRegionGameVendorDto, UpdateRegionGameVendorDto } from './dto/create-region-game-vendor.dto';
export declare class RegionGameVendorController {
    private readonly regionGameVendorService;
    constructor(regionGameVendorService: RegionGameVendorService);
    getAll(query: any, res: Response): Promise<void>;
    getRegions(query: any, res: Response): Promise<void>;
    getGames(query: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getVendors(query: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCascadeData(query: any, res: Response): Promise<void>;
    getFilteredData(query: any, res: Response): Promise<void>;
    getStats(res: Response): Promise<void>;
    getById(id: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    create(body: CreateRegionGameVendorDto, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkCreate(body: {
        relationships: CreateRegionGameVendorDto[];
    }, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    seedData(res: Response): Promise<void>;
    update(id: string, body: UpdateRegionGameVendorDto, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleStatus(id: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(id: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
