/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
export class SignupDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(15)
  @MinLength(5)
  password: string;
}
