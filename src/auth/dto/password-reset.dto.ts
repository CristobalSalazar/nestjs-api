import { IsEmail, IsString } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  @IsEmail()
  email: string;
}
