import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderItem, OrderPaymentStatus, OrderStatus, Prisma, Role } from '@prisma/client';

type OrderWithItems = Order & { items: OrderItem[] };
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { HariharaaService } from '../hariharaa/hariharaa.service';
import { ClaimPaymentDto } from '../hariharaa/dto/claim-payment.dto';
import { ReviewClaimDto } from '../hariharaa/dto/review-claim.dto';
import { bi } from '../../common/i18n';

// Paying for an order by UPI, verified by hand for now — the same shape as the membership
// payment (pay -> type the UTR -> an Administrator verifies it against the bank), so a
// payment gateway can later replace the verification step for both. Cash on Delivery needs
// none of this: the order is marked paid when it is delivered.
@Injectable()
export class OrderPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly hariharaa: HariharaaService,
  ) {}

  private async ownedUpiOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.farmerId !== userId) throw new NotFoundException(bi('Order not found', 'ఆర్డర్ కనుగొనబడలేదు'));
    if (order.paymentMethod !== 'UPI') {
      throw new BadRequestException(bi('This order is Cash on Delivery — nothing to pay online', 'ఇది క్యాష్ ఆన్ డెలివరీ ఆర్డర్ — ఆన్‌లైన్‌లో చెల్లించాల్సినది లేదు'));
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(bi('This order was cancelled', 'ఈ ఆర్డర్ రద్దు చేయబడింది'));
    }
    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException(bi('This order is already paid', 'ఈ ఆర్డర్ ఇప్పటికే చెల్లించబడింది'));
    }
    return order;
  }

  // "Pay now" on an order: the QR/link for exactly this order's total, with the order
  // number in the note so the bank credit can be matched to it.
  async start(userId: string, orderId: string) {
    const order = await this.ownedUpiOrder(userId, orderId);
    if (order.paymentStatus === OrderPaymentStatus.CLAIMED) {
      throw new BadRequestException(bi('Your payment is already waiting for verification', 'మీ చెల్లింపు ఇప్పటికే ధృవీకరణ కోసం వేచి ఉంది'));
    }
    const link = await this.hariharaa.buildPaymentLink(order.totalAmount, `Order ${order.orderNumber}`);
    return { orderId: order.id, orderNumber: order.orderNumber, amountInr: order.totalAmount, ...link };
  }

  async claim(userId: string, orderId: string, dto: ClaimPaymentDto) {
    const order = await this.ownedUpiOrder(userId, orderId);
    if (order.paymentStatus === OrderPaymentStatus.CLAIMED) {
      throw new BadRequestException(bi('This payment was already submitted', 'ఈ చెల్లింపు ఇప్పటికే సమర్పించబడింది'));
    }
    const utr = dto.utr.trim().toUpperCase();
    // One bank reference pays for one thing: it may not already back a membership payment.
    const usedForMembership = await this.prisma.hariharaaPayment.findFirst({ where: { OR: [{ utr }, { rejectedUtr: utr }] } });
    if (usedForMembership) throw this.utrTaken();

    let updated: OrderWithItems;
    try {
      updated = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: OrderPaymentStatus.CLAIMED,
          paymentUtr: utr,
          paymentClaimedAt: new Date(),
          paymentRejectionReason: null,
        },
        include: { items: true },
      });
    } catch (err) {
      // The unique index on the UTR is what makes "one payment, one order" hold even if two
      // claims race each other.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') throw this.utrTaken();
      throw err;
    }
    await this.audit.log({
      actorId: userId,
      action: 'order.payment.claim',
      entityType: 'Order',
      entityId: orderId,
      metadata: { orderNumber: order.orderNumber, amountInr: order.totalAmount, utr },
    });
    await this.notifications.notifyRole(
      Role.ADMINISTRATOR,
      'order.payment.claimed',
      bi('An order payment needs verifying', 'ఆర్డర్ చెల్లింపును ధృవీకరించాలి'),
      bi(`${order.orderNumber} — ₹${order.totalAmount.toFixed(2)} (UTR ${utr})`, `${order.orderNumber} — ₹${order.totalAmount.toFixed(2)} (UTR ${utr})`),
      '/marketplace/manage/orders',
    );
    return updated;
  }

  listPending() {
    return this.prisma.order.findMany({
      where: { paymentMethod: 'UPI', paymentStatus: OrderPaymentStatus.CLAIMED, status: { not: OrderStatus.CANCELLED } },
      orderBy: { paymentClaimedAt: 'asc' },
      include: { items: true, farmer: { select: { id: true, name: true, mobileNumber: true, userCode: true } } },
    });
  }

  async review(orderId: string, dto: ReviewClaimDto, adminId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(bi('Order not found', 'ఆర్డర్ కనుగొనబడలేదు'));
    if (order.paymentStatus !== OrderPaymentStatus.CLAIMED) {
      throw new BadRequestException(bi('This order has no payment waiting for verification', 'ఈ ఆర్డర్‌కు ధృవీకరణ కోసం వేచి ఉన్న చెల్లింపు లేదు'));
    }
    if (!dto.approve && !dto.reason?.trim()) {
      throw new BadRequestException(bi('A reason is required when rejecting', 'తిరస్కరించేటప్పుడు కారణం అవసరం'));
    }
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: dto.approve
        ? { paymentStatus: OrderPaymentStatus.PAID, paymentVerifiedAt: new Date(), paymentVerifiedBy: adminId, paymentRejectionReason: null }
        : { paymentStatus: OrderPaymentStatus.REJECTED, paymentRejectionReason: dto.reason!.trim() },
      include: { items: true },
    });
    await this.audit.log({
      actorId: adminId,
      action: dto.approve ? 'order.payment.verify' : 'order.payment.reject',
      entityType: 'Order',
      entityId: orderId,
      metadata: { orderNumber: order.orderNumber, utr: order.paymentUtr, reason: dto.reason },
    });
    await this.notifications.create(
      order.farmerId,
      dto.approve ? 'order.payment.verified' : 'order.payment.rejected',
      dto.approve ? bi('Your order payment is confirmed', 'మీ ఆర్డర్ చెల్లింపు నిర్ధారించబడింది') : bi('Your order payment needs attention', 'మీ ఆర్డర్ చెల్లింపుకు శ్రద్ధ అవసరం'),
      dto.approve
        ? bi(`${order.orderNumber} is paid — we will pack it now`, `${order.orderNumber} చెల్లించబడింది — మేము ఇప్పుడు ప్యాక్ చేస్తాము`)
        : bi(dto.reason!.trim(), dto.reason!.trim()),
      `/marketplace/orders/${orderId}`,
    );
    return updated;
  }

  private utrTaken() {
    return new ConflictException(bi('This payment reference was already used', 'ఈ చెల్లింపు రిఫరెన్స్ ఇప్పటికే ఉపయోగించబడింది'));
  }
}
