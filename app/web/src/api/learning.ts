import { apiRequest, apiUpload } from './client';

export type CourseStatus = 'DRAFT' | 'PUBLISHED';
export type LessonContentType = 'VIDEO' | 'AUDIO' | 'PDF' | 'ASSIGNMENT';

export interface Course {
  id: string;
  title: string;
  description: string;
  cropId: string | null;
  crop: { id: string; name: string } | null;
  tags: { id: string; name: string }[];
  status: CourseStatus;
  authorId: string;
  author?: { id: string; name: string };
  _count?: { lessons: number };
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  contentType: LessonContentType;
  contentUrl: string | null;
  assignmentText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessonIds: string[];
  certificateIssued: boolean;
}

export interface CertificateEntry {
  id: string;
  courseId: string;
  course: { id: string; title: string };
  issuedAt: string;
}

export function createCourse(token: string, data: { title: string; description: string; cropId?: string; tagIds?: string[] }) {
  return apiRequest<Course>('/courses', { method: 'POST', body: data, token });
}

export function listAllCoursesForStaff(token: string) {
  return apiRequest<Course[]>('/courses', { token });
}

export function listPublishedCourses(token: string, cropId?: string) {
  return apiRequest<Course[]>(`/courses/published${cropId ? `?cropId=${cropId}` : ''}`, { token });
}

export function listMyCertificates(token: string) {
  return apiRequest<CertificateEntry[]>('/courses/certificates', { token });
}

export function getCourse(token: string, id: string) {
  return apiRequest<Course>(`/courses/${id}`, { token });
}

export function updateCourse(
  token: string,
  id: string,
  data: { title?: string; description?: string; cropId?: string; tagIds?: string[] },
) {
  return apiRequest<Course>(`/courses/${id}`, { method: 'PATCH', body: data, token });
}

export function publishCourse(token: string, id: string) {
  return apiRequest<Course>(`/courses/${id}/publish`, { method: 'POST', token });
}

export function unpublishCourse(token: string, id: string) {
  return apiRequest<Course>(`/courses/${id}/unpublish`, { method: 'POST', token });
}

export function addLesson(
  token: string,
  courseId: string,
  data: { title: string; contentType: LessonContentType; assignmentText?: string },
) {
  return apiRequest<Lesson>(`/courses/${courseId}/lessons`, { method: 'POST', body: data, token });
}

export function listLessons(token: string, courseId: string) {
  return apiRequest<Lesson[]>(`/courses/${courseId}/lessons`, { token });
}

export function updateLesson(token: string, lessonId: string, data: { title?: string; assignmentText?: string; order?: number }) {
  return apiRequest<Lesson>(`/courses/lessons/${lessonId}`, { method: 'PATCH', body: data, token });
}

export function uploadLessonContent(token: string, lessonId: string, file: File) {
  return apiUpload<Lesson>(`/courses/lessons/${lessonId}/content`, file, token);
}

export function markLessonComplete(token: string, lessonId: string) {
  return apiRequest<CourseProgress>(`/courses/lessons/${lessonId}/complete`, { method: 'POST', token });
}

export function getCourseProgress(token: string, courseId: string) {
  return apiRequest<CourseProgress>(`/courses/${courseId}/progress`, { token });
}
