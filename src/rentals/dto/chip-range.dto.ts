import { IsInt, Min } from 'class-validator';

export class ChipRangeDto {
  @IsInt()
  chipTypeId: number;

  @IsInt()
  @Min(1)
  rangeStart: number;

  @IsInt()
  @Min(1)
  rangeEnd: number;
}
