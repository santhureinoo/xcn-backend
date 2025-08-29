declare class SmileCoinBalanceDto {
    region: string;
    balance: number;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    role?: 'retailer' | 'reseller' | 'admin';
    balance?: number;
    commission?: number;
    referralCode?: string;
    referredBy?: string;
    smileCoinBalances?: SmileCoinBalanceDto[];
}
export {};
