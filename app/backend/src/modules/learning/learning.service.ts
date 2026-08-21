import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Course, CourseStatus, LessonContentType, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UploadsService } from '../uploads/uploads.service';
import { bi } from '../../common/i18n';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

const COURSE_INCLUDE = {
  crop: true,
  tags: true,
  author: { select: { id: true, name: true } },
  _count: { select: { lessons: true } },
} as const;

// Module 5 — Learning Management, built as a shell (explicit product
// decision: no real content yet). Deliberately simple next to Case
// Management or Knowledge: Administration/Moderation staff author courses
// directly (Charter's own ownership split), so there's no submit/approve
// workflow, no auto-generation, and only two states.
@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly uploads: UploadsService,
  ) {}

  async createCourse(authorId: string, dto: CreateCourseDto): Promise<Course> {
    const created = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        cropId: dto.cropId,
        authorId,
        status: CourseStatus.DRAFT,
        ...(dto.tagIds ? { tags: { connect: dto.tagIds.map((id) => ({ id })) } } : {}),
      },
      include: COURSE_INCLUDE,
    });
    await this.audit.log({ actorId: authorId, action: 'course.create', entityType: 'Course', entityId: created.id });
    return created;
  }

  async updateCourse(courseId: string, actorId: string, dto: UpdateCourseDto): Promise<Course> {
    await this.getOrThrow(courseId);
    const { tagIds, ...rest } = dto;
    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { ...rest, ...(tagIds ? { tags: { set: tagIds.map((id) => ({ id })) } } : {}) },
      include: COURSE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'course.update', entityType: 'Course', entityId: courseId });
    return updated;
  }

  async publishCourse(courseId: string, actorId: string): Promise<Course> {
    const existing = await this.getOrThrow(courseId);
    if (existing.status === CourseStatus.PUBLISHED) {
      throw new BadRequestException(bi('This course is already published', 'ఈ కోర్సు ఇప్పటికే ప్రచురించబడింది'));
    }
    const lessonCount = await this.prisma.lesson.count({ where: { courseId } });
    if (lessonCount === 0) {
      throw new BadRequestException(
        bi('Add at least one lesson before publishing', 'ప్రచురించే ముందు కనీసం ఒక పాఠాన్ని జోడించండి'),
      );
    }
    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.PUBLISHED },
      include: COURSE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'course.publish', entityType: 'Course', entityId: courseId });
    return updated;
  }

  async unpublishCourse(courseId: string, actorId: string): Promise<Course> {
    const existing = await this.getOrThrow(courseId);
    if (existing.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException(bi('This course is not published', 'ఈ కోర్సు ప్రచురించబడలేదు'));
    }
    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.DRAFT },
      include: COURSE_INCLUDE,
    });
    await this.audit.log({ actorId, action: 'course.unpublish', entityType: 'Course', entityId: courseId });
    return updated;
  }

  // Staff management view — every course regardless of status or author,
  // matching how the Moderator article queue isn't scoped to "mine."
  async listAllForStaff() {
    return this.prisma.course.findMany({ orderBy: { updatedAt: 'desc' }, include: COURSE_INCLUDE });
  }

  async listPublished(cropId?: string) {
    return this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED, ...(cropId ? { cropId } : {}) },
      orderBy: { updatedAt: 'desc' },
      include: COURSE_INCLUDE,
    });
  }

  async getById(courseId: string, requester: { role: Role }): Promise<Course> {
    const found = await this.getOrThrow(courseId);
    this.assertViewable(found, requester);
    return found;
  }

  async addLesson(courseId: string, actorId: string, dto: CreateLessonDto) {
    await this.getOrThrow(courseId);
    if (dto.contentType === LessonContentType.ASSIGNMENT && !dto.assignmentText) {
      throw new BadRequestException(
        bi('Assignment lessons need instructions text', 'అసైన్‌మెంట్ పాఠాలకు సూచనల వచనం అవసరం'),
      );
    }
    const last = await this.prisma.lesson.findFirst({ where: { courseId }, orderBy: { order: 'desc' } });
    const created = await this.prisma.lesson.create({
      data: {
        courseId,
        title: dto.title,
        contentType: dto.contentType,
        assignmentText: dto.assignmentText,
        order: (last?.order ?? 0) + 1,
      },
    });
    await this.audit.log({ actorId, action: 'lesson.create', entityType: 'Lesson', entityId: created.id, metadata: { courseId } });
    return created;
  }

  async updateLesson(lessonId: string, actorId: string, dto: UpdateLessonDto) {
    await this.getLessonOrThrow(lessonId);
    const updated = await this.prisma.lesson.update({ where: { id: lessonId }, data: dto });
    await this.audit.log({ actorId, action: 'lesson.update', entityType: 'Lesson', entityId: lessonId });
    return updated;
  }

  async uploadLessonContent(lessonId: string, actorId: string, file: Express.Multer.File) {
    const lesson = await this.getLessonOrThrow(lessonId);
    if (lesson.contentType === LessonContentType.ASSIGNMENT) {
      throw new BadRequestException(
        bi('Assignment lessons use instructions text, not an uploaded file', 'అసైన్‌మెంట్ పాఠాలు ఫైల్ కాకుండా సూచనల వచనాన్ని ఉపయోగిస్తాయి'),
      );
    }
    const url = await this.uploads.uploadLessonContent(lessonId, file);
    const updated = await this.prisma.lesson.update({ where: { id: lessonId }, data: { contentUrl: url } });
    await this.audit.log({ actorId, action: 'lesson.content.upload', entityType: 'Lesson', entityId: lessonId });
    return updated;
  }

  async listLessons(courseId: string, requester: { role: Role }) {
    const course = await this.getOrThrow(courseId);
    this.assertViewable(course, requester);
    return this.prisma.lesson.findMany({ where: { courseId }, orderBy: { order: 'asc' } });
  }

  // Idempotent: re-marking an already-completed lesson is a no-op, not an
  // error — a learner revisiting a lesson shouldn't have to check state
  // first.
  async markLessonComplete(lessonId: string, userId: string) {
    const lesson = await this.getLessonOrThrow(lessonId);
    await this.prisma.lessonCompletion.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      create: { lessonId, userId },
      update: {},
    });

    const [totalLessons, completedCount] = await Promise.all([
      this.prisma.lesson.count({ where: { courseId: lesson.courseId } }),
      this.prisma.lessonCompletion.count({
        where: { userId, lesson: { courseId: lesson.courseId } },
      }),
    ]);

    if (totalLessons > 0 && completedCount === totalLessons) {
      await this.prisma.certificate.upsert({
        where: { courseId_userId: { courseId: lesson.courseId, userId } },
        create: { courseId: lesson.courseId, userId },
        update: {},
      });
    }

    return this.getProgress(lesson.courseId, userId);
  }

  async getProgress(courseId: string, userId: string) {
    const [totalLessons, completions, certificate] = await Promise.all([
      this.prisma.lesson.count({ where: { courseId } }),
      this.prisma.lessonCompletion.findMany({ where: { userId, lesson: { courseId } }, select: { lessonId: true } }),
      this.prisma.certificate.findUnique({ where: { courseId_userId: { courseId, userId } } }),
    ]);
    return {
      totalLessons,
      completedLessonIds: completions.map((c) => c.lessonId),
      certificateIssued: !!certificate,
    };
  }

  async listMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: { course: { select: { id: true, title: true } } },
    });
  }

  private async getOrThrow(courseId: string): Promise<Course> {
    const found = await this.prisma.course.findUnique({ where: { id: courseId }, include: COURSE_INCLUDE });
    if (!found) throw new NotFoundException(bi('Course not found', 'కోర్సు కనుగొనబడలేదు'));
    return found;
  }

  private async getLessonOrThrow(lessonId: string) {
    const found = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!found) throw new NotFoundException(bi('Lesson not found', 'పాఠం కనుగొనబడలేదు'));
    return found;
  }

  private assertViewable(course: Course, requester: { role: Role }): void {
    const isStaff = requester.role === Role.MODERATOR || requester.role === Role.ADMINISTRATOR;
    if (course.status !== CourseStatus.PUBLISHED && !isStaff) {
      throw new ForbiddenException(bi('This course is not available', 'ఈ కోర్సు అందుబాటులో లేదు'));
    }
  }
}
