export declare enum PackageType {
    DIAMOND = "DIAMOND",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    SPECIAL = "SPECIAL",
    SUBSCRIPTION = "SUBSCRIPTION"
}
export declare enum PackageStatus {
    ACTIVE = 1,
    INACTIVE = 2,
    DELETE = 3,
    OUT_OF_STOCK = 4
}
export declare class CreatePackageDto {
    name: string;
    resellKeyword?: string;
    description: string;
    price: number;
    imageUrl?: string;
    type: PackageType;
    gameId: string;
    featured?: boolean;
    discount?: number;
    packageStatus: number;
    amount?: number;
    baseVendorCost?: number;
    duration?: number;
    region: string;
    gameName: string;
    vendor: string;
    vendorPackageCodes: string[];
    vendorPrice: number;
    currency: string;
    status?: PackageStatus;
    stock?: number;
    isPriceLocked?: boolean;
    markupId?: string;
    basePrice?: number;
    markupPercent?: number;
    vendorCurrency?: string;
    roundToNearest?: number;
}
