import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @IsDefined()
  email: string;

  @IsString()
  @MinLength(8)
  @IsDefined()
  password: string;
}
