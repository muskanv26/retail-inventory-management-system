import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw, ChevronRight, Package, Truck } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import type { OrderResponse, OrderStatus } from '../../types/order';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrders(undefined, 'SALES');
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load customer orders:', err);
      setError('Unable to fetch order history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCustomerStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Order Confirmed', badgeClass: 'badge-confirmed', icon: <CheckCircle2 size={13} /> };
      case 'PROCESSING':
        return { label: 'Preparing Your Order', badgeClass: 'badge-preparing', icon: <Package size={13} /> };
      case 'COMPLETED':
        return { label: 'Delivered', badgeClass: 'badge-delivered', icon: <Truck size={13} /> };
      case 'CANCELLED':
        return { label: 'Cancelled', badgeClass: 'badge-cancelled', icon: <XCircle size={13} /> };
      default:
        return { label: status, badgeClass: 'badge-default', icon: <Clock size={13} /> };
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'CONFIRMED') return ord.status === 'PENDING' || ord.status === 'PROCESSING';
    if (selectedTab === 'DELIVERED') return ord.status === 'COMPLETED';
    if (selectedTab === 'CANCELLED') return ord.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="VELORA-orders-page">
      <div className="orders-header-row">
        <div>
          <h1 className="orders-page-title">MY ORDERS</h1>
          <p className="orders-page-subtitle">Track shipping status &amp; review your previous orders</p>
        </div>
        <button onClick={fetchOrders} className="refresh-orders-btn" title="Refresh Orders">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="orders-filter-tabs">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'CONFIRMED', label: 'Active & In Transit' },
          { key: 'DELIVERED', label: 'Delivered' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`orders-tab-btn ${selectedTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="VELORA-loading-container">
          <div className="VELORA-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--store-text-muted)', fontSize: '0.9rem' }}>
            Fetching order history...
          </p>
        </div>
      ) : error ? (
        <div className="fashion-error-box">
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn-VELORA-primary" style={{ marginTop: '1rem' }}>RETRY</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="fashion-empty-box">
          <ShoppingBag size={48} style={{ color: 'var(--store-text-muted)', marginBottom: '1rem' }} />
          <h3>No orders found</h3>
          <p>You haven&apos;t placed any orders in this status yet.</p>
          <Link to="/shop" className="btn-VELORA-primary" style={{ marginTop: '1.5rem' }}>START SHOPPING</Link>
        </div>
      ) : (
        <div className="orders-list-container">
          {filteredOrders.map((ord) => {
            const statusInfo = getCustomerStatusLabel(ord.status);
            const formattedDate = new Date(ord.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div key={ord.id} className="fashion-order-card">
                <div className="card-top-row">
                  <div>
                    <span className="order-ref-label">ORDER #{ord.orderNumber}</span>
                    <span className="order-date-label">Placed on {formattedDate}</span>
                  </div>

                  <div className={`customer-status-badge ${statusInfo.badgeClass}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                </div>

                <div className="card-middle-row">
                  <div className="order-items-summary">
                    <span>{ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} in this shipment</span>
                  </div>

                  <div className="order-total-price">
                    <span className="label">TOTAL</span>
                    <strong className="amount">₹{Number(ord.totalAmount).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="card-bottom-row">
                  <Link to={`/orders/${ord.id}`} className="btn-view-order-detail">
                    <span>VIEW ORDER DETAILS &amp; RECEIPT</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

