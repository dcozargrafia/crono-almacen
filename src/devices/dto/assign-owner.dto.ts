import { IsInt, IsOptional } from 'class-validator';

export class AssignOwnerDto {
  @IsInt()
  @IsOptional()
  ownerId?: number | null; // null para quitar owner
}
