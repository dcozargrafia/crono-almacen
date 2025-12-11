import { IsString, IsNotEmpty, MinLength } from 'class-validator';

// ADMIN resets another user's password (no current password required)
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
