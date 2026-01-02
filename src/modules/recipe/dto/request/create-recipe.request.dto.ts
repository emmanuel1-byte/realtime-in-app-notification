/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsUrl } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  steps: string;

  @IsUrl()
  fileUrl: string;
}
