import { VendorRatesService } from './vendor-rates.service';
export declare class VendorRatesController {
    private vendorRatesService;
    constructor(vendorRatesService: VendorRatesService);
    getVendorRates(): Promise<{
        success: boolean;
        rates: {
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
        }[];
    }>;
    updateVendorRate(updateData: {
        vendorName: string;
        vendorCurrency: string;
        region: string;
        newRate: number;
        updatedBy: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        rate: any;
    }>;
    getVendorRateHistory(vendorName: string, vendorCurrency: string, region: string): Promise<{
        success: boolean;
        history: {
            updatedAt: Date;
            xCoinRate: import("@prisma/client/runtime/library").Decimal;
            previousRate: import("@prisma/client/runtime/library").Decimal | null;
            rateHistory: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
}
