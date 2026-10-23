import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  @Roles(Role.ADMINISTRATOR)
  @Post('staff')
  createStaffUser(@Body() dto: CreateStaffUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.createStaffUser(dto, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get()
  list(@Query('role') role?: Role) {
    return this.usersService.list(role);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    // `whatsappAvailable` tells the screen whether to offer the WhatsApp choice at all.
    return { ...(await this.usersService.findById(user.userId)), whatsappAvailable: this.whatsapp.available };
  }

  @Patch('me/preferences')
  updateMyPreferences(@Body() dto: UpdatePreferencesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.updatePreferences(user.userId, dto);
  }

  @Post('me/password')
  changeMyPassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.changeMyPassword(user.userId, dto);
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/temporary-password')
  issueTemporaryPassword(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.issueTemporaryPassword(id, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body() dto: SetActiveDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.setActive(id, dto.isActive, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
