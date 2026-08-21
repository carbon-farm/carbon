import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { MAX_FILE_SIZE_BYTES } from '../uploads/uploads.service';
import { LearningService } from './learning.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post()
  createCourse(@Body() dto: CreateCourseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.createCourse(user.userId, dto);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Get()
  listAllForStaff() {
    return this.learningService.listAllForStaff();
  }

  // Open to any authenticated role, same reasoning as Knowledge's published
  // route — no reason to gate reading published course content further.
  @Get('published')
  listPublished(@Query('cropId') cropId?: string) {
    return this.learningService.listPublished(cropId);
  }

  @Get('certificates')
  listMyCertificates(@CurrentUser() user: AuthenticatedUser) {
    return this.learningService.listMyCertificates(user.userId);
  }

  // Lesson sub-resource routes use a static 'lessons' prefix, declared
  // ahead of the dynamic :id routes below for the same reason /mine,
  // /published etc. precede :id elsewhere in this codebase — otherwise
  // NestJS would try to match "lessons" itself as a course id.
  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Patch('lessons/:lessonId')
  updateLesson(@Param('lessonId') lessonId: string, @Body() dto: UpdateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.updateLesson(lessonId, user.userId, dto);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post('lessons/:lessonId/content')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  uploadLessonContent(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.learningService.uploadLessonContent(lessonId, user.userId, file);
  }

  @Post('lessons/:lessonId/complete')
  markLessonComplete(@Param('lessonId') lessonId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.markLessonComplete(lessonId, user.userId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.getById(id, { role: user.role as Role });
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Patch(':id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.updateCourse(id, user.userId, dto);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/publish')
  publishCourse(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.publishCourse(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/unpublish')
  unpublishCourse(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.unpublishCourse(id, user.userId);
  }

  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @Post(':id/lessons')
  addLesson(@Param('id') id: string, @Body() dto: CreateLessonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.addLesson(id, user.userId, dto);
  }

  @Get(':id/lessons')
  listLessons(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.listLessons(id, { role: user.role as Role });
  }

  @Get(':id/progress')
  getProgress(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.learningService.getProgress(id, user.userId);
  }
}
