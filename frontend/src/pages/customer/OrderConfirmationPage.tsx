import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Truck, Calendar, MapPin } from 'lucide-react';
import type { OrderResponse } from '../../types/order';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();

  const stateOrder = location.state?.order as OrderResponse | undefined;
  const customerName = location.state?.customerName || 'Valued Customer';
  const address = location.state?.address || 'Your Delivery Address';
  const city = location.state?.city || '';

  // Expected delivery date: +3 days from today
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="VALERUNE-confirmation-page">
      <div className="confirmation-card">
        {/* CELEBRATION ICON */}
        <div className="confirmation-icon-wrapper">
          <CheckCircle2 size={56} />
        </div>

        <span className="confirmation-tag">ORDER CONFIRMED</span>
        <h1 className="confirmation-title">Thank You For Your Order</h1>
        <p className="confirmation-subtitle">
          We&apos;ve received your order and our regional hub is preparing your items for dispatch.
        </p>

        {/* ORDER NUMBER & DELIVERY ESTIMATE */}
        <div className="confirmation-details-box">
          <div className="detail-stat">
            <span className="label">Order Reference</span>
            <strong className="order-num-text">{orderNumber || stateOrder?.orderNumber || 'ORD-SALES-882910'}</strong>
          </div>

          <div className="detail-stat">
            <span className="label"><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Expected Delivery</span>
            <strong style={{ color: '#059669' }}>{formattedDeliveryDate}</strong>
          </div>

          <div className="detail-stat">
            <span className="label"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Shipping To</span>
            <strong>{customerName} — {address}{city ? `, ${city}` : ''}</strong>
          </div>
        </div>

        {/* ITEMS PREVIEW IF AVAILABLE */}
        {stateOrder && stateOrder.items.length > 0 && (
          <div className="confirmation-items-box">
            <h4 className="box-title">Order Items ({stateOrder.items.length})</h4>
            <div className="items-list">
              {stateOrder.items.map((item) => (
                <div key={item.id} className="confirm-item-row">
                  <span>SKU Ref: {item.productId.substring(0, 8)}...</span>
                  <span>Qty: {item.quantity}</span>
                  <strong>₹{Number(item.totalPrice).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
            <div className="confirm-total-row">
              <span>Total Amount Paid</span>
              <strong>₹{Number(stateOrder.totalAmount).toLocaleString('en-IN')}</strong>
            </div>
          </div>
        )}

        {/* CTAS */}
        <div className="confirmation-actions">
          <Link to="/orders" className="btn-VALERUNE-primary">
            <Truck size={16} />
            <span>TRACK MY ORDERS</span>
          </Link>

          <Link to="/shop" className="btn-VALERUNE-outline">
            <span>CONTINUE SHOPPING</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};


