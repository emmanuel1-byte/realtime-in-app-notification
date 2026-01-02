/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/request/create-recipe.request.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RecipeFilterDto } from './dto/request/filter-recipe.request.dto';
import { UpdateRecipeDto } from './dto/request/update-recipe.request.dto';

@UseGuards(AuthGuard)
@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  async createRecipe(@Body() dto: CreateRecipeDto, @Req() req: any) {
    return await this.recipeService.createRecipe(req.user.sub, dto);
  }

  @Get('/:id')
  async getRecipe(@Param('id') recipeId: string) {
    return await this.recipeService.getRecipe(recipeId);
  }

  @Get()
  async listRecipe(@Query() dto: RecipeFilterDto) {
    return await this.recipeService.listRecipe(dto);
  }

  @Patch('/:id')
  async updateRecipe(
    @Param('id') recipeId: string,
    @Req() req: any,
    @Body() dto: UpdateRecipeDto,
  ) {
    return await this.recipeService.updateRecipe(req.user.sub, recipeId, dto);
  }

  @Delete('/:id')
  async deleteRecipe(@Param('id') recipeId: string, @Req() req: any) {
    return await this.recipeService.deleteRecipe(req.user.sub, recipeId);
  }
}
