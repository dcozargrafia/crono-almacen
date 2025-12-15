import { IsEnum } from 'class-validator';
import { ManufactoringStatus } from '@prisma/client';

export class UpdateManufactoringStatusDto {
  @IsEnum(ManufactoringStatus)
  status: ManufactoringStatus;
}
