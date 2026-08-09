import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { KnowledgeService } from './knowledge.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RejectArticleDto } from './dto/reject-article.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Roles(Role.EXPERT)
  @Post()
  createDraft(@Body() dto: CreateArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.createDraft(user.userId, dto);
  }

  @Roles(Role.EXPERT)
  @Get('mine')
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.listMine(user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Get('pending')
  listPendingReview() {
    return this.knowledgeService.listPendingReview();
  }

  // Open to any authenticated role — farmers are the primary audience, but
  // there's no reason to gate reading published advisory content further.
  @Get('published')
  listPublished(@Query('categoryId') categoryId?: string) {
    return this.knowledgeService.listPublished(categoryId);
  }

  // Kept below the fixed /mine, /pending, /published routes deliberately —
  // NestJS matches in declaration order, and :id would otherwise swallow
  // those static paths as article IDs.
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.getById(id, { userId: user.userId, role: user.role as Role });
  }

  @Roles(Role.EXPERT)
  @Patch(':id')
  updateDraft(@Param('id') id: string, @Body() dto: UpdateArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.updateDraft(id, user.userId, dto);
  }

  @Roles(Role.EXPERT)
  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.submit(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.approve(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.knowledgeService.reject(id, user.userId, dto);
  }
}
