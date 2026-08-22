import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { MAX_FILE_SIZE_BYTES } from '../uploads/uploads.service';
import { MarketplaceService } from './marketplace.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { SubmitReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketplace/products')
export class ProductsController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Roles(Role.VENDOR, Role.ADMINISTRATOR)
  @Post()
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.createProduct({ userId: user.userId, role: user.role as Role }, dto);
  }

  // Open to any authenticated role, same reasoning as Knowledge's
  // published route — no reason to gate browsing the public catalog.
  @Get()
  listPublished(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
    return this.marketplaceService.listPublished(categoryId, search);
  }

  @Roles(Role.VENDOR)
  @Get('mine')
  listMineForVendor(@CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.listMineForVendor(user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get('admin')
  listAllForAdmin() {
    return this.marketplaceService.listAllForAdmin();
  }

  // Kept below the fixed /mine, /admin routes deliberately — NestJS
  // matches in declaration order, and :id would otherwise swallow those
  // static paths as product IDs.
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.getById(id, { userId: user.userId, role: user.role as Role });
  }

  @Roles(Role.VENDOR, Role.ADMINISTRATOR)
  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.updateProduct(id, { userId: user.userId, role: user.role as Role }, dto);
  }

  @Roles(Role.VENDOR, Role.ADMINISTRATOR)
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.uploadProductImage(id, { userId: user.userId, role: user.role as Role }, file);
  }

  @Post(':id/reviews')
  submitReview(@Param('id') id: string, @Body() dto: SubmitReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.submitReview(id, user.userId, dto);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.getReviews(id, user.userId);
  }

  @Post(':id/wishlist')
  toggleWishlist(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.marketplaceService.toggleWishlist(id, user.userId);
  }
}
