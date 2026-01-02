/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthenticatedSocket } from './interface/authenticated-socket.interface';

/**
 * WebSocket Gateway responsible for delivering real-time notifications
 * to authenticated users under the "notification" namespace.
 */
@WebSocketGateway({ namespace: 'notification' })
export class NotificationGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateWay.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: IAuthenticatedSocket) {
    try {
      const user = await this.authenticateClient(client);
      client.data.user = user;

      await this.JoinPersonalRoom(client);
      await this.deliverPendingNotification(client);
    } catch (error) {
      this.logger.error(error);
      this.authenticateClientError(client, error);
    }
  }

  handleDisconnect(client: IAuthenticatedSocket) {
    const userId = client.data.user?.sub;
    if (userId) {
      this.logger.log(`User disconnected: ${client.id} (userId: ${userId})`);
    } else {
      this.logger.log(`User disconnected: ${client.id}`);
    }
  }

  async publishRecipeCreatedNotification(notifcations: any, recipe: any) {
    for (const notifcation of notifcations) {
      const personalRoom = this.getPersonalRoom(notifcation.userId);
      const usersOnlineStatus = await this.server.fetchSockets();
      if (usersOnlineStatus.length > 0) {
        this.server.to(personalRoom).emit('recipe_created', {
          title: recipe.title,
          content: recipe.steps,
          fileUrl: recipe.fileUrl,
        });
        await this.notificationService.markNotificationAsDelivered(
          notifcation.userId,
          notifcation.notificationId,
        );
      }
    }
  }

  private async JoinPersonalRoom(client: IAuthenticatedSocket) {
    const personalRoom = this.getPersonalRoom(client.data.user.sub);
    await client.join(personalRoom);
  }

  private async deliverPendingNotification(client: IAuthenticatedSocket) {
    const notifcations =
      await this.notificationService.listUndeliveredNotifcation(
        client.data.user.sub,
      );
    const personalRoom = this.getPersonalRoom(client.data.user.sub);
    for (const notifcation of notifcations) {
      await this.notificationService.markNotificationsAsDelivered(
        notifcation.userId,
      );
      this.server.to(personalRoom).emit('pending_notification', {
        title: notifcation.notification.title,
        content: notifcation.notification.content,
        fileUrl: notifcation.notification.fileUrl,
      });
    }
  }

  private getPersonalRoom(userId: string) {
    const personalRoom = `user:${userId}`;
    return personalRoom;
  }

  private async authenticateClient(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      throw new BadRequestException('Token is required!');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new WsException('Token expired');
      } else if (error instanceof JsonWebTokenError) {
        throw new WsException('Token is invalid');
      }

      throw error;
    }
  }

  private authenticateClientError(client: Socket, error: any) {
    this.logger.error(
      `Authentication failed for client ${client.id}: ${error.message}`,
    );

    const errorMessage =
      error instanceof WsException ? error.message : 'Authentication failed';

    client.emit('error', { errorMessage });
    client.disconnect();
  }

  private extractToken(client: Socket) {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return client.handshake.auth?.token || null;
  }
}
