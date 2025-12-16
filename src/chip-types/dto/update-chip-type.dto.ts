import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateChipTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalStock?: number;
}
