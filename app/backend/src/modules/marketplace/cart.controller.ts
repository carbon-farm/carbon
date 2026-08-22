import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { AddToCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FARMER)
@Controller('marketplace/cart')
export class CartController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  listCart(@CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.listCart(user.userId);
  }

  @Post()
  setCartItem(@Body() dto: AddToCartDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.setCartItem(user.userId, dto);
  }

  @Post(':productId/remove')
  removeFromCart(@Param('productId') productId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.removeFromCart(user.userId, productId);
  }
}
