import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type MediaKind = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'OTHER';
export type MediaSource = 'CASE_EVIDENCE' | 'ARTICLE_EVIDENCE' | 'LESSON' | 'SOIL_REPORT' | 'PRODUCT_IMAGE';

export interface MediaItem {
  url: string;
  kind: MediaKind;
  source: MediaSource;
  ownerId: string;
  ownerLabel: string;
  createdAt: Date;
}

const EXT_KIND: Record<string, MediaKind> = {
  jpg: 'IMAGE', jpeg: 'IMAGE', png: 'IMAGE', webp: 'IMAGE', gif: 'IMAGE',
  mp4: 'VIDEO', mov: 'VIDEO', webm: 'VIDEO',
  mp3: 'AUDIO', m4a: 'AUDIO', wav: 'AUDIO', ogg: 'AUDIO',
  pdf: 'PDF',
};

export function kindFromUrl(url: string): MediaKind {
  const path = url.split('?')[0];
  const ext = path.includes('.') ? path.split('.').pop()!.toLowerCase() : '';
  return EXT_KIND[ext] ?? 'OTHER';
}

// Module 8 — Content Management. Every module already stores its own uploads
// (Supabase Storage URLs on the owning row); rather than duplicating them into
// a second table that could drift, the library is a read-only aggregation over
// those columns. Uploading/replacing stays with the owning module's screen.
@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<MediaItem[]> {
    const [cases, articles, lessons, samples, products] = await Promise.all([
      this.prisma.case.findMany({ where: { NOT: { evidenceMediaUrls: { isEmpty: true } } }, select: { id: true, caseNumber: true, evidenceMediaUrls: true, createdAt: true } }),
      this.prisma.knowledgeArticle.findMany({ where: { NOT: { evidenceMediaUrls: { isEmpty: true } } }, select: { id: true, title: true, evidenceMediaUrls: true, createdAt: true } }),
      this.prisma.lesson.findMany({ where: { contentUrl: { not: null } }, select: { id: true, title: true, contentUrl: true, createdAt: true } }),
      this.prisma.soilSample.findMany({ where: { reportUrl: { not: null } }, select: { id: true, sampleCode: true, reportUrl: true, createdAt: true } }),
      this.prisma.product.findMany({ where: { NOT: { imageUrls: { isEmpty: true } } }, select: { id: true, name: true, imageUrls: true, createdAt: true } }),
    ]);

    const items: MediaItem[] = [];
    const push = (urls: string[], source: MediaSource, ownerId: string, ownerLabel: string, createdAt: Date) => {
      for (const url of urls) items.push({ url, kind: kindFromUrl(url), source, ownerId, ownerLabel, createdAt });
    };
    for (const c of cases) push(c.evidenceMediaUrls, 'CASE_EVIDENCE', c.id, c.caseNumber ?? c.id.slice(0, 8), c.createdAt);
    for (const a of articles) push(a.evidenceMediaUrls, 'ARTICLE_EVIDENCE', a.id, a.title, a.createdAt);
    for (const l of lessons) push([l.contentUrl!], 'LESSON', l.id, l.title, l.createdAt);
    for (const s of samples) push([s.reportUrl!], 'SOIL_REPORT', s.id, s.sampleCode, s.createdAt);
    for (const p of products) push(p.imageUrls, 'PRODUCT_IMAGE', p.id, p.name, p.createdAt);

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
