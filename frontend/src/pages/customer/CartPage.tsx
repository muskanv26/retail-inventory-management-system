import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ArrowLeft, ArrowRight, ShoppingBag, Tag, Check, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>('');

  const FREE_SHIPPING_THRESHOLD = 999;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const couponDiscount = couponApplied ? Math.min(450, subtotal * 0.15) : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - couponDiscount);

  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'VELORA15') {
      setCouponApplied(true);
    } else {
      setCouponError('Invalid promo code. Try VELORA15');
    }
  };

  const handleMoveToWishlist = (product: any) => {
    addToWishlist(product);
    removeFromCart(product.id);
  };

  if (cartItems.length === 0) {
    return (
      <div className="VELORA-cart-empty-page">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">
            <ShoppingBag size={48} />
          </div>
          <h2 className="empty-title">Your Shopping Bag is Empty</h2>
          <p className="empty-subtitle">
            Your bag is waiting. Discover everyday essentials and elevated wear from our catalog.
          </p>
          <Link to="/shop" className="btn-VELORA-primary">
            <span>START SHOPPING</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="VELORA-cart-page">
      {/* PAGE TITLE */}
      <div className="cart-header-row">
        <div>
          <h1 className="cart-page-title">MY BAG ({cartItems.length})</h1>
          <p className="cart-page-subtitle">Review items in your shopping bag before checkout</p>
        </div>
        <button onClick={clearCart} className="clear-bag-btn">
          <Trash2 size={15} /> Clear Bag
        </button>
      </div>

      {/* FREE SHIPPING PROGRESS BAR */}
      <div className="free-shipping-bar-card">
        <div className="free-shipping-text">
          {amountForFreeShipping > 0 ? (
            <span>
              Add <strong>₹{amountForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong>FREE Express Shipping</strong>!
            </span>
          ) : (
            <span style={{ color: '#059669', fontWeight: 600 }}>
              <Check size={16} style={{ display: 'inline', marginRight: '4px' }} /> Congratulations! You unlocked <strong>FREE Express Shipping</strong>!
            </span>
          )}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${freeShippingProgress}%` }}></div>
        </div>
      </div>

      <div className="cart-main-grid">
        {/* LEFT BAG ITEMS LIST */}
        <div className="cart-items-column">
          {cartItems.map(({ product, quantity, availableStock }) => {
            const sellingPrice = Number(product.unitPrice);
            const lineTotal = sellingPrice * quantity;
            const maxQty = availableStock !== undefined ? availableStock : 99;

            const imageSrc = product.imageUrl || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80';

            return (
              <div key={product.id} className="bag-item-card">
                <Link to={`/products/${product.id}`} className="bag-item-image">
                  <img src={imageSrc} alt={product.name} />
                </Link>

                <div className="bag-item-info">
                  <div className="bag-item-brand">{product.brand || 'VELORA Core'}</div>
                  <Link to={`/products/${product.id}`} className="bag-item-title">
                    {product.name}
                  </Link>

                  <div className="bag-item-spec">
                    Category: <span>{product.category}</span>
                  </div>

                  <div className="bag-item-price-row">
                    <span className="unit-price">₹{sellingPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bag-item-actions-row">
                    {/* QUANTITY CONTROLS */}
                    <div className="bag-qty-selector">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= maxQty}
                      >
                        +
                      </button>
                    </div>

                    {/* MOVE TO WISHLIST */}
                    <button
                      onClick={() => handleMoveToWishlist(product)}
                      className="bag-move-wishlist-btn"
                    >
                      <Heart size={14} /> Move to Wishlist
                    </button>

                    {/* REMOVE ITEM */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="bag-remove-btn"
                      title="Remove item"
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>

                <div className="bag-item-total">
                  ₹{lineTotal.toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}

          <Link to="/shop" className="continue-shopping-link">
            <ArrowLeft size={16} /> CONTINUE SHOPPING
          </Link>
        </div>

        {/* RIGHT SUMMARY SIDEBAR */}
        <div className="cart-summary-column">
          <div className="summary-card">
            <h3 className="summary-title">PRICE DETAILS ({cartItems.length} items)</h3>

            {/* PROMO COUPON FORM */}
            <div className="summary-coupon-box">
              <label className="coupon-label">
                <Tag size={15} /> HAVE A PROMO CODE?
              </label>
              {couponApplied ? (
                <div className="coupon-applied-badge">
                  <span>PROMO CODE &quot;VELORA15&quot; APPLIED</span>
                  <button onClick={() => setCouponApplied(false)}><X size={14} /></button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    placeholder="Enter VELORA15"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                  <button type="submit" className="coupon-apply-btn">APPLY</button>
                </form>
              )}
              {couponError && <span className="coupon-error">{couponError}</span>}
            </div>

            {/* BREAKDOWN */}
            <div className="summary-line-items">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Promo Discount (VELORA15)</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated Shipping</span>
                {shippingFee === 0 ? (
                  <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                ) : (
                  <span>₹{shippingFee}</span>
                )}
              </div>

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-VELORA-primary place-order-btn"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

