import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDto } from './dto/request/signup.request.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/request/login.request.dto';
import { JwtService } from '@nestjs/jwt';
import { NotificationType } from 'generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(data: SignupDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('This user already exist');
    }

    const newUser = await this.prismaService.$transaction(async (tx) => {
      const createdUser = await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
          notificationPrefrences: {
            create: { type: NotificationType.WELCOME_NOT },
          },
        },
      });
      const createdNotification = await tx.notification.create({
        data: {
          title: `Welcome This is your email ${createdUser.email}`,
          content: 'Your can now browse through the list of recipe',
          fileUrl: 'fileUrl',
        },
      });
      await tx.userNotification.create({
        data: {
          notificationId: createdNotification.id,
          userId: createdUser.id,
        },
      });
      return createdUser;
    });

    return newUser;
  }

  async login(data: LoginDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (!existingUser) {
      throw new NotFoundException('Invalid credentials');
    }

    const comparePassword = await bcrypt.compare(
      data.password,
      existingUser.password,
    );
    if (!comparePassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken } = await this.generateToken(existingUser.id);
    return {
      user: existingUser,
      accessToken,
    };
  }

  private async generateToken(userId: string) {
    const payload = { sub: userId };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
