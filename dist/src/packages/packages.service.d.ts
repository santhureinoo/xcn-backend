import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesService {
    private prisma;
    togglePackageStatus(id: string): Promise<{
        success: boolean;
        package: any;
        message: string;
    }>;
    constructor(prisma: PrismaService);
    getPackagePrice(packageData: any, userRole: string): number;
    isSpecialPricing(packageData: any, userRole: string): boolean;
    calculateMixedVendorCosts(packages: any[], userRole: string): {
        xCoinCost: number;
        smileCoinCost: number;
        hasSmilePackages: boolean;
    };
    private transformPackageForResponse;
    create(createPackageDto: CreatePackageDto): Promise<{
        success: boolean;
        package: any;
        message: string;
    }>;
    findAll(filters?: {
        region?: string;
        gameName?: string;
        vendor?: string;
        status?: string;
        search?: string;
        skip?: number;
        take?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
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
    findById(ids: string): Promise<any[]>;
    update(id: string, updatePackageDto: UpdatePackageDto): Promise<{
        success: boolean;
        package: any;
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
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
    logStockUpdate(packageId: string, previousStock: number, newStock: number, adminId: string, notes?: string): Promise<void>;
    getRegions(): Promise<string[]>;
    getGames(): Promise<string[]>;
    findByCode(code: string, gameName?: string): Promise<{
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
    } | null>;
    searchMultiplePackagesByCodes(codes: string[], gameName: string): Promise<{
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
    }>;
    searchPackageByCode(code: string, gameName: string): Promise<{
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
    } | null>;
    calculateTotalPrice(packages: any[]): number;
    validateBulkOrderPackages(orders: Array<{
        playerId: string;
        identifier: string;
        packageCodes: string[];
        gameName: string;
    }>): Promise<{
        playerId: string;
        identifier: string;
        gameName: string;
        foundPackages: any[];
        notFoundCodes: string[];
        isValid: boolean;
        totalCost: number;
    }[]>;
    getRegionsByGame(gameName: string): Promise<string[]>;
}
