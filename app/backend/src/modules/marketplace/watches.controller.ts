import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StockAlertsService } from './stock-alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

// "Tell me when it is back in stock" for members, and the low-stock list for administrators.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketplace')
export class WatchesController {
  constructor(private readonly alerts: StockAlertsService) {}

  @Roles(Role.MEMBER)
  @Get('stock-watch/mine')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.alerts.myWatchedProductIds(user.userId);
  }

  @Roles(Role.MEMBER)
  @Post('stock-watch/:productId')
  toggle(@Param('productId') productId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.alerts.toggleWatch(user.userId, productId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get('alerts/low-stock')
  lowStock() {
    return this.alerts.lowStock();
  }
}
