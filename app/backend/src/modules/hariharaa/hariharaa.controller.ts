import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { HariharaaService } from './hariharaa.service';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hariharaa')
export class HariharaaController {
  constructor(private readonly hariharaaService: HariharaaService) {}

  @Roles(Role.ADMINISTRATOR)
  @Get('settings')
  getSettings() {
    return this.hariharaaService.getSettingsForAdmin();
  }

  @Roles(Role.ADMINISTRATOR)
  @Patch('settings')
  updateSettings(@Body() dto: UpdateSettingsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.upsertSettings(dto, user.userId);
  }

  @Roles(Role.CUSTOMER)
  @Post('subscription/claim')
  submitClaim(@Body() dto: SubmitClaimDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.submitClaim(user.userId, dto);
  }

  @Roles(Role.CUSTOMER)
  @Get('subscription/me')
  getMyStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.getMyStatus(user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get('subscription/pending')
  listPending() {
    return this.hariharaaService.listPendingReview();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('subscription/:id/review')
  review(@Param('id') id: string, @Body() dto: ReviewClaimDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.review(id, dto, user.userId);
  }
}
