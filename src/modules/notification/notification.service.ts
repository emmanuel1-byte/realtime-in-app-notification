import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ICreateNotification } from './interface/create-notification.interface';
import { NotificationFilterDto } from './dto/request/filter.request.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(data: ICreateNotification) {
    const existingNotification =
      await this.prismaService.notification.findUnique({
        where: { title: data.title },
      });
    if (existingNotification) {
      throw new ConflictException('Notification already exist');
    }

    const newNotification = await this.prismaService.notification.create({
      data: { ...data },
    });
    return newNotification;
  }

  async listNotification(userId: string, filter: NotificationFilterDto) {
    const { page, limit } = filter;

    const [recipes, total] = await Promise.all([
      this.prismaService.userNotification.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        include: { notification: true },
      }),
      this.prismaService.userNotification.count({ where: { userId } }),
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

  async listUndeliveredNotifcation(userId: string) {
    const notifcations = await this.prismaService.userNotification.findMany({
      where: { userId },
      include: { notification: true },
    });
    return notifcations;
  }

  async getUnreadNotifcationsCount(userId: string) {
    const unreadNotifications = await this.prismaService.userNotification.count(
      { where: { userId, read: false } },
    );
    return unreadNotifications;
  }

  async getNotification(userId: string, notificationId: string) {
    try {
      const existingNotification =
        await this.prismaService.userNotification.findUnique({
          where: {
            notificationId_userId: { notificationId, userId },
          },
          include: { notification: true },
        });
      if (!existingNotification) {
        throw new NotFoundException('This notification does not exist');
      }

      if (!existingNotification.read) {
        await this.prismaService.userNotification.update({
          where: {
            notificationId_userId: { notificationId, userId },
          },
          data: { read: true },
        });
      }

      return existingNotification;
    } catch (error) {
      this.logger.error(`Failed to retrieve notification: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An error occured');
    }
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      const existingNotification =
        await this.prismaService.userNotification.findUnique({
          where: {
            notificationId_userId: { notificationId, userId },
          },
        });
      if (!existingNotification) {
        throw new ConflictException('Notification not found');
      }

      const updatedNotification =
        await this.prismaService.userNotification.update({
          where: {
            notificationId_userId: { notificationId, userId },
            read: false,
          },
          data: { read: true },
        });

      return updatedNotification;
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An error occured');
    }
  }

  async markNotificationsAsDelivered(userId: string) {
    const updatedNotifications =
      await this.prismaService.userNotification.updateMany({
        where: { userId, delivered: false },
        data: { delivered: true },
      });

    return updatedNotifications;
  }

  async markNotificationAsDelivered(userId: string, notificationId: string) {
    try {
      const existingNotification =
        await this.prismaService.userNotification.findUnique({
          where: { notificationId_userId: { notificationId, userId } },
        });

      if (!existingNotification) {
        throw new NotFoundException('Notification not found');
      }

      const updatedNotification =
        await this.prismaService.userNotification.update({
          where: { notificationId_userId: { notificationId, userId } },
          data: { delivered: true },
        });
      return updatedNotification;
    } catch (error) {
      this.logger.error(`Failed to mark notification as delivered: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An error occured');
    }
  }
}
