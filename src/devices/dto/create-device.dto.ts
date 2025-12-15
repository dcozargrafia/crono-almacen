import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import {
  DeviceModel,
  ManufacturingStatus,
  OperationalStatus,
  FrequencyRegion,
} from '@prisma/client';

export class CreateDeviceDto {
  // Required fields
  @IsEnum(DeviceModel)
  model: DeviceModel;

  @IsString()
  @IsNotEmpty()
  manufactoringCode: string;

  // Optional status fields (have defaults in DB)
  @IsEnum(ManufacturingStatus)
  @IsOptional()
  manufactoringStatus?: ManufacturingStatus;

  @IsEnum(OperationalStatus)
  @IsOptional()
  operationalStatus?: OperationalStatus;

  @IsBoolean()
  @IsOptional()
  availableForRental?: boolean;

  // Optional identification
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsInt()
  @IsOptional()
  portCount?: number;

  @IsEnum(FrequencyRegion)
  @IsOptional()
  frequencyRegion?: FrequencyRegion;

  // Optional metadata
  @IsDateString()
  @IsOptional()
  manufacturingDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Optional owner
  @IsInt()
  @IsOptional()
  ownerId?: number;

  // TSONE/TS2/TS2+ specific (all optional)
  @IsString()
  @IsOptional()
  reader1SerialNumber?: string;

  @IsString()
  @IsOptional()
  reader2SerialNumber?: string;

  @IsString()
  @IsOptional()
  cpuSerialNumber?: string;

  @IsString()
  @IsOptional()
  batterySerialNumber?: string;

  @IsString()
  @IsOptional()
  tsPowerModel?: string;

  @IsString()
  @IsOptional()
  cpuFirmware?: string;

  @IsString()
  @IsOptional()
  gx1ReadersRegion?: string;

  @IsBoolean()
  @IsOptional()
  hasGSM?: boolean;

  @IsBoolean()
  @IsOptional()
  hasGUN?: boolean;

  // CLB specific (all optional)
  @IsString()
  @IsOptional()
  bluetoothAdapter?: string;

  @IsString()
  @IsOptional()
  coreVersion?: string;

  @IsString()
  @IsOptional()
  heatsinks?: string;

  @IsString()
  @IsOptional()
  picVersion?: string;
}
