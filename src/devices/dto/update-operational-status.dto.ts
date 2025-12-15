import { IsEnum } from 'class-validator';
import { OperationalStatus } from '@prisma/client';

export class UpdateOperationalStatusDto {
  @IsEnum(OperationalStatus)
  status: OperationalStatus;
}
