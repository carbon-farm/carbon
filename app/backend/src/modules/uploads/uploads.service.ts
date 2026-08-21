import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { bi } from '../../common/i18n';

const CASE_EVIDENCE_BUCKET = 'case-evidence';
const CASE_EVIDENCE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];

const LESSON_CONTENT_BUCKET = 'lesson-content';
const LESSON_CONTENT_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'application/pdf',
];

const SOIL_REPORT_BUCKET = 'soil-reports';
const SOIL_REPORT_MIME_TYPES = ['application/pdf'];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB — generous for a phone photo, tight enough that a
// farmer on mobile data doesn't stall uploading a multi-minute video.

// Wraps Supabase Storage — chosen over Google Drive/Cloud Storage because
// it's the same project already used for Postgres (no new billing
// relationship), and it's purpose-built object storage rather than a
// personal-file-manager API bent into an app backend role. Every bucket
// here is public: none of what's stored (crop-problem photos, course
// videos, soil reports) is sensitive personal data, and public URLs are
// dramatically simpler to serve than juggling signed-URL expiry for
// permanent DB references.
@Injectable()
export class UploadsService {
  private readonly client: SupabaseClient;
  private readonly readyBuckets = new Set<string>();

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async uploadCaseEvidence(caseId: string, file: Express.Multer.File): Promise<string> {
    return this.upload({
      file,
      bucket: CASE_EVIDENCE_BUCKET,
      allowedMimeTypes: CASE_EVIDENCE_MIME_TYPES,
      pathPrefix: `cases/${caseId}`,
      typeErrorMessage: bi(
        'Only JPEG/PNG/WEBP photos or MP4/WEBM/MOV videos are allowed',
        'JPEG/PNG/WEBP ఫోటోలు లేదా MP4/WEBM/MOV వీడియోలు మాత్రమే అనుమతించబడతాయి',
      ),
    });
  }

  async uploadLessonContent(lessonId: string, file: Express.Multer.File): Promise<string> {
    return this.upload({
      file,
      bucket: LESSON_CONTENT_BUCKET,
      allowedMimeTypes: LESSON_CONTENT_MIME_TYPES,
      pathPrefix: `lessons/${lessonId}`,
      typeErrorMessage: bi(
        'Only MP4/WEBM/MOV video, MP3/WAV audio, or PDF files are allowed',
        'MP4/WEBM/MOV వీడియో, MP3/WAV ఆడియో, లేదా PDF ఫైళ్లు మాత్రమే అనుమతించబడతాయి',
      ),
    });
  }

  async uploadSoilReport(sampleId: string, file: Express.Multer.File): Promise<string> {
    return this.upload({
      file,
      bucket: SOIL_REPORT_BUCKET,
      allowedMimeTypes: SOIL_REPORT_MIME_TYPES,
      pathPrefix: `samples/${sampleId}`,
      typeErrorMessage: bi('Only PDF files are allowed', 'PDF ఫైళ్లు మాత్రమే అనుమతించబడతాయి'),
    });
  }

  private async upload(params: {
    file: Express.Multer.File;
    bucket: string;
    allowedMimeTypes: string[];
    pathPrefix: string;
    typeErrorMessage: string;
  }): Promise<string> {
    const { file, bucket, allowedMimeTypes, pathPrefix, typeErrorMessage } = params;
    if (!file) {
      throw new BadRequestException(bi('No file provided', 'ఫైల్ అందించబడలేదు'));
    }
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(typeErrorMessage);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(bi('File is too large (max 25MB)', 'ఫైల్ చాలా పెద్దది (గరిష్టం 25MB)'));
    }

    await this.ensureBucket(bucket);

    const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';
    const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await this.client.storage.from(bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) {
      throw new BadRequestException(bi('Could not upload file', 'ఫైల్‌ను అప్‌లోడ్ చేయలేకపోయాము'));
    }

    return this.client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  // Created lazily on first upload to each bucket rather than assumed to
  // exist — no manual Supabase dashboard step required beyond the service
  // role key.
  private async ensureBucket(bucket: string): Promise<void> {
    if (this.readyBuckets.has(bucket)) return;
    const { data: buckets } = await this.client.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucket)) {
      await this.client.storage.createBucket(bucket, { public: true, fileSizeLimit: MAX_FILE_SIZE_BYTES });
    }
    this.readyBuckets.add(bucket);
  }
}
