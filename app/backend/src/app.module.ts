import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FarmsModule } from './modules/farms/farms.module';
import { ExpertsModule } from './modules/experts/experts.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { CasesModule } from './modules/cases/cases.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LearningModule } from './modules/learning/learning.module';
import { SoilLabModule } from './modules/soil-lab/soil-lab.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { MediaModule } from './modules/media/media.module';
import { HariharaaModule } from './modules/hariharaa/hariharaa.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { HealthController } from './health/health.controller';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // A generous per-visitor ceiling for everything (phones on one mobile network often share a
    // single address, so it is deliberately high); the log-in and sign-up routes set tighter
    // limits of their own (see AuthController), and a wrong-password lock per number backs them up.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 600 }]),
    PrismaModule,
    AuditModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    FarmsModule,
    ExpertsModule,
    ConfigurationModule,
    CasesModule,
    KnowledgeModule,
    ReportsModule,
    LearningModule,
    SoilLabModule,
    MarketplaceModule,
    HariharaaModule,
    AddressesModule,
    MediaModule,
    TelemetryModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
