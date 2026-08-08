import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ConfigurationService } from './configuration.service';
import { CreateTaxonomyItemDto } from './dto/create-taxonomy-item.dto';
import { CreateRegionDto } from './dto/create-region.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

// Reads are open to any authenticated role (every persona needs the taxonomy
// to render forms); writes are Administrator-only.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('crops')
  listCrops() {
    return this.configurationService.listCrops();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('crops')
  createCrop(@Body() dto: CreateTaxonomyItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configurationService.createCrop(dto, user.userId);
  }

  @Get('case-categories')
  listCaseCategories() {
    return this.configurationService.listCaseCategories();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('case-categories')
  createCaseCategory(@Body() dto: CreateTaxonomyItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configurationService.createCaseCategory(dto, user.userId);
  }

  @Get('tags')
  listTags() {
    return this.configurationService.listTags();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('tags')
  createTag(@Body() dto: CreateTaxonomyItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configurationService.createTag(dto, user.userId);
  }

  @Get('regions')
  listRegions() {
    return this.configurationService.listRegions();
  }

  @Roles(Role.ADMINISTRATOR)
  @Post('regions')
  createRegion(@Body() dto: CreateRegionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configurationService.createRegion(dto, user.userId);
  }
}
