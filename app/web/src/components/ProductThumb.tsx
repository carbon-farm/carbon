import type { Product } from '../api/marketplace';

// A product's first photo, or a neutral leaf tile when it has none — so grids and lists line up
// and a missing photo never leaves a hole. "tile" fills the width of a shop card; "row" is the
// small square used in lists.
export function ProductThumb({ product, variant = 'row' }: { product: Pick<Product, 'imageUrls' | 'name'>; variant?: 'tile' | 'row' }) {
  const src = product.imageUrls[0];
  return src ? (
    <img src={src} alt="" className={`product-thumb ${variant}`} loading="lazy" />
  ) : (
    <div className={`product-thumb ${variant} empty`} aria-hidden="true">
      <span>🌿</span>
    </div>
  );
}
