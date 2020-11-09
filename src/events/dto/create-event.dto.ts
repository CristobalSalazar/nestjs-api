import { IsDateString, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  @IsDefined()
  start: Date;

  @IsDateString()
  @IsDefined()
  end: Date;
}
