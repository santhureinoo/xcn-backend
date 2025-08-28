import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ProductListRequestDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  product?: string;

  @IsString()
  @IsOptional()
  productid?: string;

  @IsString()
  @IsOptional()
  userid?: string;

  @IsString()
  @IsOptional()
  zoneid?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  sign?: string;
}