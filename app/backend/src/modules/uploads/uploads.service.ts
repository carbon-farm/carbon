import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { bi } from '../../common/i18n';

const BUCKET = 'case-evidence';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB — generous for a phone photo, tight enough that a
// farmer on mobile data doesn't stall uploading a multi-minute video.

// Wraps Supabase Storage — chosen over Google Drive/Cloud Storage because
// it's the same project already used for Postgres (no new billing
// relationship), and it's purpose-built object storage rather than a
// personal-file-manager API bent into an app backend role. The bucket is
// public: evidence photos of crop problems aren't sensitive personal data
// (same sensitivity tier as a published Knowledge article), and public
// URLs are dramatically simpler to serve than juggling signed-URL expiry
// for permanent DB references.
@Injectable()
export class UploadsService {
  private readonly client: SupabaseClient;
  private bucketReady = false;

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async uploadCaseEvidence(caseId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException(bi('No file provided', 'ఫైల్ అందించబడలేదు'));
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        bi(
          'Only JPEG/PNG/WEBP photos or MP4/WEBM/MOV videos are allowed',
          'JPEG/PNG/WEBP ఫోటోలు లేదా MP4/WEBM/MOV వీడియోలు మాత్రమే అనుమతించబడతాయి',
        ),
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(bi('File is too large (max 25MB)', 'ఫైల్ చాలా పెద్దది (గరిష్టం 25MB)'));
    }

    await this.ensureBucket();

    const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';
    const path = `cases/${caseId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await this.client.storage.from(BUCKET).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) {
      throw new BadRequestException(bi('Could not upload file', 'ఫైల్‌ను అప్‌లోడ్ చేయలేకపోయాము'));
    }

    return this.client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // Created lazily on first upload rather than assumed to exist — no
  // manual Supabase dashboard step required beyond the service role key.
  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return;
    const { data: buckets } = await this.client.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      await this.client.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_FILE_SIZE_BYTES });
    }
    this.bucketReady = true;
  }
}
