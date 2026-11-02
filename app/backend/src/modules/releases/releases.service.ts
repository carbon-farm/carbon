import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RELEASE_NOTES, type ReleaseNote } from './release-notes';

const ANNOUNCED = 'release.announced';

// Tells every Administrator about each update, once. Runs when the server starts: any note in
// RELEASE_NOTES that has no "announced" record yet is sent to all active Administrators (bell
// notification) and then recorded in the audit log so a restart never repeats it.
@Injectable()
export class ReleasesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReleasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.announceNew();
    } catch (err) {
      // never let a notice stop the server from starting
      this.logger.error(`Could not announce updates: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async announceNew(notes: ReleaseNote[] = RELEASE_NOTES): Promise<string[]> {
    const sent: string[] = [];
    for (const note of notes) {
      const already = await this.prisma.auditLog.findFirst({ where: { action: ANNOUNCED, entityType: 'Release', entityId: note.id }, select: { id: true } });
      if (already) continue;
      await this.notifications.notifyRole(Role.ADMINISTRATOR, 'release.update', note.title, note.body, note.linkPath);
      await this.audit.log({ action: ANNOUNCED, entityType: 'Release', entityId: note.id });
      sent.push(note.id);
      this.logger.log(`Announced update ${note.id} to the administrators`);
    }
    return sent;
  }
}
