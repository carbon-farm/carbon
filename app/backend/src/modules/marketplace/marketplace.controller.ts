import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { SubmitVendorProfileDto, VerifyVendorDto } from './dto/vendor-profile.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

// Vendor onboarding + taxonomy. Product/Cart/Order live in their own
// controllers (marketplace/products, marketplace/cart, marketplace/orders)
// — one flat controller for this whole domain would bury the routing-order
// constraints (static paths before :id) that already bit this codebase
// once in the Knowledge/Learning/Soil Lab controllers.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Roles(Role.VENDOR)
  @Post('vendor-profile')
  submitVendorProfile(@Body() dto: SubmitVendorProfileDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.submitVendorProfile(user.userId, dto);
  }

  @Roles(Role.VENDOR)
  @Get('vendor-profile/mine')
  getMyVendorProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.getMyVendorProfile(user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get('vendor-profile/pending')
  listPendingVendors() {
    return this.marketplaceService.listPendingVendors();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('vendor-profile/:id/verify')
  verifyVendor(@Param('id') id: string, @Body() dto: VerifyVendorDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.verifyVendor(id, user.userId, dto);
  }

  @Get('categories')
  listCategories() {
    return this.marketplaceService.listCategories();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.marketplaceService.createCategory(dto);
  }
}
