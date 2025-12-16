import { IsArray, ValidateNested, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SequenceItemDto {
  @IsInt()
  @Min(1)
  chip: number;

  @IsString()
  code: string;
}

export class UploadSequenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceItemDto)
  sequence: SequenceItemDto[];
}
