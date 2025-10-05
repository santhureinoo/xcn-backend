import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
export declare class RegionController {
    private readonly regionService;
    constructor(regionService: RegionService);
    create(createRegionDto: CreateRegionDto): Promise<{
        success: boolean;
        region: {
            id: string;
            status: import(".prisma/client").$Enums.RegionStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        message: string;
    }>;
    findAll(status?: string, search?: string, page?: string, limit?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        regions: {
            id: string;
            status: import(".prisma/client").$Enums.RegionStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        }[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    getRegionStats(): Promise<{
        totalRegions: number;
        activeRegions: number;
        inactiveRegions: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RegionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    update(id: string, updateRegionDto: UpdateRegionDto): Promise<{
        success: boolean;
        region: {
            id: string;
            status: import(".prisma/client").$Enums.RegionStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        region: {
            id: string;
            status: import(".prisma/client").$Enums.RegionStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        message: string;
    }>;
    getRegionsByGame(gameName: string): Promise<{
        success: boolean;
        regions: {
            region: string;
            vendorName: string | null;
        }[];
    }>;
}
