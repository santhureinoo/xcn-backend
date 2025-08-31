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
}
