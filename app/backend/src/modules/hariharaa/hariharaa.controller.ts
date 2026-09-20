import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { HariharaaService } from './hariharaa.service';
import { ClaimPaymentDto } from './dto/claim-payment.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { GrantFreeAccessDto } from './dto/grant-free-access.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreatePlanDto, MembershipRequiredDto, StartPaymentDto, UpdatePlanDto } from './dto/plan.dto';
import { MembershipPlansService } from './membership-plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hariharaa')
export class HariharaaController {
  constructor(
    private readonly hariharaaService: HariharaaService,
    private readonly plansService: MembershipPlansService,
  ) {}

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

  @Roles(Role.MEMBER)
  @Get('subscription/me')
  getMyStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.getMyStatus(user.userId);
  }

  // Customer payment lifecycle: start (get the QR) -> claim (type the UTR).
  @Roles(Role.MEMBER)
  @Post('payments/start')
  startPayment(@Body() dto: StartPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.startPayment(user.userId, dto?.planId);
  }

  @Roles(Role.MEMBER)
  @Post('payments/:id/claim')
  claimPayment(@Param('id') id: string, @Body() dto: ClaimPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.claimPayment(user.userId, id, dto);
  }

  // Static path first, then :id, as elsewhere in this app.
  @Roles(Role.ADMINISTRATOR)
  @Get('payments/pending')
  listPending() {
    return this.hariharaaService.listPendingReview();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('payments/:id/review')
  review(@Param('id') id: string, @Body() dto: ReviewClaimDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.review(id, dto, user.userId);
  }

  // Members list + the free-access switch (manual exception to paying).
  @Roles(Role.ADMINISTRATOR)
  @Get('members')
  listMembers() {
    return this.hariharaaService.listMembers();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('members/:userId/free')
  grantFree(@Param('userId') userId: string, @Body() dto: GrantFreeAccessDto, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.grantFreeAccess(userId, dto, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Delete('members/:userId/free')
  revokeFree(@Param('userId') userId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.hariharaaService.revokeFreeAccess(userId, user.userId);
  }

  // Membership plans (Administrator): any number, each switched on or off, plus the master
  // switch for whether membership is required at all.
  @Roles(Role.ADMINISTRATOR)
  @Get('plans/manage')
  listPlans() {
    return this.plansService.listPlansForAdmin();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('plans')
  createPlan(@Body() dto: CreatePlanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.plansService.createPlan(dto, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto, @CurrentUser() user: AuthenticatedUser) {
    return this.plansService.updatePlan(id, dto, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Patch('membership-required')
  setMembershipRequired(@Body() dto: MembershipRequiredDto, @CurrentUser() user: AuthenticatedUser) {
    return this.plansService.setMembershipRequired(dto.required, user.userId);
  }
}
