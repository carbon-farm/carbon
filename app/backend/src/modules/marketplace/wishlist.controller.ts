import { Controller, Get, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('marketplace/wishlist')
export class WishlistController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  listWishlist(@CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.listWishlist(user.userId);
  }
}
