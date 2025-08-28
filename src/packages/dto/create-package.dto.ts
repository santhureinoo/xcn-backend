import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, isNumber } from 'class-validator';

export enum PackageType {
  DIAMOND = 'DIAMOND',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SPECIAL = 'SPECIAL',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum PackageStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  DELETE = 3,
  OUT_OF_STOCK = 4,
}

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  resellKeyword?: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(PackageType)
  type: PackageType;

  @IsString()
  gameId: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  packageStatus: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  baseVendorCost?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsString()
  region: string;

  @IsString()
  gameName: string;

  @IsString()
  vendor: string;

  @IsArray()
  @IsString({ each: true })
  vendorPackageCodes: string[];

  @IsNumber()
  vendorPrice: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isPriceLocked?: boolean;

  @IsOptional()
  @IsString()
  markupId?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  markupPercent?: number;

  @IsOptional()
  @IsString()
  vendorCurrency?: string;

  @IsOptional()
  @IsNumber()
  roundToNearest?: number;
}