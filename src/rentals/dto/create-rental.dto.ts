import {
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RentalProductDto } from './rental-product.dto';
import { ChipRangeDto } from './chip-range.dto';

export class CreateRentalDto {
  @IsInt()
  clientId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  expectedEndDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  deviceIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalProductDto)
  @IsOptional()
  products?: RentalProductDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productUnitIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChipRangeDto)
  @IsOptional()
  chipRanges?: ChipRangeDto[];
}
