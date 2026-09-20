export interface AddressFields {
  label?: string | null;
  recipientName: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
}

// "+91 98765-43210", "098765 43210" -> "9876543210": store one plain 10-digit form so the
// dispatch team and any later WhatsApp/SMS feature always get a clean number.
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '').slice(-10);
}

// The frozen copy stored on an order (exactly what will be delivered to).
export function addressSnapshot(a: AddressFields) {
  return {
    recipientName: a.recipientName,
    phone: a.phone,
    alternatePhone: a.alternatePhone ?? null,
    email: a.email ?? null,
    line1: a.line1,
    line2: a.line2 ?? null,
    landmark: a.landmark ?? null,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
  };
}

// One readable block, kept in Order.deliveryAddress so old screens, exports and anything
// reading the plain-text column keep working.
export function formatAddress(a: AddressFields): string {
  return [
    `${a.recipientName}, ${a.phone}${a.alternatePhone ? ` / ${a.alternatePhone}` : ''}`,
    a.line1,
    a.line2,
    a.landmark ? `Landmark: ${a.landmark}` : null,
    `${a.city}, ${a.state} ${a.pincode}`,
  ]
    .filter(Boolean)
    .join(', ');
}
