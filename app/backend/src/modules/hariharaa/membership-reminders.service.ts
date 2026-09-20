import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HariharaaPaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MembershipPlansService } from './membership-plans.service';
import { REMINDER_DAYS, reminderDue, type ReminderDue } from './membership-access';
import { bi } from '../../common/i18n';

const dateInIndia = (d: Date) => d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

// Tells members their access is about to end (3 days before) and that it has ended (the day it
// does), so nobody is locked out without warning. Each end date is announced once.
//
// It runs two ways: an hourly sweep, and — because a sleeping free-tier server skips cron jobs —
// on the spot whenever the member opens their membership status. Today the notice is in-app
// (bell + strip); a WhatsApp/SMS channel would plug in where the notification is created.
@Injectable()
export class MembershipRemindersService {
  private readonly logger = new Logger(MembershipRemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly plans: MembershipPlansService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sweep(): Promise<number> {
    if (!(await this.plans.isMembershipRequired())) return 0;
    const now = new Date();
    const from = new Date(now.getTime() - 8 * 864e5);
    const to = new Date(now.getTime() + (REMINDER_DAYS + 1) * 864e5);
    const candidates = await this.prisma.hariharaaSubscription.findMany({
      where: {
        user: { isActive: true },
        OR: [{ activeUntil: { gte: from, lte: to } }, { complimentaryUntil: { gte: from, lte: to } }],
      },
      select: { userId: true },
      take: 1000,
    });
    let sent = 0;
    for (const { userId } of candidates) {
      try {
        if (await this.remindIfDue(userId, now)) sent += 1;
      } catch (error) {
        // one member's problem must not stop the rest of the sweep
        this.logger.warn(`Reminder for ${userId} failed: ${(error as Error).message}`);
      }
    }
    if (sent > 0) this.logger.log(`Sent ${sent} membership reminder(s)`);
    return sent;
  }

  // Sends this member's reminder if one is due and not yet sent. Safe to call repeatedly.
  async remindIfDue(userId: string, now: Date = new Date()): Promise<ReminderDue | null> {
    const subscription = await this.prisma.hariharaaSubscription.findUnique({ where: { userId } });
    const due = reminderDue(subscription, now);
    if (!subscription || !due) return null;
    if (!(await this.plans.isMembershipRequired())) return null;

    // Someone who has already paid to renew and is waiting for verification needs no nagging.
    const waiting = await this.prisma.hariharaaPayment.findFirst({ where: { userId, status: HariharaaPaymentStatus.CLAIMED }, select: { id: true } });
    if (waiting) return null;

    // Mark first: a second caller at the same moment then finds nothing due, so no duplicates.
    const marked = await this.prisma.hariharaaSubscription.updateMany({
      // "not already marked for this end date" — written with an explicit null branch because in SQL
      // NOT (column = x) is never true for an empty (NULL) column, which is every first reminder.
      where: {
        userId,
        OR:
          due.kind === 'EXPIRING'
            ? [{ expiryReminderFor: null }, { NOT: { expiryReminderFor: due.until } }]
            : [{ expiredNoticeFor: null }, { NOT: { expiredNoticeFor: due.until } }],
      },
      data: due.kind === 'EXPIRING' ? { expiryReminderFor: due.until } : { expiredNoticeFor: due.until },
    });
    if (marked.count === 0) return null;

    const [title, body] = this.message(due);
    await this.notifications.create(userId, due.kind === 'EXPIRING' ? 'membership.expiring' : 'membership.expired', title, body, '/hariharaa/subscription');
    return due;
  }

  private message(due: ReminderDue): [string, string] {
    const on = dateInIndia(due.until);
    const free = due.source === 'FREE';
    if (due.kind === 'EXPIRING') {
      const days = due.daysLeft === 1 ? '1 day' : `${due.daysLeft} days`;
      const daysTe = `${due.daysLeft} రోజుల్లో`;
      return free
        ? [
            bi('Your free access ends soon', 'మీ ఉచిత ప్రాప్యత త్వరలో ముగుస్తుంది'),
            bi(`Your free access ends in ${days} (${on}). Pay to keep checkout and farm advice.`, `మీ ఉచిత ప్రాప్యత ${daysTe} (${on}) ముగుస్తుంది. చెక్అవుట్, వ్యవసాయ సలహా కొనసాగడానికి చెల్లించండి.`),
          ]
        : [
            bi('Your membership ends soon', 'మీ సభ్యత్వం త్వరలో ముగుస్తుంది'),
            bi(`Your membership ends in ${days} (${on}). Renew now — the new days are added after the ones you have.`, `మీ సభ్యత్వం ${daysTe} (${on}) ముగుస్తుంది. ఇప్పుడే పునరుద్ధరించండి — కొత్త రోజులు మీకు ఉన్న రోజుల తర్వాత చేరతాయి.`),
          ];
    }
    return free
      ? [
          bi('Your free access has ended', 'మీ ఉచిత ప్రాప్యత ముగిసింది'),
          bi('Pay to continue with checkout and farm advice.', 'చెక్అవుట్, వ్యవసాయ సలహా కొనసాగడానికి చెల్లించండి.'),
        ]
      : [
          bi('Your membership has ended', 'మీ సభ్యత్వం ముగిసింది'),
          bi('Renew to unlock checkout and farm advice again.', 'చెక్అవుట్, వ్యవసాయ సలహాను మళ్ళీ అన్‌లాక్ చేయడానికి పునరుద్ధరించండి.'),
        ];
  }
}
