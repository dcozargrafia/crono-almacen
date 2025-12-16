import { IsDateString, IsString, IsOptional } from 'class-validator';

export class UpdateRentalDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  expectedEndDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
