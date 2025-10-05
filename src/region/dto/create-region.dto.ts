import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum RegionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateRegionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(RegionStatus)
  status?: RegionStatus;
}