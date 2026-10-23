import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { bi } from '../../common/i18n';

// A product is "low" at or below this many units. It is a single shop-wide figure for now.
export const LOW_STOCK_THRESHOLD = 5;

// Is this movement one that should raise a low-stock / out-of-stock alert? Only the moment of
// crossing the line, so the same product does not alert on every sale below it.
export function stockAlertKind(before: number, after: number): 'OUT' | 'LOW' | null {
  if (before > 0 && after === 0) return 'OUT';
  if (before > LOW_STOCK_THRESHOLD && after <= LOW_STOCK_THRESHOLD && after > 0) return 'LOW';
  return null;
}

// Tells people about stock changes: administrators (and the selling vendor) when something runs
// low or out, and members who asked to be told when an out-of-stock product returns. Alerts are
// best-effort — a failure here is logged and never undoes the sale or stock change that caused it.
@Injectable()
export class StockAlertsService {
  private readonly logger = new Logger(StockAlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // `before`/`after` are the product's stock around one change that took stock away.
  async afterStockTaken(productId: string, before: number, after: number): Promise<void> {
    const kind = stockAlertKind(before, after);
    if (!kind) return;
    try {
      const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { vendor: { select: { userId: true } } } });
      if (!product) return;
      const title = kind === 'OUT' ? bi('Out of stock', 'స్టాక్ అయిపోయింది') : bi('Running low on stock', 'స్టాక్ తక్కువగా ఉంది');
      const body =
        kind === 'OUT'
          ? bi(`${product.name} is now out of stock.`, `${product.name} ఇప్పుడు స్టాక్‌లో లేదు.`)
          : bi(`${product.name}: only ${after} left.`, `${product.name}: కేవలం ${after} మిగిలాయి.`);
      const link = `/marketplace/manage/products/${product.id}`;
      const type = kind === 'OUT' ? 'stock.out' : 'stock.low';
      await this.notifications.notifyRole(Role.ADMINISTRATOR, type, title, body, link);
      if (product.vendor?.userId) await this.notifications.create(product.vendor.userId, type, title, body, link);
    } catch (err) {
      this.logger.warn(`stock alert failed for ${productId}: ${(err as Error).message}`);
    }
  }

  // Stock went from nothing to something: tell the members waiting for it, once.
  async afterStockGiven(productId: string, before: number, after: number): Promise<void> {
    if (!(before <= 0 && after > 0)) return;
    try {
      const watches = await this.prisma.stockWatch.findMany({ where: { productId } });
      if (watches.length === 0) return;
      const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { name: true, isActive: true } });
      if (product?.isActive) {
        await this.notifications.createForUsers(
          watches.map((w) => w.userId),
          'stock.back_in_stock',
          bi('Back in stock', 'మళ్ళీ స్టాక్‌లో ఉంది'),
          bi(`${product.name} is available again.`, `${product.name} మళ్ళీ అందుబాటులో ఉంది.`),
          `/marketplace/products/${productId}`,
        );
      }
      await this.prisma.stockWatch.deleteMany({ where: { productId } });
    } catch (err) {
      this.logger.warn(`back-in-stock notice failed for ${productId}: ${(err as Error).message}`);
    }
  }

  // Ask to be told (or stop asking). Returns whether the member is now watching.
  async toggleWatch(userId: string, productId: string): Promise<{ watching: boolean }> {
    const existing = await this.prisma.stockWatch.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) {
      await this.prisma.stockWatch.delete({ where: { id: existing.id } });
      return { watching: false };
    }
    await this.prisma.stockWatch.create({ data: { userId, productId } });
    return { watching: true };
  }

  async myWatchedProductIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.stockWatch.findMany({ where: { userId }, select: { productId: true } });
    return rows.map((r) => r.productId);
  }

  // Products at or below the low-stock line (active ones), lowest first — for the administrator's alert list.
  async lowStock() {
    return this.prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, stockQuantity: true, unit: true, vendorId: true },
    });
  }
}
