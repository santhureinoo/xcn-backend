import { IsEmail, IsString, IsOptional, MinLength, IsEnum, IsNumber, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class SmileCoinBalanceDto {
  @IsString()
  region: string;

  @IsNumber()
  @Min(0)
  balance: number;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(['retailer', 'reseller', 'admin'])
  role?: 'retailer' | 'reseller' | 'admin';

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission?: number; // For resellers

  @IsOptional()
  @IsString()
  referralCode?: string; // For resellers

  @IsOptional()
  @IsString()
  referredBy?: string; // For resellers who were referred

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SmileCoinBalanceDto)
  smileCoinBalances?: SmileCoinBalanceDto[];
}