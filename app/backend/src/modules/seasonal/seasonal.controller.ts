import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SeasonalService } from './seasonal.service';
import { CreateSeasonalTipDto, UpdateSeasonalTipDto } from './seasonal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MembershipGuard } from '../../common/guards/membership.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seasonal-tips')
export class SeasonalController {
  constructor(private readonly seasonal: SeasonalService) {}

  // For the Today panel: the same audience as the other farm-advice features (members with access).
  @UseGuards(MembershipGuard)
  @Roles(Role.MEMBER)
  @Get('current')
  current(@CurrentUser() user: AuthenticatedUser) {
    return this.seasonal.currentFor(user.userId);
  }

  @Roles(Role.ADMINISTRATOR, Role.MODERATOR)
  @Get()
  list() {
    return this.seasonal.list();
  }

  @Roles(Role.ADMINISTRATOR, Role.MODERATOR)
  @Post()
  create(@Body() dto: CreateSeasonalTipDto, @CurrentUser() user: AuthenticatedUser) {
    return this.seasonal.create(dto, user.userId);
  }

  @Roles(Role.ADMINISTRATOR, Role.MODERATOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeasonalTipDto, @CurrentUser() user: AuthenticatedUser) {
    return this.seasonal.update(id, dto, user.userId);
  }

  @Roles(Role.ADMINISTRATOR, Role.MODERATOR)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seasonal.remove(id, user.userId);
  }
}
