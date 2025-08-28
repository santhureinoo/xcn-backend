export class CreateExchangeRateDto {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    change24h?: number;
  }
  
  export class UpdateExchangeRateDto {
    rate?: number;
    change24h?: number;
  }
  