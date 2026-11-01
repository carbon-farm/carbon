import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { TesterFeedbackService } from './tester-feedback.service';
import { CreateTesterCommentDto, CreateTesterFeedbackDto, UpdateTesterStatusDto } from './dto/tester-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';

const HOUR = 3_600_000;

@Controller('tester-feedback')
export class TesterFeedbackController {
  constructor(private readonly service: TesterFeedbackService) {}

  // ---- the link: Administrator only

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRATOR)
  @Get('link')
  async link() {
    return { key: await this.service.getLinkKey() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRATOR)
  @Post('link/rotate')
  async rotate(@CurrentUser() user: AuthenticatedUser) {
    return { key: await this.service.rotateLinkKey(user.userId) };
  }

  // ---- the board: no sign-in, the secret in the address is the key. Reads are limited too, so a
  // wrong key cannot be guessed at speed.

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('board/:key')
  list(@Param('key') key: string) {
    return this.service.list(key);
  }

  @Throttle({ default: { limit: 30, ttl: HOUR } })
  @Post('board/:key')
  create(@Param('key') key: string, @Body() dto: CreateTesterFeedbackDto) {
    return this.service.create(key, dto);
  }

  @Throttle({ default: { limit: 60, ttl: HOUR } })
  @Post('board/:key/:id/comments')
  comment(@Param('key') key: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateTesterCommentDto) {
    return this.service.comment(key, id, dto);
  }

  @Throttle({ default: { limit: 60, ttl: HOUR } })
  @Patch('board/:key/:id/status')
  setStatus(@Param('key') key: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTesterStatusDto) {
    return this.service.setStatus(key, id, dto);
  }
}
