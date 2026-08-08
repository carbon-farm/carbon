import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { FarmsService } from './farms.service';
import { CreateFarmLandDto } from './dto/create-farm-land.dto';
import { UpdateFarmLandDto } from './dto/update-farm-land.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

// Farm/Land Parcel — its own entity per Charter v0.4.0, so future Case and Soil
// Report records (Stage 2+) can point at the specific parcel, not the farmer.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FARMER)
@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  create(@Body() dto: CreateFarmLandDto, @CurrentUser() user: AuthenticatedUser) {
    return this.farmsService.create(user.userId, dto);
  }

  @Get()
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.farmsService.listMine(user.userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.farmsService.getOwned(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFarmLandDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.farmsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.farmsService.remove(id, user.userId);
  }
}
