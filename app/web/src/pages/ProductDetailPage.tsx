import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  getProduct,
  setCartItem,
  toggleWishlist,
  getReviews,
  submitReview,
  type Product,
  type ReviewsSummary,
} from '../api/marketplace';
import { Bi, BiValue } from '../i18n/Bi';
import { strings } from '../i18n/strings';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [reviews, setReviews] = useState<ReviewsSummary | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    if (!session || !id) return;
    getProduct(session.accessToken, id)
      .then(setProduct)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err instanceof ApiError ? err.message : `${strings.couldNotLoadProduct.en} / ${strings.couldNotLoadProduct.te}`);
      })
      .finally(() => setLoading(false));
    getReviews(session.accessToken, id)
      .then((summary) => {
        setReviews(summary);
        if (summary.myReview) {
          setRating(summary.myReview.rating);
          setComment(summary.myReview.comment ?? '');
        }
      })
      .catch(() => {});
  }, [id, session, logout]);

  async function handleAddToCart() {
    if (!session || !id) return;
    setAddingToCart(true);
    setError(null);
    try {
      await setCartItem(session.accessToken, id, quantity);
      navigate('/marketplace/cart');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotAddToCart.en} / ${strings.couldNotAddToCart.te}`);
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleToggleWishlist() {
    if (!session || !id) return;
    setWishlistBusy(true);
    try {
      const result = await toggleWishlist(session.accessToken, id);
      setWishlisted(result.wishlisted);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotToggleWishlist.en} / ${strings.couldNotToggleWishlist.te}`);
    } finally {
      setWishlistBusy(false);
    }
  }

  async function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !id || rating === 0) return;
    setReviewBusy(true);
    setError(null);
    try {
      await submitReview(session.accessToken, id, { rating, comment: comment.trim() || undefined });
      setReviews(await getReviews(session.accessToken, id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${strings.couldNotSubmitReview.en} / ${strings.couldNotSubmitReview.te}`);
    } finally {
      setReviewBusy(false);
    }
  }

  return (
    <>
      <div>
        <Bi id="marketplaceEyebrow" as="span" className="eyebrow" />
        <h1>{product?.name ?? ''}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <BiValue value={strings.loading} as="p" className="hint" />
      ) : !product ? (
        <BiValue value={strings.productNotFoundError} as="p" className="hint" />
      ) : (
        <>
          <div className="card">
            {product.imageUrls.length > 0 && (
              <div className="evidence-media-grid">
                {product.imageUrls.map((url) => (
                  <img src={url} alt="" className="evidence-thumb" key={url} />
                ))}
              </div>
            )}
            <div>{product.description}</div>
            <div className="stat-row">
              <div className="stat-tile">
                <div className="value">₹{product.price.toFixed(2)}</div>
                <BiValue value={strings.productPriceLabel} as="div" className="label" />
              </div>
              <div className="stat-tile">
                <div className="value">{product.stockQuantity}</div>
                <BiValue value={strings.productStockLabel} as="div" className="label" />
              </div>
            </div>
            <div className="meta">{product.vendor?.businessName ?? strings.platformSoldOption.en}</div>

            {product.stockQuantity === 0 ? (
              <BiValue value={strings.outOfStockNotice} as="p" className="hint" />
            ) : (
              <>
                <label>
                  <Bi id="quantityLabel" />
                  <input
                    type="number"
                    min={1}
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, Number(e.target.value))))}
                  />
                </label>
                <button type="button" onClick={handleAddToCart} disabled={addingToCart}>
                  {addingToCart ? <BiValue value={strings.addingToCart} /> : <Bi id="addToCartButton" />}
                </button>
              </>
            )}
            <button type="button" className="secondary" onClick={handleToggleWishlist} disabled={wishlistBusy}>
              {wishlisted ? <Bi id="wishlistedButton" /> : <Bi id="wishlistButton" />}
            </button>
          </div>

          <div className="card">
            <Bi id="reviewsHeading" as="h2" />
            {reviews && reviews.totalCount > 0 && (
              <div className="stat-row">
                <div className="stat-tile">
                  <div className="value">{reviews.averageRating?.toFixed(1) ?? '—'} / 5</div>
                  <BiValue value={strings.averageRatingLabel} as="div" className="label" />
                </div>
                <div className="stat-tile">
                  <div className="value">{reviews.totalCount}</div>
                  <BiValue value={strings.responsesCountLabel} as="div" className="label" />
                </div>
              </div>
            )}

            {reviews?.reviews.length ? (
              reviews.reviews.map((r) => (
                <div className="farm-item" key={r.id}>
                  <div className="label">
                    {r.user.name} · {r.rating} / 5
                  </div>
                  {r.comment && <div className="meta">{r.comment}</div>}
                </div>
              ))
            ) : (
              <BiValue value={strings.noReviewsYet} as="p" className="hint" />
            )}

            <form onSubmit={handleSubmitReview}>
              <Bi id="writeReviewHeading" as="h2" />
              <label>
                <Bi id="ratingFieldLabel" />
                <div className="stat-row">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" className={rating >= n ? '' : 'secondary'} onClick={() => setRating(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                <Bi id="feedbackCommentField" />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={1000} />
              </label>
              <button type="submit" disabled={reviewBusy || rating === 0}>
                {reviewBusy ? (
                  <BiValue value={strings.submittingReview} />
                ) : reviews?.myReview ? (
                  <Bi id="updateReviewButton" />
                ) : (
                  <Bi id="submitReviewButton" />
                )}
              </button>
            </form>
          </div>
        </>
      )}

      <Link to="/marketplace" className="link-button">
        {strings.backButton.en} / {strings.backButton.te}
      </Link>
    </>
  );
}
