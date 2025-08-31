import { PrismaService } from '../prisma/prisma.service';
export declare class VendorRatesService {
    private prisma;
    constructor(prisma: PrismaService);
    updateVendorRate(vendorName: string, vendorCurrency: string, newXCoinRate: number, updatedBy: string, reason?: string): Promise<any>;
    private updatePackagePrices;
    private calculatePackagePrice;
    private calculateVendorPrice;
    getVendorRates(): Promise<{
        id: string;
        vendorName: string;
        vendorCurrency: string;
        xCoinRate: import("@prisma/client/runtime/library").Decimal;
        trend: import(".prisma/client").$Enums.RateTrend;
        change24h: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        previousRate: import("@prisma/client/runtime/library").Decimal | null;
        rateHistory: import("@prisma/client/runtime/library").JsonValue | null;
        updatedBy: string | null;
        updateReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getVendorRateHistory(vendorName: string, vendorCurrency: string): Promise<{
        xCoinRate: import("@prisma/client/runtime/library").Decimal;
        previousRate: import("@prisma/client/runtime/library").Decimal | null;
        rateHistory: import("@prisma/client/runtime/library").JsonValue;
        updatedAt: Date;
    } | null>;
}
