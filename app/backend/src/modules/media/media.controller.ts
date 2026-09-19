import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRATOR, Role.MODERATOR)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list() {
    return this.mediaService.list();
  }
}
