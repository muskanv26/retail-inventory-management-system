import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Plus, Search, Eye, RefreshCw, ShoppingCart, Truck, X } from 'lucide-react';
import { orderApi } from '../../services/orderApi';
import { productApi } from '../../services/productApi';
import { warehouseApi } from '../../services/warehouseApi';
import { supplierApi } from '../../services/supplierApi';
import type { OrderResponse, OrderStatus, OrderType, CreateOrderRequest } from '../../types/order';
import type { Product } from '../../types/product';
import type { Warehouse } from '../../types/warehouse';
import type { Supplier } from '../../types/supplier';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  // Create Purchase Order Modal State
  const [isPoModalOpen, setIsPoModalOpen] = useState<boolean>(false);
  const [poWarehouseCode, setPoWarehouseCode] = useState<string>('');
  const [poSupplierCode, setPoSupplierCode] = useState<string>('');
  const [poProductId, setPoProductId] = useState<string>('');
  const [poQuantity, setPoQuantity] = useState<number>(50);
  const [poUnitPrice, setPoUnitPrice] = useState<number>(15.0);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const statusParam = selectedStatus !== 'ALL' ? (selectedStatus as OrderStatus) : undefined;
      const typeParam = selectedType !== 'ALL' ? (selectedType as OrderType) : undefined;

      const [ords, prods, whs, sups] = await Promise.all([
        orderApi.getAllOrders(statusParam, typeParam),
        productApi.getAllProducts(),
        warehouseApi.getAllWarehouses(),
        supplierApi.getAllSuppliers(),
      ]);

      setOrders(ords);
      setProducts(prods);
      setWarehouses(whs);
      setSuppliers(sups);

      if (whs.length > 0) setPoWarehouseCode(whs[0].code);
      if (sups.length > 0) setPoSupplierCode(sups[0].code);
      if (prods.length > 0) {
        setPoProductId(prods[0].id);
        setPoUnitPrice(prods[0].unitPrice);
      }
    } catch (err: any) {
      console.error('Failed to load admin orders:', err);
      setError(err.message || 'Failed to fetch order records from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedType, selectedStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await orderApi.updateOrderStatus(orderId, { status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(`Failed to update order status: ${err.message || 'Error occurred'}`);
    }
  };

  const handleCreatePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);

      const poOrderNumber = `ORD-PURCH-${Math.floor(100000 + Math.random() * 900000)}`;

      const request: CreateOrderRequest = {
        orderNumber: poOrderNumber,
        type: 'PURCHASE',
        warehouseCode: poWarehouseCode,
        supplierCode: poSupplierCode,
        items: [
          {
            productId: poProductId,
            quantity: Number(poQuantity),
            unitPrice: Number(poUnitPrice),
          },
        ],
      };

      await orderApi.createOrder(request);
      setIsPoModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      console.error('Purchase order creation error:', err);
      setFormError(err.message || 'Failed to create purchase order in backend');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.warehouseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.supplierCode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-shell">
      <PageHeader
        title="Order Management & Fulfillment"
        description="Monitor SALES and PURCHASE orders, inspect order items, and trigger status updates"
        action={
          <button
            onClick={() => setIsPoModalOpen(true)}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <Plus size={16} /> Create Purchase Order
          </button>
        }
      />

      {error && (
        <div className="error-banner">
          <div>
            <div className="error-title">Backend API Error</div>
            <div className="error-message">{error}</div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="table-container">
        <div className="table-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
              >
                <option value="ALL">All Types</option>
                <option value="SALES">SALES Orders</option>
                <option value="PURCHASE">PURCHASE Orders</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <button onClick={fetchOrders} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading orders from backend...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders match your filter criteria.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Type</th>
                <th>Status</th>
                <th>Warehouse</th>
                <th>Supplier</th>
                <th>Total Amount</th>
                <th>Items Count</th>
                <th>Status Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td><code>{o.orderNumber}</code></td>
                  <td>
                    {o.type === 'SALES' ? (
                      <span className="badge badge-emerald">
                        <ShoppingCart size={12} /> SALES
                      </span>
                    ) : (
                      <span className="badge badge-indigo">
                        <Truck size={12} /> PURCHASE
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === 'COMPLETED'
                          ? 'badge-emerald'
                          : o.status === 'CANCELLED'
                          ? 'badge-rose'
                          : 'badge-amber'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td><code>{o.warehouseCode}</code></td>
                  <td>{o.supplierCode ? <code>{o.supplierCode}</code> : <span style={{ color: 'var(--text-muted)' }}>N/A (Sales)</span>}</td>
                  <td style={{ fontWeight: 800, color: '#34d399' }}>${Number(o.totalAmount).toFixed(2)}</td>
                  <td>{o.items ? o.items.length : 0} items</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                      className="form-select"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(o)}
                      style={{ padding: '0.35rem', color: 'var(--accent-primary)' }}
                      title="Inspect Order Items"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* INSPECT ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Order Breakdown: <code>{selectedOrder.orderNumber}</code>
              </h3>
              <button onClick={() => setSelectedOrder(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                <div>Type: <strong>{selectedOrder.type}</strong></div>
                <div>Status: <strong>{selectedOrder.status}</strong></div>
                <div>Warehouse: <code>{selectedOrder.warehouseCode}</code></div>
                <div>Supplier: {selectedOrder.supplierCode ? <code>{selectedOrder.supplierCode}</code> : 'N/A'}</div>
                <div>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div>Total: <strong style={{ color: '#34d399' }}>${Number(selectedOrder.totalAmount).toFixed(2)}</strong></div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '1rem' }}>
                Order Items ({selectedOrder.items.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.productName}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        SKU: {item.productSku}
                      </div>
                    </div>
                    <div>
                      {item.quantity} x ${Number(item.unitPrice).toFixed(2)} = <strong>${Number(item.totalPrice).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', color: 'white' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {isPoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Inbound Purchase Order (Procurement)</h3>
              <button onClick={() => setIsPoModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="error-banner">
                    <div className="error-message">{formError}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Select Destination Warehouse</label>
                  <select
                    value={poWarehouseCode}
                    onChange={(e) => setPoWarehouseCode(e.target.value)}
                    className="form-select"
                    required
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.code}>{w.code} ({w.name})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Vendor Supplier</label>
                  <select
                    value={poSupplierCode}
                    onChange={(e) => setPoSupplierCode(e.target.value)}
                    className="form-select"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.code}>{s.code} ({s.name})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Product SKU</label>
                  <select
                    value={poProductId}
                    onChange={(e) => {
                      setPoProductId(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) setPoUnitPrice(prod.unitPrice);
                    }}
                    className="form-select"
                    required
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purchase Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(parseFloat(e.target.value) || 0.01)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {formSubmitting ? 'Creating PO...' : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
