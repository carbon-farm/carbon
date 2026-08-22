import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { ProductsController } from './products.controller';
import { CartController } from './cart.controller';
import { OrdersController } from './orders.controller';
import { WishlistController } from './wishlist.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [MarketplaceController, ProductsController, CartController, OrdersController, WishlistController],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
