import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, ValidateIf } from 'class-validator';

export class CreateMarkupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => !o.flatAmountAdd) // Required if flatAmountAdd is not provided
  percentageAdd?: number;

  @IsOptional()
  @IsNumber()
  @ValidateIf((o) => !o.percentageAdd) // Required if percentageAdd is not provided
  flatAmountAdd?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}