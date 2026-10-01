import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { stockMovementApi } from '../../services/stockMovementApi';
import { warehouseApi } from '../../services/warehouseApi';
import type { StockMovementResponse, StockMovementType } from '../../types/stockMovement';
import type { Warehouse } from '../../types/warehouse';

export const AdminStockMovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovementResponse[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);

      const warehouseParam = selectedWarehouse !== 'ALL' ? selectedWarehouse : undefined;

      const [movsData, whsData] = await Promise.all([
        stockMovementApi.getStockMovements(undefined, undefined, warehouseParam),
        warehouseApi.getAllWarehouses(),
      ]);

      setMovements(movsData);
      setWarehouses(whsData);
    } catch (err: any) {
      console.error('Failed to load stock movements:', err);
      setError(err.message || 'Failed to fetch stock movements audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [selectedWarehouse]);

  const getMovementBadge = (type: StockMovementType) => {
    switch (type) {
      case 'INBOUND':
        return <span className="badge badge-emerald">INBOUND (+)</span>;
      case 'OUTBOUND':
        return <span className="badge badge-rose">OUTBOUND (-)</span>;
      case 'ADJUSTMENT':
        return <span className="badge badge-amber">ADJUSTMENT</span>;
      case 'RESERVED':
        return <span className="badge badge-indigo">RESERVED</span>;
      case 'RELEASED':
        return <span className="badge badge-slate">RELEASED</span>;
      default:
        return <span className="badge badge-indigo">{type}</span>;
    }
  };

  const filteredMovements = movements.filter((sm) => {
    const matchesType = selectedType === 'ALL' || sm.type === selectedType;
    const matchesSearch =
      sm.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sm.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sm.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sm.reason || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="page-shell">
      <PageHeader
        title="Stock Movement Audit Log"
        description="Immutable audit trail generated automatically by Spring Boot transactional services during inventory adjustments and order fulfillments"
      />

      {/* ENTERPRISE AUDIT BANNER */}
      <div
        style={{
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#818cf8',
        }}
      >
        <ShieldCheck size={24} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
          <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#c7d2fe', fontSize: '0.95rem' }}>
            Immutable Transactional Audit Engine
          </strong>
          Every stock receipt, sales order reservation, fulfillment, and manual adjustment is recorded atomically with reference numbers and timestamp audit signatures in PostgreSQL.
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div>
            <div className="error-title">Backend API Error</div>
            <div className="error-message">{error}</div>
          </div>
        </div>
      )}

      {/* FILTER SEARCH BAR */}
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
                placeholder="Search SKU, product, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Warehouse:</span>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.code}>{w.code} ({w.name})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Movement Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 0.85rem' }}
              >
                <option value="ALL">All Movement Types</option>
                <option value="INBOUND">INBOUND</option>
                <option value="OUTBOUND">OUTBOUND</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
                <option value="RESERVED">RESERVED</option>
                <option value="RELEASED">RELEASED</option>
              </select>
            </div>
          </div>

          <button onClick={fetchMovements} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Fetching stock movement records from backend database...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No stock movement records match specified criteria.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Movement Type</th>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Warehouse</th>
                <th>Quantity</th>
                <th>Reference #</th>
                <th>Reason / Transaction Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((sm) => (
                <tr key={sm.id}>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(sm.timestamp).toLocaleString()}</td>
                  <td>{getMovementBadge(sm.type)}</td>
                  <td><code>{sm.productSku}</code></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sm.productName}</td>
                  <td><code>{sm.warehouseCode}</code></td>
                  <td style={{ fontWeight: 700, color: sm.quantity > 0 ? '#34d399' : sm.quantity < 0 ? '#f87171' : '#cbd5e1' }}>
                    {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity}
                  </td>
                  <td><code>{sm.referenceNumber || 'N/A'}</code></td>
                  <td style={{ fontSize: '0.85rem' }}>{sm.reason || 'Standard system transaction'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
