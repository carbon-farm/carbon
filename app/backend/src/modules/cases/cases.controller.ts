import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { MAX_FILE_SIZE_BYTES } from '../uploads/uploads.service';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { AssignCaseDto } from './dto/assign-case.dto';
import { RequestFollowUpDto, RespondFollowUpDto } from './dto/follow-up.dto';
import { AnswerCaseDto } from './dto/answer-case.dto';
import { ConfirmPriorityDto } from './dto/confirm-priority.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Roles(Role.FARMER)
  @Post()
  createDraft(@Body() dto: CreateCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.createDraft(user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Get('mine')
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.casesService.listMine(user.userId);
  }

  @Roles(Role.EXPERT)
  @Get('assigned')
  listAssigned(@CurrentUser() user: AuthenticatedUser) {
    return this.casesService.listAssigned(user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Get('queue')
  listQueue() {
    return this.casesService.listQueue();
  }

  // Kept below the fixed /mine, /assigned, /queue routes deliberately —
  // NestJS matches in declaration order, and :id would otherwise swallow
  // those static paths as case IDs.
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.getById(id, { userId: user.userId, role: user.role as Role });
  }

  @Roles(Role.FARMER)
  @Patch(':id')
  updateDraft(@Param('id') id: string, @Body() dto: UpdateCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.updateDraft(id, user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Post(':id/evidence')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  uploadEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casesService.addEvidenceMedia(id, user.userId, file);
  }

  @Roles(Role.FARMER)
  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.submit(id, user.userId);
  }

  @Roles(Role.MODERATOR)
  @Post(':id/review')
  startReview(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.startReview(id, user.userId);
  }

  @Roles(Role.MODERATOR)
  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.assign(id, user.userId, dto);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/priority')
  confirmPriority(@Param('id') id: string, @Body() dto: ConfirmPriorityDto, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.confirmPriority(id, user.userId, dto);
  }

  @Roles(Role.EXPERT)
  @Post(':id/start-work')
  startWork(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.startWork(id, user.userId);
  }

  @Roles(Role.EXPERT)
  @Post(':id/request-followup')
  requestFollowUp(
    @Param('id') id: string,
    @Body() dto: RequestFollowUpDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casesService.requestFollowUp(id, user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Post(':id/respond-followup')
  respondFollowUp(
    @Param('id') id: string,
    @Body() dto: RespondFollowUpDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.casesService.respondFollowUp(id, user.userId, dto);
  }

  @Roles(Role.EXPERT)
  @Post(':id/answer')
  answer(@Param('id') id: string, @Body() dto: AnswerCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.answer(id, user.userId, dto);
  }

  @Roles(Role.FARMER)
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.confirm(id, user.userId);
  }

  @Roles(Role.FARMER)
  @Post(':id/dispute')
  dispute(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.dispute(id, user.userId);
  }

  @Roles(Role.ADMINISTRATOR)
  @Post(':id/abandon')
  abandon(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.casesService.abandon(id, user.userId);
  }
}
