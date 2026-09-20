import type { ShippingAddress } from '../api/marketplace';

// A delivery address laid out the way a courier reads it. Works for a saved address and for
// the frozen copy on an order.
export function AddressBlock({ address }: { address: ShippingAddress }) {
  return (
    <div className="address-block">
      <div>
        <strong>{address.recipientName}</strong> · {address.phone}
        {address.alternatePhone ? ` / ${address.alternatePhone}` : ''}
      </div>
      <div>{address.line1}</div>
      {address.line2 && <div>{address.line2}</div>}
      {address.landmark && <div>{address.landmark}</div>}
      <div>
        {address.city}, {address.state} {address.pincode}
      </div>
      {address.email && <div className="meta">{address.email}</div>}
    </div>
  );
}
