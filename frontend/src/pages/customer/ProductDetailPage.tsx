import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, Check, MapPin } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { inventoryApi } from '../../services/inventoryApi';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/customer/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalAvailable, setTotalAvailable] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(false);
  const [sizeError, setSizeError] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const [prodData, invData, catalog] = await Promise.all([
          productApi.getProductById(id),
          inventoryApi.getAllInventory(id),
          productApi.getAllProducts(),
        ]);

        setProduct(prodData);
        setAllProducts(catalog);

        const available = invData.reduce((acc, inv) => acc + (inv.quantityAvailable ?? 0), 0);
        setTotalAvailable(available);

        // Pre-select image
        if (prodData.imageUrl) setSelectedImage(prodData.imageUrl);

        // Parse available sizes
        if (prodData.sizes) {
          const szList = prodData.sizes.split(',').map((s) => s.trim());
          if (szList.length > 0) setSelectedSize(szList[0]);
        } else {
          setSelectedSize('M');
        }

        // Parse available colors
        if (prodData.colors) {
          const colList = prodData.colors.split(',').map((c) => c.trim());
          if (colList.length > 0) setSelectedColor(colList[0]);
        }
      } catch (err: any) {
        console.error('Failed to load product detail:', err);
        setError('Requested item is currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="VELORA-loading-container" style={{ minHeight: '60vh' }}>
        <div className="VELORA-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--store-text-muted)', fontSize: '0.9rem' }}>
          Loading item detail...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <h2>Item Not Found</h2>
        <p style={{ color: 'var(--store-text-secondary)', margin: '1rem 0 2rem' }}>
          The requested product could not be found or has been moved.
        </p>
        <Link to="/shop" className="btn-VELORA-primary">Browse All Products</Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const isInBag = cartItems.some((item) => item.product.id === product.id);
  const isOutOfStock = totalAvailable <= 0;

  const sellingPrice = Number(product.unitPrice);
  const origPrice = product.originalPrice ? Number(product.originalPrice) : Math.round(sellingPrice * 1.5);
  const discountPercent = origPrice > sellingPrice ? Math.round(((origPrice - sellingPrice) / origPrice) * 100) : 0;

  const availableSizes = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : ['S', 'M', 'L', 'XL'];
  const availableColors = product.colors ? product.colors.split(',').map((c) => c.trim()) : [];

  const mainImg = selectedImage || product.imageUrl || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80';

  const handleAddToCart = () => {
    if (!selectedSize && availableSizes.length > 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    if (isOutOfStock) return;

    addToCart(product, 1, totalAvailable);
    navigate('/cart');
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setPincodeChecked(true);
    }
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
    .slice(0, 4);

  return (
    <div className="VELORA-product-detail-page">
      {/* BREADCRUMB */}
      <div className="shop-breadcrumb" style={{ maxWidth: '1280px', margin: '0 auto 2rem', padding: '0 1.5rem' }}>
        <Link to="/">HOME</Link>
        <span>/</span>
        <Link to="/shop">SHOP</Link>
        <span>/</span>
        <span className="current">{product.name.toUpperCase()}</span>
      </div>

      <div className="detail-main-grid">
        {/* LEFT GALLERY */}
        <div className="detail-gallery-column">
          <div className="gallery-thumbnails">
            <button
              onClick={() => setSelectedImage(product.imageUrl || mainImg)}
              className={`thumbnail-btn ${selectedImage === product.imageUrl || !selectedImage ? 'active' : ''}`}
            >
              <img src={product.imageUrl || mainImg} alt="Primary view" />
            </button>
            {product.secondaryImageUrl && (
              <button
                onClick={() => setSelectedImage(product.secondaryImageUrl!)}
                className={`thumbnail-btn ${selectedImage === product.secondaryImageUrl ? 'active' : ''}`}
              >
                <img src={product.secondaryImageUrl} alt="Secondary view" />
              </button>
            )}
          </div>

          <div className="gallery-main-view">
            <img src={mainImg} alt={product.name} />
            {discountPercent > 0 && <span className="detail-discount-badge">{discountPercent}% OFF</span>}
          </div>
        </div>

        {/* RIGHT PRODUCT INFO */}
        <div className="detail-info-column">
          <div className="detail-brand-name">{product.brand || 'VELORA Core'}</div>
          <h1 className="detail-product-name">{product.name}</h1>

          {/* RATING */}
          <div className="detail-rating-row">
            <div className="stars-flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= Math.round(product.rating || 4.8) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span className="rating-num">{(product.rating || 4.8).toFixed(1)}</span>
            <span className="review-count">({product.reviewCount || 95} reviews)</span>
          </div>

          {/* PRICE ROW */}
          <div className="detail-price-box">
            <span className="detail-selling-price">₹{sellingPrice.toLocaleString('en-IN')}</span>
            {origPrice > sellingPrice && (
              <span className="detail-original-price">MRP ₹{origPrice.toLocaleString('en-IN')}</span>
            )}
            <span className="detail-tax-note">Inclusive of all taxes</span>
          </div>

          <p className="detail-description">
            {product.description || 'Designed for clean daily wear and constructed with durable materials.'}
          </p>

          {/* COLOR SELECTION */}
          {availableColors.length > 0 && (
            <div className="detail-option-group">
              <label className="option-label">
                COLOR: <strong style={{ color: '#171717' }}>{selectedColor}</strong>
              </label>
              <div className="color-swatches">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`color-swatch-btn ${selectedColor === color ? 'active' : ''}`}
                  >
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE SELECTION */}
          <div className="detail-option-group">
            <div className="option-header-flex">
              <label className="option-label">
                SELECT SIZE: <strong style={{ color: '#171717' }}>{selectedSize}</strong>
              </label>
              <button className="size-guide-trigger">SIZE CHART</button>
            </div>

            <div className="size-buttons-grid">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setSelectedSize(sz);
                    setSizeError(false);
                  }}
                  className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                >
                  {sz}
                </button>
              ))}
            </div>
            {sizeError && <span className="size-error-msg">Please select a size to proceed.</span>}
          </div>

          {/* ACTION BUTTONS */}
          <div className="detail-actions-row">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn-add-bag-primary"
            >
              <ShoppingBag size={18} />
              <span>{isOutOfStock ? 'OUT OF STOCK' : isInBag ? 'GO TO BAG' : 'ADD TO BAG'}</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`btn-wishlist-toggle ${isLiked ? 'liked' : ''}`}
              title="Add to Wishlist"
            >
              <Heart size={20} fill={isLiked ? '#e11d48' : 'none'} color={isLiked ? '#e11d48' : '#171717'} />
            </button>
          </div>

          {/* PINCODE DELIVERY CHECKER */}
          <div className="pincode-checker-box">
            <h4 className="checker-title">
              <MapPin size={16} /> Check Delivery &amp; Service Availability
            </h4>
            <form onSubmit={handlePincodeCheck} className="pincode-form">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 400001)"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeChecked(false);
                }}
                maxLength={6}
                className="pincode-input"
              />
              <button type="submit" className="pincode-check-btn">CHECK</button>
            </form>

            {pincodeChecked && (
              <div className="pincode-success-info">
                <p><Check size={14} style={{ color: '#059669', display: 'inline', marginRight: '4px' }} /> Delivery available to <strong>{pincode}</strong></p>
                <span>Estimated Delivery: <strong>2 - 4 Business Days</strong> (Free Express Shipping)</span>
              </div>
            )}
          </div>

          {/* SERVICE PROMISES */}
          <div className="detail-service-promises">
            <div className="promise-item">
              <Truck size={18} className="promise-icon" />
              <span>Free Delivery on orders above ₹999</span>
            </div>
            <div className="promise-item">
              <RotateCcw size={18} className="promise-icon" />
              <span>15 Days Doorstep Returns &amp; Exchanges</span>
            </div>
            <div className="promise-item">
              <ShieldCheck size={18} className="promise-icon" />
              <span>Verified Product Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="VELORA-section" style={{ marginTop: '5rem', borderTop: '1px solid var(--store-border)', paddingTop: '4rem' }}>
          <div className="section-header-centered">
            <span className="section-sub">COMPLEMENTARY ITEMS</span>
            <h2 className="section-title">You May Also Like</h2>
          </div>

          <div className="products-grid">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

