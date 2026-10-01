import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  availableStock?: number;
}

const CATEGORY_IMAGE_FALLBACKS: Record<string, { primary: string; secondary: string }> = {
  dresses: {
    primary: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
  },
  shirts: {
    primary: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  },
  jackets: {
    primary: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
  },
  bottomwear: {
    primary: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80',
  },
  handbags: {
    primary: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
  },
  footwear: {
    primary: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
  },
  accessories: {
    primary: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  },
  tops: {
    primary: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  },
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, availableStock }) => {
  const { addToCart, cartItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);
  const isInBag = cartItems.some((item) => item.product.id === product.id);

  const isStockKnown = availableStock !== undefined;
  const isOutOfStock = isStockKnown && availableStock <= 0;
  const isLowStock = isStockKnown && availableStock > 0 && availableStock <= 4;

  const catLower = (product.category || '').toLowerCase();
  const fallbacks = CATEGORY_IMAGE_FALLBACKS[catLower] || {
    primary: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    secondary: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
  };

  const primaryImg = product.imageUrl || fallbacks.primary;
  const secondaryImg = product.secondaryImageUrl || fallbacks.secondary;

  const sellingPrice = Number(product.unitPrice);
  const origPrice = product.originalPrice ? Number(product.originalPrice) : Math.round(sellingPrice * 1.6);
  const discountPercent = origPrice > sellingPrice ? Math.round(((origPrice - sellingPrice) / origPrice) * 100) : 0;
  const ratingValue = product.rating || 4.8;
  const reviewsCount = product.reviewCount || (Math.floor(Math.abs(product.id.charCodeAt(0) * 13) % 150) + 24);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, availableStock);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="fashion-product-card">
      <Link to={`/products/${product.id}`} className="fashion-card-image-link">
        <div className="fashion-card-image-container">
          <img src={primaryImg} alt={product.name} className="primary-img" loading="lazy" />
          <img src={secondaryImg} alt={`${product.name} alternate view`} className="secondary-img" loading="lazy" />

          {/* BADGES */}
          <div className="fashion-badges-wrapper">
            {discountPercent > 0 && (
              <span className="badge-discount">{discountPercent}% OFF</span>
            )}
            {isOutOfStock ? (
              <span className="badge-stock-out">OUT OF STOCK</span>
            ) : isLowStock ? (
              <span className="badge-stock-low">FEW LEFT</span>
            ) : null}
          </div>

          {/* WISHLIST BUTTON */}
          <button
            onClick={handleToggleWishlist}
            className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
            title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={18} fill={isLiked ? '#e11d48' : 'none'} color={isLiked ? '#e11d48' : '#171717'} />
          </button>

          {/* QUICK ADD OVERLAY BUTTON */}
          {!isOutOfStock && (
            <div className="quick-add-overlay">
              <button onClick={handleAddToCart} className="quick-add-btn">
                {isInBag ? <Check size={16} /> : <ShoppingBag size={16} />}
                <span>{isInBag ? 'ADDED TO BAG' : 'ADD TO BAG'}</span>
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="fashion-card-details">
        <div className="fashion-card-meta">
          <span className="fashion-brand">{product.brand || 'VELORA Core'}</span>
          <div className="fashion-rating">
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>{ratingValue.toFixed(1)}</span>
            <span className="review-cnt">({reviewsCount})</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`} className="fashion-product-title">
          {product.name}
        </Link>

        <div className="fashion-price-row">
          <span className="selling-price">₹{sellingPrice.toLocaleString('en-IN')}</span>
          {origPrice > sellingPrice && (
            <span className="original-price">₹{origPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

