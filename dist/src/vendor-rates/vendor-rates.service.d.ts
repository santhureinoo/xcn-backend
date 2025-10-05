import { PrismaService } from '../prisma/prisma.service';
export declare class VendorRatesService {
    private prisma;
    constructor(prisma: PrismaService);
    updateVendorRate(vendorName: string, vendorCurrency: string, region: string, newXCoinRate: number, updatedBy: string, reason?: string): Promise<any>;
    private updatePackagePrices;
    private calculatePackagePrice;
    private calculateVendorPrice;
    getVendorRates(): Promise<{
        xCoinRate: number;
        change24h: number;
        previousRate: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        region: string;
        vendorName: string;
        vendorCurrency: string;
        trend: import(".prisma/client").$Enums.RateTrend;
        isActive: boolean;
        rateHistory: import("@prisma/client/runtime/library").JsonValue | null;
        updatedBy: string | null;
        updateReason: string | null;
    }[]>;
    getVendorRateHistory(vendorName: string, vendorCurrency: string, region: string): Promise<{
        updatedAt: Date;
        xCoinRate: import("@prisma/client/runtime/library").Decimal;
        previousRate: import("@prisma/client/runtime/library").Decimal | null;
        rateHistory: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
}
