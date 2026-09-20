import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MergeWishlistDto } from './dto/wishlist.dto';
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

  // Folds the hearts given while signed out into the saved wishlist, right after sign-in.
  @Post('merge')
  mergeWishlist(@Body() dto: MergeWishlistDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.mergeWishlist(user.userId, dto.productIds);
  }
}
