import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRecipeDto } from './dto/request/create-recipe.request.dto';
import { RecipeFilterDto } from './dto/request/filter-recipe.request.dto';
import { UpdateRecipeDto } from './dto/request/update-recipe.request.dto';
import { NotificationType } from 'generated/prisma/enums';
import { NotificationGateWay } from '../notification/notification.gateway';

@Injectable()
export class RecipeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationGateWay: NotificationGateWay,
  ) {}

  async createRecipe(userId: string, data: CreateRecipeDto) {
    const existingRecipe = await this.prismaService.recipe.findUnique({
      where: { title: data.title },
    });
    if (existingRecipe) {
      throw new ConflictException('Recipe already exist');
    }

    /**
     * Create a notification for a newly created recipe
     * and link it to all users who subscribed to
     * RECIPE_CREATED notifications.
     */
    const newRecipe = await this.prismaService.$transaction(async (tx) => {
      const createdRecipe = await this.prismaService.recipe.create({
        data: { ...data, userId },
      });

      const createdNotification = await tx.notification.create({
        data: {
          title: `${createdRecipe.title} Created`,
          content: createdRecipe.steps,
          fileUrl: createdRecipe.fileUrl,
        },
      });
      const notificationPreferences = await tx.notificationPrefrence.findMany({
        where: { type: NotificationType.RECIPE_CREATED_NOT },
      });
      const createdUserNotifications =
        await tx.userNotification.createManyAndReturn({
          data: notificationPreferences.map((np) => ({
            userId: np.userId,
            notificationId: createdNotification.id,
          })),
        });
      return { createdRecipe, createdUserNotifications };
    });

    this.notificationGateWay.publishRecipeCreatedNotification(
      newRecipe.createdUserNotifications,
      newRecipe.createdRecipe,
    );
    return newRecipe;
  }

  async getRecipe(recipeId: string) {
    const existingRecipe = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
      include: { user: { select: { email: true } } },
    });
    if (!existingRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    return existingRecipe;
  }

  async listRecipe(filter: RecipeFilterDto) {
    const { page, limit } = filter;

    const [recipes, total] = await Promise.all([
      this.prismaService.recipe.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.recipe.count(),
    ]);

    return {
      recipes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateRecipe(userId: string, recipeId: string, data: UpdateRecipeDto) {
    const existingRecipe = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!existingRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (existingRecipe.userId !== userId) {
      throw new UnauthorizedException(
        "You can't update this recipe cause you are not the owner.",
      );
    }

    const updatedRecipe = await this.prismaService.recipe.update({
      where: { id: recipeId },
      data: { ...data },
    });

    //Trigger the update-recipe notifcation

    return updatedRecipe;
  }

  async deleteRecipe(userId: string, recipeId: string) {
    const existingRecipe = await this.prismaService.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!existingRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (existingRecipe.userId !== userId) {
      throw new UnauthorizedException(
        "You can't delete this recipe cause you are not the owner.",
      );
    }

    const deletedRecipe = await this.prismaService.recipe.delete({
      where: { id: recipeId },
    });

    //Trigger the delete-recipe notifcation

    return deletedRecipe;
  }
}
