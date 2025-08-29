export declare class CreateExchangeRateDto {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    change24h?: number;
}
export declare class UpdateExchangeRateDto {
    rate?: number;
    change24h?: number;
}
