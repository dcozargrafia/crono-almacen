import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ProductType } from '@prisma/client';

export class CreateProductUnitDto {
  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
