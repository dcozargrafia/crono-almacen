import { IsEnum } from 'class-validator';
import { ProductUnitStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(ProductUnitStatus)
  status: ProductUnitStatus;
}
