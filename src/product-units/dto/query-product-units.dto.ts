import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min, IsBoolean } from 'class-validator';
import { ProductType, ProductUnitStatus } from '@prisma/client';

export class QueryProductUnitsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsEnum(ProductUnitStatus)
  status?: ProductUnitStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}
