import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppProfileModule } from './app-profile/app-profile.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { ProfileDetailModule } from './profile-detail/profile-detail.module';
import { ScraperModule } from './scraper/scraper.module';
import { SettingsModule } from './settings/settings.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TrackedAccountsModule } from './tracked-accounts/tracked-accounts.module';
import { TrendingModule } from './trending/trending.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),
    HealthModule,
    SupabaseModule,
    AuthModule,
    ScraperModule,
    TrackedAccountsModule,
    PostsModule,
    ProfileDetailModule,
    TrendingModule,
    DashboardModule,
    AppProfileModule,
    SettingsModule,
    NotificationsModule,
    WebhooksModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
