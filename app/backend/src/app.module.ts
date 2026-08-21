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
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
