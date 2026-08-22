import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketplace/orders')
export class OrdersController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Roles(Role.FARMER)
  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.checkout(user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Get('mine')
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.listMyOrders(user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get('manage')
  listQueueForAdmin() {
    return this.marketplaceService.listQueueForAdmin();
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
}
