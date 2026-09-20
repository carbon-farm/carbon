import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { OrderPaymentsService } from './order-payments.service';
import { ClaimPaymentDto } from '../hariharaa/dto/claim-payment.dto';
import { ReviewClaimDto } from '../hariharaa/dto/review-claim.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { SetDispatchStatusDto } from './dto/dispatch-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketplace/orders')
export class OrdersController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly orderPayments: OrderPaymentsService,
  ) {}

  @Roles(Role.MEMBER)
  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.checkout(user.userId, user.role as Role, dto);
  }

  @Roles(Role.MEMBER)
  @Get('mine')
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.listMyOrders(user.userId);
  }

  @Roles(Role.ADMINISTRATOR, Role.SUPPORT_AGENT)
  @Get('manage')
  listQueueForAdmin() {
    return this.marketplaceService.listQueueForAdmin();
  }

  // UPI payments waiting for an Administrator to check the bank credit. Static path, so it
  // stays above the :id routes.
  @Roles(Role.ADMINISTRATOR)
  @Get('payments/pending')
  listPendingPayments() {
    return this.orderPayments.listPending();
  }

  // Kept below the fixed /checkout, /mine, /manage routes deliberately —
  // NestJS matches in declaration order, and :id would otherwise swallow
  // those static paths as order IDs.
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.getOrderById(id, { userId: user.userId, role: user.role as Role });
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.confirmOrder(id, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/ship')
  ship(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.shipOrder(id, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/deliver')
  deliver(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.deliverOrder(id, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.cancelOrder(id, user.userId);
  }

  // Per-line fulfillment status — separate from the whole-order state
  // machine above. Available to the dispatch team (SUPPORT_AGENT) as well
  // as Administrators, unlike confirm/ship/deliver/cancel which stay
  // Administrator-only per this module's documented design intent.
  @Roles(Role.SUPPORT_AGENT, Role.ADMINISTRATOR)
  @Post(':id/items/:itemId/dispatch-status')
  setItemDispatchStatus(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: SetDispatchStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.marketplaceService.markItemDispatchStatus(id, itemId, dto.status, user.userId);
  }

  // Paying an order by UPI: get the QR, then type the UTR; an Administrator verifies it.
  @Roles(Role.MEMBER)
  @Post(':id/payment/start')
  startPayment(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.orderPayments.start(user.userId, id);
  }

  @Roles(Role.MEMBER)
  @Post(':id/payment/claim')
  claimPayment(@Param('id') id: string, @Body() dto: ClaimPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.orderPayments.claim(user.userId, id, dto);
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/payment/review')
  reviewPayment(@Param('id') id: string, @Body() dto: ReviewClaimDto, @CurrentUser() user: AuthenticatedUser) {
    return this.orderPayments.review(id, dto, user.userId);
  }
}
