import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
export declare class RegionService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAll(filters?: {
        status?: string;
        search?: string;
        skip?: number;
        take?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
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
    getRegionStats(): Promise<{
        totalRegions: number;
        activeRegions: number;
        inactiveRegions: number;
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
        region: string;
        vendorName: string | null;
    }[]>;
}
