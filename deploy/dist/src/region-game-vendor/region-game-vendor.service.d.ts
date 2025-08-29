import { RegionGameVendor } from '@prisma/client';
import { CreateRegionGameVendorDto, UpdateRegionGameVendorDto, FilterRegionGameVendorDto } from './dto/create-region-game-vendor.dto';
import { SmileOneService } from '../smile-one/smile-one.service';
export declare class RegionGameVendorService {
    private readonly smileOneService;
    constructor(smileOneService: SmileOneService);
    getAll(filters: FilterRegionGameVendorDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            region: string;
            vendorName: string;
            gameName: string;
            isActive: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUniqueRegions(filters: {
        gameName?: string;
        vendorName?: string;
        isActive?: boolean;
    }): Promise<string[]>;
    getUniqueGames(filters: {
        region?: string;
        vendorName?: string;
        isActive?: boolean;
    }): Promise<string[]>;
    getUniqueVendorNames(filters: {
        region?: string;
        gameName?: string;
        isActive?: boolean;
    }): Promise<string[]>;
    checkSmileOneIntegration(region?: string, gameName?: string, vendorName?: string): Promise<{
        smileOneProducts: any;
        integrationInfo: {
            triggered: boolean;
            reason: string;
            region: string;
            gameName: string;
            productCount: any;
            timestamp: string;
            error?: undefined;
        };
    } | {
        smileOneProducts: never[];
        integrationInfo: {
            triggered: boolean;
            reason: string;
            region: string;
            gameName: string;
            productCount: number;
            timestamp: string;
            error: any;
        };
    } | null>;
    getFilteredData(filters: {
        region?: string;
        gameName?: string;
        vendorName?: string;
        isActive?: boolean;
    }): Promise<{
        regions: string[];
        games: string[];
        vendorNames: string[];
    }>;
    getById(id: string): Promise<RegionGameVendor | null>;
    create(data: CreateRegionGameVendorDto): Promise<RegionGameVendor>;
    update(id: string, data: UpdateRegionGameVendorDto): Promise<RegionGameVendor | null>;
    delete(id: string): Promise<boolean>;
    bulkCreate(relationships: CreateRegionGameVendorDto[]): Promise<{
        created: number;
        skipped: number;
    }>;
    toggleStatus(id: string): Promise<RegionGameVendor | null>;
    getStats(): Promise<{
        totalRelationships: number;
        activeRelationships: number;
        inactiveRelationships: number;
        uniqueRegionsCount: number;
        uniqueGamesCount: number;
        uniqueVendorsCount: number;
    }>;
    seedInitialData(): Promise<{
        created: number;
        skipped: number;
    }>;
}
