import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min, IsBoolean } from 'class-validator';
import {
  DeviceModel,
  ManufactoringStatus,
  OperationalStatus,
} from '@prisma/client';

export class QueryDevicesDto {
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
  @IsEnum(DeviceModel)
  model?: DeviceModel;

  @IsOptional()
  @IsEnum(ManufactoringStatus)
  manufactoringStatus?: ManufactoringStatus;

  @IsOptional()
  @IsEnum(OperationalStatus)
  operationalStatus?: OperationalStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableForRental?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ownerId?: number;
}
