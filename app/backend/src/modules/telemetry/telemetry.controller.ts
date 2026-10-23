import { Body, Controller, DefaultValuePipe, Get, HttpCode, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { TelemetryService } from './telemetry.service';
import { RecordEventsDto } from './dto/record-events.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetry: TelemetryService) {}

  // Open to everyone (visitors too) but tightly rate-limited, and it only ever stores the
  // sanitised kinds in TelemetryService.sanitizeEvent.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(204)
  @Post()
  async record(@Body() dto: RecordEventsDto): Promise<void> {
    await this.telemetry.record(dto.events);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRATOR)
  @Get('summary')
  summary(@Query('days', new DefaultValuePipe(14), ParseIntPipe) days: number) {
    return this.telemetry.summary(Math.min(Math.max(days, 1), 90));
  }
}
