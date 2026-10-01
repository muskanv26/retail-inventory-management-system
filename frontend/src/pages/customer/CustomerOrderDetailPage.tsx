import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, XCircle, Package, Calendar } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import type { OrderResponse, OrderStatus } from '../../types/order';

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (err: any) {
        console.error('Failed to load order details:', err);
        setError('Requested order details could not be found.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="VALERUNE-loading-container" style={{ minHeight: '60vh' }}>
        <div className="VALERUNE-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--store-text-muted)', fontSize: '0.9rem' }}>
          Retrieving order details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--store-text-secondary)', margin: '1rem 0 2rem' }}>{error}</p>
        <Link to="/orders" className="btn-VALERUNE-primary">Back to My Orders</Link>
      </div>
    );
  }

  const getCustomerStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Order Confirmed', badgeClass: 'badge-confirmed', icon: <CheckCircle2 size={15} /> };
      case 'PROCESSING':
        return { label: 'Preparing Order', badgeClass: 'badge-preparing', icon: <Package size={15} /> };
      case 'COMPLETED':
        return { label: 'Delivered', badgeClass: 'badge-delivered', icon: <Truck size={15} /> };
      case 'CANCELLED':
        return { label: 'Cancelled', badgeClass: 'badge-cancelled', icon: <XCircle size={15} /> };
      default:
        return { label: status, badgeClass: 'badge-default', icon: <Clock size={15} /> };
    }
  };

  const statusInfo = getCustomerStatusInfo(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="VALERUNE-order-detail-page">
      <Link to="/orders" className="return-cart-link" style={{ maxWidth: '960px', margin: '0 auto 2rem' }}>
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="order-detail-card">
        {/* HEADER */}
        <div className="detail-header-flex">
          <div>
            <span className="order-label">PURCHASE RECEIPT &amp; INVOICE</span>
            <h1 className="order-number-title">Order #{order.orderNumber}</h1>
            <span className="order-date-text">
              <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Placed on {formattedDate}
            </span>
          </div>

          <div className={`customer-status-badge ${statusInfo.badgeClass}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="order-items-section">
          <h3 className="section-title">Order Items ({order.items.length})</h3>
          <div className="items-table">
            {order.items.map((item) => {
              const price = Number(item.unitPrice);
              const total = Number(item.totalPrice);
              return (
                <div key={item.id} className="table-item-row">
                  <div className="item-meta">
                    <span className="item-name">{item.productName || 'VALERUNE Item'}</span>
                    <span className="item-sku">SKU Ref: {item.productSku}</span>
                  </div>

                  <div className="item-pricing">
                    <span className="unit-calc">{item.quantity} x ₹{price.toLocaleString('en-IN')}</span>
                    <strong className="line-total">₹{total.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER SUMMARY TOTALS */}
        <div className="order-totals-section">
          <div className="total-row">
            <span>Items Subtotal</span>
            <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="total-row">
            <span>Express Shipping</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
          </div>
          <div className="total-row final-grand-total">
            <span>Total Paid</span>
            <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


