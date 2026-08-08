import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ExpertsService } from './experts.service';
import { SubmitCredentialsDto } from './dto/submit-credentials.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @Roles(Role.EXPERT)
  @Patch('me/credentials')
  submitCredentials(@Body() dto: SubmitCredentialsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.expertsService.submitCredentials(user.userId, dto);
  }

  @Roles(Role.ADMINISTRATOR)
  @Get('credentials/pending')
  listPending() {
    return this.expertsService.listPendingReview();
  }

  @Roles(Role.ADMINISTRATOR)
  @Patch('credentials/:expertProfileId/verify')
  verify(
    @Param('expertProfileId') expertProfileId: string,
    @Body() dto: VerifyCredentialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.expertsService.verify(expertProfileId, dto, user.userId);
  }
}
