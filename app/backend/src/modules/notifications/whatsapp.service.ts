import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// WhatsApp as a second place to receive the notifications members already get in the bell.
//
// OFF BY DEFAULT. Nothing is ever sent unless the server's WHATSAPP_MODE is set, and only to a
// member who ticked "send my updates on WhatsApp" themselves (Meta requires that opt-in).
//
//   WHATSAPP_MODE=off   (default) nothing happens
//   WHATSAPP_MODE=log   writes what WOULD be sent to the server log — safe for trying it out
//   WHATSAPP_MODE=live  really sends, through the WhatsApp Business Cloud API
//
// Live mode needs, from Meta's WhatsApp Business dashboard:
//   WHATSAPP_TOKEN            a permanent access token
//   WHATSAPP_PHONE_NUMBER_ID  the sending number's ID
//   WHATSAPP_TEMPLATE         name of an APPROVED utility template with two text variables:
//                             {{1}} = the headline, {{2}} = the message  (default "agriai_notice")
//   WHATSAPP_TEMPLATE_LANG    template language code (default "te"; use "en" for an English template)
//
// Only the kinds of notice in SENT_TYPES go out (orders, payments, membership, stock returning,
// answers to cases) — not staff queue noise.

export const SENT_TYPES = [
  'order.confirmed',
  'order.shipped',
  'order.delivered',
  'order.cancelled',
  'order.payment_verified',
  'order.payment_rejected',
  'membership.verified',
  'membership.rejected',
  'membership.expiring',
  'membership.expired',
  'stock.back_in_stock',
  'case.answered',
  'case.followup.requested',
];

const GRAPH_VERSION = 'v21.0';
const TIMEOUT_MS = 8000;

export type WhatsAppMode = 'off' | 'log' | 'live';

export function parseMode(value: string | undefined): WhatsAppMode {
  const v = (value ?? 'off').trim().toLowerCase();
  return v === 'log' || v === 'live' ? v : 'off';
}

// "9876543210" -> "919876543210" (WhatsApp wants the country code, digits only).
export function toWhatsAppNumber(mobile: string): string | null {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return null;
}

// Template variables may not contain newlines, tabs or runs of 4+ spaces.
export function cleanVariable(text: string): string {
  return text.replace(/[\n\r\t]+/g, ' ').replace(/ {4,}/g, '   ').trim().slice(0, 900);
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  get mode(): WhatsAppMode {
    return parseMode(this.config.get<string>('WHATSAPP_MODE'));
  }

  // True when the "also send to WhatsApp" choice should be offered to members at all.
  get available(): boolean {
    return this.mode !== 'off';
  }

  // Best-effort and silent: a WhatsApp problem must never break the action that caused the notice.
  async sendNotice(userId: string, type: string, title: string, body: string): Promise<void> {
    try {
      if (this.mode === 'off' || !SENT_TYPES.includes(type)) return;
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { mobileNumber: true, whatsappOptIn: true, isActive: true, role: true } });
      if (!user || !user.isActive || !user.whatsappOptIn) return;
      const to = toWhatsAppNumber(user.mobileNumber);
      if (!to) return;
      // The in-app text is "English / తెలుగు"; keep both so the member reads their language.
      const headline = cleanVariable(title);
      const message = cleanVariable(body);

      if (this.mode === 'log') {
        this.logger.log(`[whatsapp:log] to ${to.slice(0, 4)}…${to.slice(-2)} (${type}): ${headline} — ${message}`);
        return;
      }

      const token = this.config.get<string>('WHATSAPP_TOKEN');
      const phoneId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
      if (!token || !phoneId) {
        this.logger.warn('WHATSAPP_MODE=live but WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID are not set — nothing sent');
        return;
      }
      const template = this.config.get<string>('WHATSAPP_TEMPLATE') ?? 'agriai_notice';
      const lang = this.config.get<string>('WHATSAPP_TEMPLATE_LANG') ?? 'te';
      const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: template,
            language: { code: lang },
            components: [{ type: 'body', parameters: [{ type: 'text', text: headline }, { type: 'text', text: message }] }],
          },
        }),
      });
      if (!res.ok) {
        this.logger.warn(`WhatsApp send failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
      }
    } catch (err) {
      this.logger.warn(`WhatsApp send failed: ${(err as Error).message}`);
    }
  }
}
