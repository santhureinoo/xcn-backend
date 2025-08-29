import { CurrencyService } from './currency.service';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    getCurrencyStats(): Promise<{
        success: boolean;
        stats: {
            totalXCoinsInCirculation: number;
            totalXCoinsPurchased24h: number;
            totalXCoinsSpent24h: number;
            totalRevenue24h: number;
            averageExchangeRate: number;
            activeUsers24h: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        stats?: undefined;
    }>;
    getExchangeRates(): Promise<{
        success: boolean;
        rates: {
            id: string;
            fromCurrency: string;
            toCurrency: string;
            rate: number;
            trend: string;
            change24h: number;
            lastUpdated: string;
            fromCurrencyName: string;
            toCurrencyName: string;
        }[];
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        rates?: undefined;
    }>;
    updateExchangeRate(fromCurrency: string, toCurrency: string, body: {
        rate: number;
    }): Promise<{
        success: boolean;
        rate: {
            id: string;
            fromCurrency: string;
            toCurrency: string;
            rate: number;
            trend: string;
            change24h: number;
            lastUpdated: string;
            fromCurrencyName: string;
            toCurrencyName: string;
        };
        message: string;
    } | {
        success: boolean;
        message: any;
        rate?: undefined;
    }>;
}
