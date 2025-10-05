import { PrismaService } from '../prisma/prisma.service';
export declare class CurrencyService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrencyStats(): Promise<{
        totalXCoinsInCirculation: number;
        totalXCoinsPurchased24h: number;
        totalXCoinsSpent24h: number;
        totalRevenue24h: number;
        averageExchangeRate: number;
        activeUsers24h: number;
    }>;
    getExchangeRates(): Promise<{
        id: string;
        fromCurrency: string;
        toCurrency: string;
        rate: number;
        trend: string;
        change24h: number;
        lastUpdated: string;
        fromCurrencyName: string;
        toCurrencyName: string;
    }[]>;
    updateExchangeRate(fromCurrency: string, toCurrency: string, newRate: number): Promise<{
        id: string;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        trend: string;
        change24h: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: string;
        fromCurrencyName: string;
        toCurrencyName: string;
    }>;
    getCurrencies(): Promise<{
        symbol: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        code: string;
        flag: string | null;
    }[]>;
    createExchangeRate(fromCurrency: string, toCurrency: string, rate: number): Promise<{
        id: string;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        trend: string;
        change24h: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: string;
        fromCurrencyName: string;
        toCurrencyName: string;
    }>;
}
