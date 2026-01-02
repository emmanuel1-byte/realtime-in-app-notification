/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.request.dto';

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
