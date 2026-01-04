/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { NotificationFilterDto } from './dto/request/filter.request.dto';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get('/unread-count')
  async getUnreadNotifcationsCount(@Req() req: any) {
    return await this.notificationService.getUnreadNotifcationsCount(
      req.user.sub,
    );
  }
  @Get()
  async listNotification(@Req() req: any, @Query() dto: NotificationFilterDto) {
    return await this.notificationService.listNotification(req.user.sub, dto);
  }

  @Get('/:id')
  async getNotification(@Req() req: any, @Param('id') notificationId: string) {
    return await this.notificationService.getNotification(
      req.user.sub,
      notificationId,
    );
  }
}
