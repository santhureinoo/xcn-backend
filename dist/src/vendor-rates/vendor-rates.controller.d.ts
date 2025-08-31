import { VendorRatesService } from './vendor-rates.service';
export declare class VendorRatesController {
    private vendorRatesService;
    constructor(vendorRatesService: VendorRatesService);
    getVendorRates(): Promise<{
        success: boolean;
        rates: {
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
        }[];
    }>;
    updateVendorRate(updateData: {
        vendorName: string;
        vendorCurrency: string;
        newRate: number;
        updatedBy: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        rate: any;
    }>;
    getVendorRateHistory(vendorName: string, vendorCurrency: string): Promise<{
        success: boolean;
        history: {
            xCoinRate: import("@prisma/client/runtime/library").Decimal;
            previousRate: import("@prisma/client/runtime/library").Decimal | null;
            rateHistory: import("@prisma/client/runtime/library").JsonValue;
            updatedAt: Date;
        } | null;
    }>;
}
