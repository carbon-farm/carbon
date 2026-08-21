import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Module 12 — Notification, in-app channel. SMS/WhatsApp/email/push are
// deliberately not attempted here — they need a vendor decision (who, who
// pays) this service has no business making; see schema.prisma's note on
// Notification for the reasoning. Triggering services call create()/
// notifyRole() directly rather than through events/queues — at this scale
// a message bus would be unused ceremony, not resilience.
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: string, title: string, body: string, linkPath?: string): Promise<void> {
    await this.prisma.notification.create({ data: { userId, type, title, body, linkPath } });
  }

  // Fans out to every active user holding a role — used for queue-style
  // events (a new case/article waiting for review) where there's no single
  // recipient, only "whoever's on duty."
  async notifyRole(role: Role, type: string, title: string, body: string, linkPath?: string): Promise<void> {
    const recipients = await this.prisma.user.findMany({ where: { role, isActive: true }, select: { id: true } });
    if (recipients.length === 0) return;
    await this.prisma.notification.createMany({
      data: recipients.map((r) => ({ userId: r.id, type, title, body, linkPath })),
    });
  }

  async list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }
}
