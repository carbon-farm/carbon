import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

// Any signed-in member can keep an address book — no paid membership needed just to save one.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MEMBER)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.addresses.list(user.userId);
  }

  @Post()
  create(@Body() dto: CreateAddressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.addresses.create(user.userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAddressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.addresses.update(user.userId, id, dto);
  }

  @Post(':id/default')
  setDefault(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.addresses.setDefault(user.userId, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.addresses.remove(user.userId, id);
  }
}
