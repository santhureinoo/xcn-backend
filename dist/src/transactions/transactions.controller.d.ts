import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getTransactions(query: any): Promise<{
        success: boolean;
        transactions: ({
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            quantity: number;
            notes: string | null;
            adminNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            packagePriceVersion: number | null;
            vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            gameUserId: string | null;
            serverId: string | null;
            playerName: string | null;
            region: string | null;
            vendorName: string | null;
            vendorCurrency: string | null;
            specialPricing: boolean;
            priceType: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        transactions?: undefined;
        pagination?: undefined;
    }>;
    getTransactionStats(): Promise<{
        success: boolean;
        stats: {
            totalTransactions: number;
            completedTransactions: number;
            failedTransactions: number;
            processingTransactions: number;
            totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
            todayTransactions: number;
            successRate: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        stats?: undefined;
    }>;
    updateTransactionStatus(id: string, body: {
        status: string;
        adminNotes?: string;
    }): Promise<{
        success: boolean;
        transaction: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            quantity: number;
            notes: string | null;
            adminNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            packagePriceVersion: number | null;
            vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            gameUserId: string | null;
            serverId: string | null;
            playerName: string | null;
            region: string | null;
            vendorName: string | null;
            vendorCurrency: string | null;
            specialPricing: boolean;
            priceType: string | null;
        };
        message: string;
    } | {
        success: boolean;
        message: any;
        transaction?: undefined;
    }>;
    createOrder(req: any, createOrderDto: any): Promise<{
        success: boolean;
        order: {
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
        };
        orderId: string;
        message: string;
    } | {
        success: boolean;
        message: any;
        order?: undefined;
        orderId?: undefined;
    }>;
    getSmileCoinBalanceByRegion(req: any, region: string): Promise<{
        success: boolean;
        balance: number;
        region: string;
        currency: string;
        message?: undefined;
        statusCode?: undefined;
    } | {
        success: boolean;
        message: any;
        statusCode: number;
        balance?: undefined;
        region?: undefined;
        currency?: undefined;
    }>;
    getXCoinTransactions(req: any, query: any): Promise<{
        success: boolean;
        transactions: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.XCoinTransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            fromCurrency: string | null;
            fromAmount: import("@prisma/client/runtime/library").Decimal | null;
            rate: import("@prisma/client/runtime/library").Decimal | null;
            fees: import("@prisma/client/runtime/library").Decimal;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        transactions?: undefined;
        pagination?: undefined;
    }>;
    getPackageTransactions(req: any, query: any): Promise<{
        success: boolean;
        transactions: ({
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
            transactionPackages: ({
                package: {
                    id: string;
                    type: import(".prisma/client").$Enums.PackageType;
                    status: import(".prisma/client").$Enums.PackageStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    region: string;
                    vendorCurrency: string;
                    name: string;
                    description: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    basePrice: import("@prisma/client/runtime/library").Decimal | null;
                    imageUrl: string | null;
                    gameId: string;
                    featured: boolean;
                    discount: number | null;
                    amount: number | null;
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
                    currency: string;
                    resellKeyword: string | null;
                    stock: number | null;
                };
            } & {
                id: string;
                quantity: number;
                createdAt: Date;
                transactionId: string;
                basePrice: number | null;
                packageId: string;
                unitPrice: number;
                totalPrice: number;
                markupApplied: number | null;
                markupType: string | null;
            })[];
        } & {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            quantity: number;
            notes: string | null;
            adminNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            packagePriceVersion: number | null;
            vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            gameUserId: string | null;
            serverId: string | null;
            playerName: string | null;
            region: string | null;
            vendorName: string | null;
            vendorCurrency: string | null;
            specialPricing: boolean;
            priceType: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        transactions?: undefined;
        pagination?: undefined;
    }>;
    getXCoinTransactionById(id: string): Promise<{
        success: boolean;
        transaction: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.XCoinTransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            fromCurrency: string | null;
            fromAmount: import("@prisma/client/runtime/library").Decimal | null;
            rate: import("@prisma/client/runtime/library").Decimal | null;
            fees: import("@prisma/client/runtime/library").Decimal;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        transaction?: undefined;
    }>;
    getSmileCoinTransactions(req: any, query: any): Promise<{
        success: boolean;
        transactions: ({
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
            transactionPackages: ({
                package: {
                    id: string;
                    type: import(".prisma/client").$Enums.PackageType;
                    status: import(".prisma/client").$Enums.PackageStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    region: string;
                    vendorCurrency: string;
                    name: string;
                    description: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    basePrice: import("@prisma/client/runtime/library").Decimal | null;
                    imageUrl: string | null;
                    gameId: string;
                    featured: boolean;
                    discount: number | null;
                    amount: number | null;
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
                    currency: string;
                    resellKeyword: string | null;
                    stock: number | null;
                };
            } & {
                id: string;
                quantity: number;
                createdAt: Date;
                transactionId: string;
                basePrice: number | null;
                packageId: string;
                unitPrice: number;
                totalPrice: number;
                markupApplied: number | null;
                markupType: string | null;
            })[];
        } & {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            quantity: number;
            notes: string | null;
            adminNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            packagePriceAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            packagePriceVersion: number | null;
            vendorRateAtPurchase: import("@prisma/client/runtime/library").Decimal | null;
            exchangeRateSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            gameUserId: string | null;
            serverId: string | null;
            playerName: string | null;
            region: string | null;
            vendorName: string | null;
            vendorCurrency: string | null;
            specialPricing: boolean;
            priceType: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        transactions?: undefined;
        pagination?: undefined;
    }>;
}
