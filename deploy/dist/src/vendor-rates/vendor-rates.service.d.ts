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
        createdAt: Date;
        updatedAt: Date;
        vendorName: string;
        vendorCurrency: string;
        xCoinRate: number;
        trend: import(".prisma/client").$Enums.RateTrend;
        change24h: number;
        isActive: boolean;
        previousRate: number | null;
        rateHistory: import("@prisma/client/runtime/library").JsonValue | null;
        updatedBy: string | null;
        updateReason: string | null;
    }[]>;
    getVendorRateHistory(vendorName: string, vendorCurrency: string): Promise<{
        updatedAt: Date;
        xCoinRate: number;
        previousRate: number | null;
        rateHistory: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
}
