import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { MAX_FILE_SIZE_BYTES } from '../uploads/uploads.service';
import { SoilLabService } from './soil-lab.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('soil-samples')
export class SoilLabController {
  constructor(private readonly soilLabService: SoilLabService) {}

  @Roles(Role.FARMER)
  @Post()
  createSample(@Body() dto: CreateSampleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.soilLabService.createSample(user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Get('mine')
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.soilLabService.listMine(user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Get('queue')
  listAllForStaff() {
    return this.soilLabService.listAllForStaff();
  }

  // Kept below the fixed /mine, /queue routes deliberately — NestJS
  // matches in declaration order, and :id would otherwise swallow those
  // static paths as sample IDs.
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.soilLabService.getById(id, { userId: user.userId, role: user.role as Role });
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/dispatch')
  dispatch(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.soilLabService.dispatch(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/receive')
  markReceived(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.soilLabService.markReceived(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/test')
  markTested(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.soilLabService.markTested(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/report')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  uploadReport(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.soilLabService.uploadReport(id, user.userId, file);
  }
}
