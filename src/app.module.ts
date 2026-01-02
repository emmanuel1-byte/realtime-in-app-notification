import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    AuthModule,
    RecipeModule,
    NotificationModule,
  ],
})
export class AppModule {}
