import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
