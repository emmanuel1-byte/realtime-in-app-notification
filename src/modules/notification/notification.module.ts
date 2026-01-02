import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { NotificationGateWay } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService, NotificationService, NotificationGateWay],
  controllers: [NotificationController],
  exports: [NotificationGateWay],
})
export class NotificationModule {}
