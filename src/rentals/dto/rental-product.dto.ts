import { IsInt, Min } from 'class-validator';

export class RentalProductDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
