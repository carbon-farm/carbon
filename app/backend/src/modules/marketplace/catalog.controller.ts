import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { GuestCartDto } from './dto/cart.dto';

// The shop window: anyone can browse the catalog and price a cart without signing in.
// Deliberately NO guards on this controller (same reason AuthController has none) — it only
// exposes what a signed-out visitor is meant to see: active products from platform-sold or
// approved vendors. Buying still needs an account and, at checkout, a membership.
@Controller('marketplace/catalog')
export class CatalogController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('categories')
  listCategories() {
    return this.marketplaceService.listCategories();
  }

  @Get('products')
  listProducts(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
    return this.marketplaceService.listPublished(categoryId, search);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.marketplaceService.getPublicProduct(id);
  }

  @Get('products/:id/reviews')
  getReviews(@Param('id') id: string) {
    return this.marketplaceService.getPublicReviews(id);
  }

  // Prices a cart that only exists in the visitor's browser.
  @Post('cart-preview')
  previewCart(@Body() dto: GuestCartDto) {
    return this.marketplaceService.previewGuestCart(dto);
  }
}
