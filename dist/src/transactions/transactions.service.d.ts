import { PrismaService } from '../prisma/prisma.service';
import { PackagesService } from '../packages/packages.service';
import { VendorService } from '../vendor/vendor.service';
interface BulkOrderData {
    orders: Array<{
        playerId: string;
        identifier: string;
        packageCodes: string[];
        gameName: string;
    }>;
    placedBy: string;
}
interface UserOrderResult {
    playerId: string;
    identifier: string;
    gameName: string;
    success: boolean;
    packages: Array<{
        packageCode: string;
        packageName: string;
        price: number;
        success: boolean;
        error?: string;
    }>;
    totalCost: number;
    transactionId?: string;
    orderId?: string;
    error?: string;
}
interface BulkOrderResponse {
    success: boolean;
    results: UserOrderResult[];
    summary: {
        totalOrders: number;
        successfulOrders: number;
        failedOrders: number;
        totalCost: number;
        partialSuccessOrders: number;
    };
    message: string;
}
export declare class TransactionsService {
    private prisma;
    private packagesService;
    private vendorService;
    constructor(prisma: PrismaService, packagesService: PackagesService, vendorService: VendorService);
    findAll(filters?: {
        type?: string;
        status?: string;
        userRole?: string;
        search?: string;
        dateFrom?: string;
        dateTo?: string;
        skip?: number;
        take?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        transactions: ({
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            region: string | null;
            notes: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            quantity: number;
            packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            packagePriceVersion: number | null;
            vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            adminNotes: string | null;
            exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            gameUserId: string | null;
            serverId: string | null;
            playerName: string | null;
            vendorName: string | null;
            vendorCurrency: string | null;
            specialPricing: boolean;
            priceType: string | null;
        })[];
        total: number;
        hasMore: boolean;
    }>;
    getTransactionStats(): Promise<{
        totalTransactions: number;
        completedTransactions: number;
        failedTransactions: number;
        processingTransactions: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        todayTransactions: number;
        successRate: number;
    }>;
    updateTransactionStatus(id: string, status: string, adminNotes?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        region: string | null;
        notes: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        quantity: number;
        packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
        packagePriceVersion: number | null;
        vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
        adminNotes: string | null;
        exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
        gameUserId: string | null;
        serverId: string | null;
        playerName: string | null;
        vendorName: string | null;
        vendorCurrency: string | null;
        specialPricing: boolean;
        priceType: string | null;
    }>;
    processBulkOrder(bulkOrderData: BulkOrderData): Promise<BulkOrderResponse>;
    private processUserOrder;
    private processPackage;
    createOrder(orderData: {
        packageId: string;
        playerId: string;
        identifier: string;
        packageCode: string;
        gameName: string;
        userId: string;
        playerDetails: {
            playerId: string;
            identifier: string;
            game: string;
        };
    }): Promise<{
        success: boolean;
        order: {
            id: string;
            status: string;
            amount: number;
            packageName: string;
            playerId: string;
            createdAt: Date;
        };
        orderId: string;
        message: string;
    }>;
    findById(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PackageStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        region: string;
        description: string | null;
        amount: number | null;
        type: import(".prisma/client").$Enums.PackageType;
        currency: string;
        vendorCurrency: string;
        price: import("@prisma/client/runtime/library").Decimal;
        basePrice: import("@prisma/client/runtime/library").Decimal | null;
        imageUrl: string | null;
        gameId: string;
        featured: boolean;
        discount: number | null;
        duration: number | null;
        packageStatus: number;
        baseVendorCost: import("@prisma/client/runtime/library").Decimal;
        markupPercent: import("@prisma/client/runtime/library").Decimal;
        lockedPrice: import("@prisma/client/runtime/library").Decimal | null;
        lastPriceUpdate: Date | null;
        priceVersion: number;
        isPriceLocked: boolean;
        roundToNearest: import("@prisma/client/runtime/library").Decimal;
        markupId: string | null;
        markupAppliedAt: Date | null;
        gameName: string;
        vendor: string;
        vendorPackageCode: string;
        vendorPrice: import("@prisma/client/runtime/library").Decimal;
        resellKeyword: string | null;
        stock: number | null;
    }[]>;
    createTransaction(userId: string, packageId: string, quantity?: number): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        region: string | null;
        notes: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        quantity: number;
        packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
        packagePriceVersion: number | null;
        vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
        adminNotes: string | null;
        exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
        gameUserId: string | null;
        serverId: string | null;
        playerName: string | null;
        vendorName: string | null;
        vendorCurrency: string | null;
        specialPricing: boolean;
        priceType: string | null;
    }>;
    getSmileCoinBalanceByRegion(userId: string, region: string): Promise<number>;
}
export {};
