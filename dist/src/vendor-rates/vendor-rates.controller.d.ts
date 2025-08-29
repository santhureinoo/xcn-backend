import { VendorRatesService } from './vendor-rates.service';
export declare class VendorRatesController {
    private vendorRatesService;
    constructor(vendorRatesService: VendorRatesService);
    getVendorRates(): Promise<{
        success: boolean;
        rates: {
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
            updatedAt: Date;
            xCoinRate: number;
            previousRate: number | null;
            rateHistory: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    }>;
}
