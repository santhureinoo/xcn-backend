import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsNumber()
  totalSpent?: number;

  @IsOptional()
  @IsNumber()
  totalOrders?: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @IsOptional()
  @IsNumber()
  downlineCount?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}