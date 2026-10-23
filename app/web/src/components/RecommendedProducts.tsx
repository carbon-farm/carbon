import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getRecommendedForArticle, type Product } from '../api/marketplace';
import { ProductThumb } from './ProductThumb';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

// "Products that may help" under an advice article: turns advice into something a member can act
// on. Shows nothing at all when nothing matches, so there is never an empty or wrong-looking box.
export function RecommendedProducts({ articleId }: { articleId: string }) {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getRecommendedForArticle(session.accessToken, articleId)
      .then((p) => !cancelled && setProducts(p))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [session, articleId]);

  if (products.length === 0) return null;
  return (
    <div className="card">
      <Bi id="recommendedHeading" as="h2" />
      <BiValue value={strings.recommendedHint} as="p" className="hint" />
      <div className="recommended-grid">
        {products.map((p) => (
          <Link key={p.id} to={`/marketplace/products/${p.id}`} className="recommended-card">
            <ProductThumb product={p} variant="tile" />
            <strong>{p.name}</strong>
            <span>
              ₹{p.price.toFixed(2)} {p.unit}
            </span>
            <small className="hint">
              <Bi id="recommendedView" />
            </small>
          </Link>
        ))}
      </div>
    </div>
  );
}
