import { IsString, IsInt, Min } from 'class-validator';

export class CreateChipTypeDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsInt()
  @Min(0)
  totalStock: number;
}
