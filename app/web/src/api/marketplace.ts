import { apiRequest, apiUpload } from './client';

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProductCategory {
  id: string;
  name: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  isApproved: boolean;
  approvedAt: string | null;
  user?: { id: string; name: string; mobileNumber: string };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  imageUrls: string[];
  categoryId: string | null;
  category: { id: string; name: string } | null;
  vendorId: string | null;
  vendor: { id: string; businessName: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItemEntry {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  farmerId: string;
  farmer?: { id: string; name: string; mobileNumber: string };
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  items: OrderItemEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEntry {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

export interface ReviewsSummary {
  averageRating: number | null;
  totalCount: number;
  myReview: { rating: number; comment: string | null } | null;
  reviews: ReviewEntry[];
}

// ---------- Categories ----------

export function listCategories(token: string) {
  return apiRequest<ProductCategory[]>('/marketplace/categories', { token });
}

export function createCategory(token: string, name: string) {
  return apiRequest<ProductCategory>('/marketplace/categories', { method: 'POST', body: { name }, token });
}

// ---------- Vendor profile ----------

export function submitVendorProfile(token: string, data: { businessName: string; description?: string }) {
  return apiRequest<VendorProfile>('/marketplace/vendor-profile', { method: 'POST', body: data, token });
}

export function getMyVendorProfile(token: string) {
  return apiRequest<VendorProfile | null>('/marketplace/vendor-profile/mine', { token });
}

export function listPendingVendors(token: string) {
  return apiRequest<VendorProfile[]>('/marketplace/vendor-profile/pending', { token });
}

export function verifyVendor(token: string, id: string, approve: boolean, reason?: string) {
  return apiRequest<VendorProfile>(`/marketplace/vendor-profile/${id}/verify`, { method: 'POST', body: { approve, reason }, token });
}

// ---------- Products ----------

export function createProduct(
  token: string,
  data: { name: string; description: string; price: number; unit: string; stockQuantity: number; categoryId?: string },
) {
  return apiRequest<Product>('/marketplace/products', { method: 'POST', body: data, token });
}

export function listPublishedProducts(token: string, categoryId?: string, search?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.set('categoryId', categoryId);
  if (search) params.set('search', search);
  const qs = params.toString();
  return apiRequest<Product[]>(`/marketplace/products${qs ? `?${qs}` : ''}`, { token });
}

export function listMyProducts(token: string) {
  return apiRequest<Product[]>('/marketplace/products/mine', { token });
}

export function listAllProductsForAdmin(token: string) {
  return apiRequest<Product[]>('/marketplace/products/admin', { token });
}

export function getProduct(token: string, id: string) {
  return apiRequest<Product>(`/marketplace/products/${id}`, { token });
}

export function updateProduct(
  token: string,
  id: string,
  data: Partial<{ name: string; description: string; price: number; unit: string; stockQuantity: number; categoryId: string; isActive: boolean }>,
) {
  return apiRequest<Product>(`/marketplace/products/${id}`, { method: 'PATCH', body: data, token });
}

export function uploadProductImage(token: string, id: string, file: File) {
  return apiUpload<Product>(`/marketplace/products/${id}/images`, file, token);
}

// ---------- Reviews ----------

export function submitReview(token: string, productId: string, data: { rating: number; comment?: string }) {
  return apiRequest(`/marketplace/products/${productId}/reviews`, { method: 'POST', body: data, token });
}

export function getReviews(token: string, productId: string) {
  return apiRequest<ReviewsSummary>(`/marketplace/products/${productId}/reviews`, { token });
}

// ---------- Wishlist ----------

export function toggleWishlist(token: string, productId: string) {
  return apiRequest<{ wishlisted: boolean }>(`/marketplace/products/${productId}/wishlist`, { method: 'POST', token });
}

export function listWishlist(token: string) {
  return apiRequest<Product[]>('/marketplace/wishlist', { token });
}

// ---------- Cart ----------

export function getCart(token: string) {
  return apiRequest<Cart>('/marketplace/cart', { token });
}

export function setCartItem(token: string, productId: string, quantity: number) {
  return apiRequest<Cart>('/marketplace/cart', { method: 'POST', body: { productId, quantity }, token });
}

export function removeFromCart(token: string, productId: string) {
  return apiRequest<Cart>(`/marketplace/cart/${productId}/remove`, { method: 'POST', token });
}

// ---------- Orders ----------

export function checkout(token: string, deliveryAddress: string) {
  return apiRequest<Order>('/marketplace/orders/checkout', { method: 'POST', body: { deliveryAddress }, token });
}

export function listMyOrders(token: string) {
  return apiRequest<Order[]>('/marketplace/orders/mine', { token });
}

export function listOrdersQueue(token: string) {
  return apiRequest<Order[]>('/marketplace/orders/manage', { token });
}

export function getOrder(token: string, id: string) {
  return apiRequest<Order>(`/marketplace/orders/${id}`, { token });
}

export function confirmOrder(token: string, id: string) {
  return apiRequest<Order>(`/marketplace/orders/${id}/confirm`, { method: 'POST', token });
}

export function shipOrder(token: string, id: string) {
  return apiRequest<Order>(`/marketplace/orders/${id}/ship`, { method: 'POST', token });
}

export function deliverOrder(token: string, id: string) {
  return apiRequest<Order>(`/marketplace/orders/${id}/deliver`, { method: 'POST', token });
}

export function cancelOrder(token: string, id: string) {
  return apiRequest<Order>(`/marketplace/orders/${id}/cancel`, { method: 'POST', token });
}
