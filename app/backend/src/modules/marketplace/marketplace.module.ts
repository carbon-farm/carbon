import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { ProductsController } from './products.controller';
import { CartController } from './cart.controller';
import { OrdersController } from './orders.controller';
import { CatalogController } from './catalog.controller';
import { OrderPaymentsService } from './order-payments.service';
import { AddressesModule } from '../addresses/addresses.module';
import { WishlistController } from './wishlist.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { HariharaaModule } from '../hariharaa/hariharaa.module';

@Module({
  imports: [UploadsModule, HariharaaModule, AddressesModule],
  controllers: [MarketplaceController, ProductsController, CartController, OrdersController, WishlistController, CatalogController],
  providers: [MarketplaceService, OrderPaymentsService],
})
export class MarketplaceModule {}
