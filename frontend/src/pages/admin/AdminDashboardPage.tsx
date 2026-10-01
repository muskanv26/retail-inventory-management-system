import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Package, Boxes, ShoppingCart, Building2, ArrowUpRight, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { inventoryApi } from '../../services/inventoryApi';
import { warehouseApi } from '../../services/warehouseApi';
import { orderApi } from '../../services/orderApi';
import { stockMovementApi } from '../../services/stockMovementApi';
import type { Product } from '../../types/product';
import type { Inventory } from '../../types/inventory';
import type { Warehouse } from '../../types/warehouse';
import type { OrderResponse } from '../../types/order';
import type { StockMovementResponse } from '../../types/stockMovement';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [movements, setMovements] = useState<StockMovementResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodsData, invsData, whsData, ordsData, movsData] = await Promise.all([
        productApi.getAllProducts(),
        inventoryApi.getAllInventory(),
        warehouseApi.getAllWarehouses(),
        orderApi.getAllOrders(),
        stockMovementApi.getStockMovements(),
      ]);

      setProducts(prodsData);
      setInventories(invsData);
      setWarehouses(whsData);
      setOrders(ordsData);
      setMovements(movsData);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Failed to fetch operational metrics from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;

  const totalOnHand = inventories.reduce((sum, inv) => sum + (inv.quantityOnHand ?? 0), 0);
  const totalReserved = inventories.reduce((sum, inv) => sum + (inv.quantityReserved ?? 0), 0);
  const totalAvailable = inventories.reduce((sum, inv) => sum + (inv.quantityAvailable ?? 0), 0);

  const activeWarehouses = warehouses.filter((w) => w.active).length;

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const salesOrders = orders.filter((o) => o.type === 'SALES').length;
  const purchaseOrders = orders.filter((o) => o.type === 'PURCHASE').length;

  const lowStockCount = inventories.filter((i) => i.reorderNeeded).length;

  return (
    <div className="page-shell">
      <PageHeader
        title="Operations Dashboard Overview"
        description="Real-time metrics, warehouse inventory balances, active orders, and audit trail synced from PostgreSQL"
        action={
          <button
            onClick={fetchMetrics}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <RefreshCw size={15} /> Refresh Metrics
          </button>
        }
      />

      {error && (
        <div className="error-banner">
          <div>
            <div className="error-title">Dashboard Backend Sync Error</div>
            <div className="error-message">{error}</div>
          </div>
        </div>
      )}

      {/* METRICS GRID */}
      <div className="card-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Product Catalog</span>
            <div style={{ color: 'var(--accent-primary)' }}><Package size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>{loading ? '...' : totalProducts}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
            <ArrowUpRight size={14} /> <span>{activeProducts} active SKUs available</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Total Units On Hand</span>
            <div style={{ color: 'var(--accent-emerald)' }}><Boxes size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>{loading ? '...' : totalOnHand.toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Available: {totalAvailable.toLocaleString()} | Reserved: {totalReserved.toLocaleString()}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Warehouse Network</span>
            <div style={{ color: 'var(--accent-indigo)' }}><Building2 size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>{loading ? '...' : warehouses.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-indigo)' }}>
            {activeWarehouses} active fulfillment centers
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">Pending Orders</span>
            <div style={{ color: 'var(--accent-amber)' }}><ShoppingCart size={20} /></div>
          </div>
          <div className="card-value" style={{ marginTop: '0.5rem' }}>{loading ? '...' : pendingOrders}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-amber)' }}>
            <Clock size={14} /> <span>Sales: {salesOrders} | Purchase: {purchaseOrders}</span>
          </div>
        </div>
      </div>

      {/* LOW STOCK REORDER ALERT BAR */}
      {lowStockCount > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fbbf24',
          }}
        >
          <AlertTriangle size={20} />
          <div style={{ fontSize: '0.9rem' }}>
            <strong>Reorder Alert:</strong> {lowStockCount} inventory record(s) have dropped below their designated reorder threshold.
          </div>
        </div>
      )}

      {/* RECENT STOCK MOVEMENTS TABLE */}
      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="table-title">Recent Stock Movements (Audit Log)</h3>
          <span className="badge badge-indigo">Immutable Audit Engine</span>
        </div>
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading recent stock movements...</p>
          </div>
        ) : movements.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No stock movements recorded yet in backend DB.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Warehouse</th>
                <th>Qty</th>
                <th>Reference</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 8).map((sm) => (
                <tr key={sm.id}>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(sm.timestamp).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        sm.type === 'INBOUND'
                          ? 'badge-emerald'
                          : sm.type === 'OUTBOUND'
                          ? 'badge-rose'
                          : 'badge-amber'
                      }`}
                    >
                      {sm.type}
                    </span>
                  </td>
                  <td><code>{sm.productSku}</code></td>
                  <td style={{ fontWeight: 600 }}>{sm.productName}</td>
                  <td><code>{sm.warehouseCode}</code></td>
                  <td style={{ fontWeight: 700, color: sm.quantity > 0 ? '#34d399' : '#f87171' }}>
                    {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity}
                  </td>
                  <td><code>{sm.referenceNumber || 'N/A'}</code></td>
                  <td style={{ fontSize: '0.85rem' }}>{sm.reason || 'Standard transaction'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
