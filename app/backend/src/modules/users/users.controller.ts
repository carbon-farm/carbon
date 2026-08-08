import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
