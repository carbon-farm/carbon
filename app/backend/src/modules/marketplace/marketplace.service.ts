import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus, Product, Role, VendorProfile } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UploadsService } from '../uploads/uploads.service';
import { bi } from '../../common/i18n';
import { SubmitVendorProfileDto, VerifyVendorDto } from './dto/vendor-profile.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { AddToCartDto } from './dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { SubmitReviewDto } from './dto/review.dto';

const PRODUCT_INCLUDE = {
  category: true,
  vendor: { select: { id: true, businessName: true } },
} as const;

// Modules 6/9 — Marketplace, built as a working catalog+cart+order loop with
// Payment/Finance deliberately deferred (see schema.prisma's note on this
// module for the full reasoning). Vendor approval, product oversight, and
// order fulfillment are Administrator-only per the Charter's explicit
// Administration/Moderation split for this module specifically.
@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly uploads: UploadsService,
  ) {}

  // ---------- Vendor profile ----------

  async submitVendorProfile(userId: string, dto: SubmitVendorProfileDto): Promise<VendorProfile> {
    const existing = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    const saved = await this.prisma.vendorProfile.upsert({
      where: { userId },
      create: { userId, businessName: dto.businessName, description: dto.description },
      // Resubmitting after a rejection starts the approval clock over —
      // isApproved only ever flips true through an explicit Administrator
      // verify() call, never implicitly by editing the profile.
      update: { businessName: dto.businessName, description: dto.description, isApproved: false, approvedByUserId: null, approvedAt: null },
    });
    await this.audit.log({
      actorId: userId,
      action: existing ? 'vendor.profile.resubmit' : 'vendor.profile.submit',
      entityType: 'VendorProfile',
      entityId: saved.id,
    });
    return saved;
  }

  async getMyVendorProfile(userId: string): Promise<VendorProfile | null> {
    return this.prisma.vendorProfile.findUnique({ where: { userId } });
  }

  async listPendingVendors() {
    return this.prisma.vendorProfile.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true, mobileNumber: true } } },
    });
  }

  async verifyVendor(vendorProfileId: string, adminId: string, dto: VerifyVendorDto): Promise<VendorProfile> {
    const profile = await this.prisma.vendorProfile.findUnique({ where: { id: vendorProfileId } });
    if (!profile) throw new NotFoundException(bi('Vendor profile not found', 'విక్రేత ప్రొఫైల్ కనుగొనబడలేదు'));
    if (!dto.approve && !dto.reason) {
      throw new BadRequestException(bi('A reason is required when rejecting a vendor', 'విక్రేతను తిరస్కరించేటప్పుడు కారణం అవసరం'));
    }
    const updated = await this.prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: dto.approve ? { isApproved: true, approvedByUserId: adminId, approvedAt: new Date() } : {},
    });
    await this.audit.log({
      actorId: adminId,
      action: dto.approve ? 'vendor.approve' : 'vendor.reject',
      entityType: 'VendorProfile',
      entityId: vendorProfileId,
      metadata: dto.reason ? { reason: dto.reason } : undefined,
    });
    await this.notifications.create(
      profile.userId,
      dto.approve ? 'vendor.approved' : 'vendor.rejected',
      dto.approve
        ? bi('Your vendor account was approved', 'మీ విక్రేత ఖాతా ఆమోదించబడింది')
        : bi('Your vendor application needs changes', 'మీ విక్రేత దరఖాస్తుకు మార్పులు అవసరం'),
      dto.approve
        ? bi('You can now list products', 'ఇప్పుడు మీరు ఉత్పత్తులను జాబితా చేయవచ్చు')
        : bi(dto.reason ?? '', dto.reason ?? ''),
      '/marketplace/vendor',
    );
    return updated;
  }

  // ---------- Categories ----------

  async listCategories() {
    return this.prisma.productCategoryMaster.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.productCategoryMaster.create({ data: { name: dto.name } });
  }

  // ---------- Products ----------

  private async getApprovedVendorProfile(userId: string): Promise<VendorProfile> {
    const profile = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!profile || !profile.isApproved) {
      throw new ForbiddenException(bi('Your vendor account is not approved yet', 'మీ విక్రేత ఖాతా ఇంకా ఆమోదించబడలేదు'));
    }
    return profile;
  }

  async createProduct(requester: { userId: string; role: Role }, dto: CreateProductDto): Promise<Product> {
    const vendorId = requester.role === Role.VENDOR ? (await this.getApprovedVendorProfile(requester.userId)).id : null;
    const created = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        unit: dto.unit,
        stockQuantity: dto.stockQuantity,
        categoryId: dto.categoryId,
        vendorId,
      },
      include: PRODUCT_INCLUDE,
    });
    await this.audit.log({ actorId: requester.userId, action: 'product.create', entityType: 'Product', entityId: created.id });
    return created;
  }

  async updateProduct(productId: string, requester: { userId: string; role: Role }, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.getProductOrThrow(productId);
    await this.assertProductOwnership(existing, requester);
    const updated = await this.prisma.product.update({ where: { id: productId }, data: dto, include: PRODUCT_INCLUDE });
    await this.audit.log({ actorId: requester.userId, action: 'product.update', entityType: 'Product', entityId: productId });
    return updated;
  }

  async uploadProductImage(productId: string, requester: { userId: string; role: Role }, file: Express.Multer.File): Promise<Product> {
    const existing = await this.getProductOrThrow(productId);
    await this.assertProductOwnership(existing, requester);
    const url = await this.uploads.uploadProductImage(productId, file);
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrls: { push: url } },
      include: PRODUCT_INCLUDE,
    });
    await this.audit.log({ actorId: requester.userId, action: 'product.image.upload', entityType: 'Product', entityId: productId });
    return updated;
  }

  // Public catalog — only active products from the platform itself
  // (vendorId null) or from an approved vendor. An unapproved vendor's
  // products stay invisible to farmers even if the vendor already created
  // them, same trust gate as Knowledge's PUBLISHED-only farmer visibility.
  async listPublished(categoryId?: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [{ vendorId: null }, { vendor: { isApproved: true } }],
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: PRODUCT_INCLUDE,
    });
  }

  async listMineForVendor(userId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.product.findMany({ where: { vendorId: profile.id }, orderBy: { updatedAt: 'desc' }, include: PRODUCT_INCLUDE });
  }

  async listAllForAdmin() {
    return this.prisma.product.findMany({ orderBy: { updatedAt: 'desc' }, include: PRODUCT_INCLUDE });
  }

  async getById(productId: string, requester: { userId: string; role: Role }): Promise<Product> {
    const found = await this.getProductOrThrow(productId);
    const isPublic = found.isActive && (found.vendorId === null || (await this.isVendorApproved(found.vendorId)));
    if (isPublic) return found;
    const isOwner = found.vendorId && (await this.prisma.vendorProfile.findUnique({ where: { id: found.vendorId } }))?.userId === requester.userId;
    const isAdmin = requester.role === Role.ADMINISTRATOR;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(bi('This product is not available', 'ఈ ఉత్పత్తి అందుబాటులో లేదు'));
    }
    return found;
  }

  private async isVendorApproved(vendorId: string | null): Promise<boolean> {
    if (!vendorId) return true;
    const vendor = await this.prisma.vendorProfile.findUnique({ where: { id: vendorId } });
    return !!vendor?.isApproved;
  }

  private async getProductOrThrow(productId: string): Promise<Product> {
    const found = await this.prisma.product.findUnique({ where: { id: productId }, include: PRODUCT_INCLUDE });
    if (!found) throw new NotFoundException(bi('Product not found', 'ఉత్పత్తి కనుగొనబడలేదు'));
    return found;
  }

  private async assertProductOwnership(product: Product, requester: { userId: string; role: Role }): Promise<void> {
    if (requester.role === Role.ADMINISTRATOR) return;
    const vendor = product.vendorId ? await this.prisma.vendorProfile.findUnique({ where: { id: product.vendorId } }) : null;
    if (!vendor || vendor.userId !== requester.userId) {
      throw new ForbiddenException(bi('This product does not belong to you', 'ఈ ఉత్పత్తి మీది కాదు'));
    }
  }

  // ---------- Cart ----------

  async setCartItem(userId: string, dto: AddToCartDto) {
    const product = await this.getProductOrThrow(dto.productId);
    if (!product.isActive) {
      throw new BadRequestException(bi('This product is no longer available', 'ఈ ఉత్పత్తి ఇకపై అందుబాటులో లేదు'));
    }
    await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: dto.productId } },
      create: { userId, productId: dto.productId, quantity: dto.quantity },
      update: { quantity: dto.quantity },
    });
    return this.listCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
    return this.listCart(userId);
  }

  async listCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: { product: { include: PRODUCT_INCLUDE } },
    });
    const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    return { items, total };
  }

  // ---------- Orders ----------

  async checkout(userId: string, dto: CheckoutDto): Promise<Order> {
    const cart = await this.prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
    if (cart.length === 0) {
      throw new BadRequestException(bi('Your cart is empty', 'మీ కార్ట్ ఖాళీగా ఉంది'));
    }
    for (const item of cart) {
      if (!item.product.isActive) {
        throw new BadRequestException(
          bi(`"${item.product.name}" is no longer available`, `"${item.product.name}" ఇకపై అందుబాటులో లేదు`),
        );
      }
      if (item.quantity > item.product.stockQuantity) {
        throw new BadRequestException(
          bi(`Not enough stock for "${item.product.name}"`, `"${item.product.name}"కు తగినంత స్టాక్ లేదు`),
        );
      }
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          farmerId: userId,
          totalAmount,
          deliveryAddress: dto.deliveryAddress,
          items: {
            create: cart.map((item) => ({
              productId: item.productId,
              vendorId: item.product.vendorId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
              lineTotal: item.quantity * item.product.price,
            })),
          },
        },
        include: { items: true },
      });
      for (const item of cart) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
      }
      await tx.cartItem.deleteMany({ where: { userId } });
      return created;
    });

    await this.audit.log({
      actorId: userId,
      action: 'order.place',
      entityType: 'Order',
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, totalAmount },
    });
    await this.notifications.notifyRole(
      Role.ADMINISTRATOR,
      'order.placed',
      bi('New order placed', 'కొత్త ఆర్డర్ చేయబడింది'),
      bi(`${order.orderNumber} — ₹${totalAmount.toFixed(2)}`, `${order.orderNumber} — ₹${totalAmount.toFixed(2)}`),
      '/marketplace/manage/orders',
    );
    return order;
  }

  async listMyOrders(userId: string) {
    return this.prisma.order.findMany({ where: { farmerId: userId }, orderBy: { createdAt: 'desc' }, include: { items: true } });
  }

  async listQueueForAdmin() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, farmer: { select: { id: true, name: true, mobileNumber: true } } },
    });
  }

  async getOrderById(orderId: string, requester: { userId: string; role: Role }) {
    const found = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!found) throw new NotFoundException(bi('Order not found', 'ఆర్డర్ కనుగొనబడలేదు'));
    const isOwner = found.farmerId === requester.userId;
    const isAdmin = requester.role === Role.ADMINISTRATOR;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(bi('You do not have access to this order', 'మీకు ఈ ఆర్డర్‌కు ప్రాప్యత లేదు'));
    }
    return found;
  }

  async confirmOrder(orderId: string, adminId: string): Promise<Order> {
    return this.transitionOrder(orderId, adminId, [OrderStatus.PLACED], OrderStatus.CONFIRMED, 'order.confirm');
  }

  async shipOrder(orderId: string, adminId: string): Promise<Order> {
    return this.transitionOrder(orderId, adminId, [OrderStatus.CONFIRMED], OrderStatus.SHIPPED, 'order.ship');
  }

  async deliverOrder(orderId: string, adminId: string): Promise<Order> {
    const updated = await this.transitionOrder(orderId, adminId, [OrderStatus.SHIPPED], OrderStatus.DELIVERED, 'order.deliver');
    await this.notifications.create(
      updated.farmerId,
      'order.delivered',
      bi('Your order was delivered', 'మీ ఆర్డర్ డెలివరీ చేయబడింది'),
      bi(`${updated.orderNumber} has been delivered`, `${updated.orderNumber} డెలివరీ చేయబడింది`),
      `/marketplace/orders/${orderId}`,
    );
    return updated;
  }

  // Restocks every line item — a cancellation before delivery means the
  // reserved inventory goes back on the shelf.
  async cancelOrder(orderId: string, adminId: string): Promise<Order> {
    const existing = await this.getOrderOrThrow(orderId);
    if (existing.status === OrderStatus.DELIVERED || existing.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        bi(`Cannot cancel an order in ${existing.status} status`, `${existing.status} స్థితిలో ఉన్న ఆర్డర్‌ను రద్దు చేయలేరు`),
      );
    }
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
      }
      return tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.CANCELLED }, include: { items: true } });
    });
    await this.audit.log({ actorId: adminId, action: 'order.cancel', entityType: 'Order', entityId: orderId });
    await this.notifications.create(
      updated.farmerId,
      'order.cancelled',
      bi('Your order was cancelled', 'మీ ఆర్డర్ రద్దు చేయబడింది'),
      bi(`${updated.orderNumber} was cancelled`, `${updated.orderNumber} రద్దు చేయబడింది`),
      `/marketplace/orders/${orderId}`,
    );
    return updated;
  }

  private async transitionOrder(
    orderId: string,
    adminId: string,
    allowed: OrderStatus[],
    next: OrderStatus,
    action: string,
  ): Promise<Order> {
    const existing = await this.getOrderOrThrow(orderId);
    if (!allowed.includes(existing.status)) {
      throw new BadRequestException(
        bi(`Cannot move an order from ${existing.status} to ${next}`, `ఆర్డర్‌ను ${existing.status} నుండి ${next}కు తరలించలేరు`),
      );
    }
    const updated = await this.prisma.order.update({ where: { id: orderId }, data: { status: next }, include: { items: true } });
    await this.audit.log({ actorId: adminId, action, entityType: 'Order', entityId: orderId });
    return updated;
  }

  private async getOrderOrThrow(orderId: string): Promise<Order> {
    const found = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!found) throw new NotFoundException(bi('Order not found', 'ఆర్డర్ కనుగొనబడలేదు'));
    return found;
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ORD-${year}-${random}`;
  }

  // ---------- Reviews ----------

  async submitReview(productId: string, userId: string, dto: SubmitReviewDto) {
    await this.getProductOrThrow(productId);
    const review = await this.prisma.productReview.upsert({
      where: { productId_userId: { productId, userId } },
      create: { productId, userId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
    });
    await this.audit.log({ actorId: userId, action: 'product.review.submit', entityType: 'Product', entityId: productId });
    return review;
  }

  async getReviews(productId: string, userId: string) {
    const [reviews, aggregate, mine] = await Promise.all([
      this.prisma.productReview.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: { select: { id: true, name: true } } },
      }),
      this.prisma.productReview.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } }),
      this.prisma.productReview.findUnique({ where: { productId_userId: { productId, userId } } }),
    ]);
    return {
      averageRating: aggregate._avg.rating,
      totalCount: aggregate._count._all,
      myReview: mine ? { rating: mine.rating, comment: mine.comment } : null,
      reviews,
    };
  }

  // ---------- Wishlist ----------

  async toggleWishlist(productId: string, userId: string): Promise<{ wishlisted: boolean }> {
    const existing = await this.prisma.productWishlist.findUnique({ where: { productId_userId: { productId, userId } } });
    if (existing) {
      await this.prisma.productWishlist.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    }
    await this.getProductOrThrow(productId);
    await this.prisma.productWishlist.create({ data: { productId, userId } });
    return { wishlisted: true };
  }

  async listWishlist(userId: string) {
    const rows = await this.prisma.productWishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: PRODUCT_INCLUDE } },
    });
    return rows.map((r) => r.product);
  }
}
