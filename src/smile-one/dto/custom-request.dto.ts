import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export class CustomRequestDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsObject()
  params: Record<string, any>;
}