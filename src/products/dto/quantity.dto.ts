import { IsInt, Min } from 'class-validator';

export class QuantityDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
