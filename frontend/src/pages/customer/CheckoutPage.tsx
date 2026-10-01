import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Truck, Lock, QrCode } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { warehouseApi } from '../../services/warehouseApi';
import { orderApi } from '../../services/orderApi';
import type { CreateOrderRequest } from '../../types/order';

export const CheckoutPage: React.FC = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [fulfillmentWarehouseCode, setFulfillmentWarehouseCode] = useState<string>('WH-NORTH');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Contact & Shipping Details
  const [customerName, setCustomerName] = useState('Alex Sharma');
  const [email, setEmail] = useState('alex.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Flat 402, Sea Crest Apartments, Worli Sea Face');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('400018');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('UPI');

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await warehouseApi.getAllWarehouses();
        const activeWhs = data.filter((w) => w.active);
        if (activeWhs.length > 0) {
          setFulfillmentWarehouseCode(activeWhs[0].code);
        }
      } catch (err: any) {
        console.error('Resolved default warehouse fallback:', err);
      }
    };

    fetchWarehouses();
  }, []);

  const shipping = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const generatedOrderNumber = `ORD-SALES-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderRequest: CreateOrderRequest = {
        orderNumber: generatedOrderNumber,
        type: 'SALES',
        warehouseCode: fulfillmentWarehouseCode || 'WH-NORTH',
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: Number(item.product.unitPrice),
        })),
      };

      const createdOrder = await orderApi.createOrder(orderRequest);

      // Clear local cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${createdOrder.orderNumber}`, {
        state: { order: createdOrder, customerName, email, address, city, state, postalCode, paymentMethod },
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Unable to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="VELORA-cart-empty-page">
        <div className="empty-cart-card">
          <h2>Your bag is empty</h2>
          <p style={{ color: 'var(--store-text-secondary)', margin: '1rem 0 2rem' }}>
            Add products before proceeding to checkout.
          </p>
          <Link to="/shop" className="btn-VELORA-primary">Browse Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="VELORA-checkout-page">
      <div className="checkout-container">
        <Link to="/cart" className="return-cart-link">
          <ArrowLeft size={16} /> Return to Shopping Bag
        </Link>

        <h1 className="checkout-title">CHECKOUT</h1>
        <p className="checkout-subtitle">Complete your shipping &amp; payment details to place your order</p>

        {error && (
          <div className="checkout-error-banner">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="checkout-grid">
            {/* LEFT FORM SECTIONS */}
            <div className="checkout-form-column">
              {/* STEP 1: CONTACT DETAILS */}
              <div className="checkout-section-card">
                <div className="section-header-title">
                  <span className="step-num">1</span>
                  <h3>Contact Information</h3>
                </div>
                <div className="form-grid-2">
                  <div className="form-field full">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: SHIPPING ADDRESS */}
              <div className="checkout-section-card">
                <div className="section-header-title">
                  <span className="step-num">2</span>
                  <h3>Delivery Shipping Address</h3>
                </div>
                <div className="form-grid-2">
                  <div className="form-field full">
                    <label>Flat / Building / Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Pincode</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="VELORA-form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Country</label>
                    <input
                      type="text"
                      disabled
                      value="India"
                      className="VELORA-form-input disabled"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: PAYMENT METHOD */}
              <div className="checkout-section-card">
                <div className="section-header-title">
                  <span className="step-num">3</span>
                  <h3>Select Payment Method</h3>
                </div>
                <div className="payment-options-grid">
                  <label className={`payment-option-card ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />
                    <div className="payment-option-content">
                      <QrCode size={20} className="pay-icon" />
                      <div>
                        <span className="pay-name">Instant UPI / QR</span>
                        <span className="pay-sub">Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option-card ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                    />
                    <div className="payment-option-content">
                      <CreditCard size={20} className="pay-icon" />
                      <div>
                        <span className="pay-name">Credit / Debit Card</span>
                        <span className="pay-sub">Visa, Mastercard, RuPay, Amex</span>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-option-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div className="payment-option-content">
                      <Truck size={20} className="pay-icon" />
                      <div>
                        <span className="pay-name">Cash on Delivery (COD)</span>
                        <span className="pay-sub">Pay cash at time of doorstep delivery</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT SUMMARY COLUMN */}
            <div className="checkout-summary-column">
              <div className="checkout-summary-card">
                <h3 className="summary-title">ORDER SUMMARY</h3>

                {/* ITEMS LIST */}
                <div className="summary-items-list">
                  {cartItems.map(({ product, quantity }) => {
                    const price = Number(product.unitPrice);
                    return (
                      <div key={product.id} className="mini-item-row">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'}
                          alt={product.name}
                        />
                        <div className="mini-item-info">
                          <span className="mini-item-title">{product.name}</span>
                          <span className="mini-item-qty">Qty: {quantity}</span>
                        </div>
                        <span className="mini-item-price">₹{(price * quantity).toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>

                {/* TOTALS */}
                <div className="summary-breakdown">
                  <div className="row">
                    <span>Bag Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="row">
                    <span>Shipping Fee</span>
                    {shipping === 0 ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                    ) : (
                      <span>₹{shipping}</span>
                    )}
                  </div>
                  <div className="row grand-total">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-VELORA-primary place-order-btn"
                >
                  <CheckCircle2 size={18} />
                  <span>{submitting ? 'PLACING ORDER...' : 'PLACE ORDER'}</span>
                </button>

                <div className="checkout-trust-note">
                  <Lock size={14} /> Encrypted Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

