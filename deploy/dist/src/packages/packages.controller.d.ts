import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesController {
    private readonly packagesService;
    constructor(packagesService: PackagesService);
    searchPackageByCode(code: string, gameName: string): Promise<{
        success: boolean;
        package: {
            id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PackageType;
            region: string;
            vendorCurrency: string;
            vendorPackageCode: string;
            currency: string;
            description: string | null;
            amount: number | null;
            resellKeyword: string | null;
            price: number;
            imageUrl: string | null;
            gameId: string;
            featured: boolean;
            discount: number | null;
            packageStatus: number;
            baseVendorCost: number;
            duration: number | null;
            gameName: string;
            vendor: string;
            vendorPrice: number;
            stock: number | null;
            isPriceLocked: boolean;
            markupId: string | null;
            basePrice: number | null;
            markupPercent: number;
            roundToNearest: number;
            lockedPrice: number | null;
            lastPriceUpdate: Date | null;
            priceVersion: number;
            markupAppliedAt: Date | null;
        } | null;
        found: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        package: null;
        found: boolean;
    }>;
    searchMultiplePackages(body: {
        codes: string[];
        gameName: string;
    }): Promise<{
        found: {
            id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PackageType;
            region: string;
            vendorCurrency: string;
            vendorPackageCode: string;
            currency: string;
            description: string | null;
            amount: number | null;
            resellKeyword: string | null;
            price: number;
            imageUrl: string | null;
            gameId: string;
            featured: boolean;
            discount: number | null;
            packageStatus: number;
            baseVendorCost: number;
            duration: number | null;
            gameName: string;
            vendor: string;
            vendorPrice: number;
            stock: number | null;
            isPriceLocked: boolean;
            markupId: string | null;
            basePrice: number | null;
            markupPercent: number;
            roundToNearest: number;
            lockedPrice: number | null;
            lastPriceUpdate: Date | null;
            priceVersion: number;
            markupAppliedAt: Date | null;
        }[];
        notFound: string[];
        foundCount: number;
        notFoundCount: number;
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        found: never[];
        notFound: string[];
    }>;
    validateBulkOrderPackages(body: {
        orders: Array<{
            playerId: string;
            identifier: string;
            packageCodes: string[];
            gameName: string;
        }>;
    }): Promise<{
        success: boolean;
        results: {
            playerId: string;
            identifier: string;
            gameName: string;
            foundPackages: any[];
            notFoundCodes: string[];
            isValid: boolean;
            totalCost: number;
        }[];
        summary: {
            totalOrders: number;
            validOrders: number;
            invalidOrders: number;
            totalCost: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        results: never[];
        summary?: undefined;
    }>;
    create(createPackageDto: CreatePackageDto): Promise<{
        success: boolean;
        package: any;
        message: string;
    }>;
    findAll(region?: string, gameName?: string, vendor?: string, status?: string, search?: string, page?: string, limit?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        packages: any[];
        total: number;
        hasMore: boolean;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    }>;
    getPackageStats(): Promise<{
        totalPackages: number;
        activePackages: number;
        inactivePackages: number;
        outOfStockPackages: number;
        totalStock: number;
        averagePrice: number;
        topRegions: {
            region: string;
            count: number;
        }[];
        topGames: {
            game: string;
            count: number;
        }[];
        topVendors: {
            vendor: string;
            count: number;
        }[];
    }>;
    getVendors(): Promise<any[]>;
    findOne(id: string): Promise<any[]>;
    update(id: string, updatePackageDto: UpdatePackageDto): Promise<{
        success: boolean;
        package: any;
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        package: any;
        message: string;
    }>;
}
