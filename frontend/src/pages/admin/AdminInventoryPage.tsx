import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Plus, Search, Edit2, Sliders, X, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { inventoryApi } from '../../services/inventoryApi';
import { productApi } from '../../services/productApi';
import { warehouseApi } from '../../services/warehouseApi';
import { stockMovementApi } from '../../services/stockMovementApi';
import type { Inventory, CreateInventoryRequest, UpdateInventoryRequest } from '../../types/inventory';
import type { Product } from '../../types/product';
import type { Warehouse } from '../../types/warehouse';

export const AdminInventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inventory Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [productId, setProductId] = useState<string>('');
  const [warehouseCode, setWarehouseCode] = useState<string>('');
  const [quantityOnHand, setQuantityOnHand] = useState<number>(100);
  const [quantityReserved, setQuantityReserved] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(10);

  // Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [adjustInventory, setAdjustInventory] = useState<Inventory | null>(null);
  const [qtyAdjustment, setQtyAdjustment] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invs, prods, whs] = await Promise.all([
        inventoryApi.getAllInventory(),
        productApi.getAllProducts(),
        warehouseApi.getAllWarehouses(),
      ]);
      setInventories(invs);
      setProducts(prods);
      setWarehouses(whs);

      if (prods.length > 0) setProductId(prods[0].id);
      if (whs.length > 0) setWarehouseCode(whs[0].code);
    } catch (err: any) {
      console.error('Failed to load inventory data:', err);
      setError(err.message || 'Failed to fetch inventory from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingInventory(null);
    setQuantityOnHand(100);
    setQuantityReserved(0);
    setReorderLevel(15);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (inv: Inventory) => {
    setEditingInventory(inv);
    setProductId(inv.productId);
    setWarehouseCode(inv.warehouseCode);
    setQuantityOnHand(inv.quantityOnHand);
    setQuantityReserved(inv.quantityReserved);
    setReorderLevel(inv.reorderLevel);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openAdjustModal = (inv: Inventory) => {
    setAdjustInventory(inv);
    setQtyAdjustment(10);
    setAdjustReason('Physical stock count adjustment');
    setFormError(null);
    setIsAdjustModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);

      if (editingInventory) {
        const updateReq: UpdateInventoryRequest = {
          quantityOnHand: Number(quantityOnHand),
          quantityReserved: Number(quantityReserved),
          reorderLevel: Number(reorderLevel),
        };
        await inventoryApi.updateInventory(editingInventory.id, updateReq);
      } else {
        const createReq: CreateInventoryRequest = {
          productId,
          warehouseCode,
          quantityOnHand: Number(quantityOnHand),
          quantityReserved: Number(quantityReserved),
          reorderLevel: Number(reorderLevel),
        };
        await inventoryApi.createInventory(createReq);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Inventory save failure:', err);
      setFormError(err.message || 'Failed to save inventory record in backend');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustInventory) return;

    try {
      setFormSubmitting(true);
      setFormError(null);

      await stockMovementApi.adjustStock({
        productId: adjustInventory.productId,
        warehouseCode: adjustInventory.warehouseCode,
        quantityAdjustment: Number(qtyAdjustment),
        reason: adjustReason,
      });

      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Stock adjustment failure:', err);
      setFormError(err.message || 'Failed to trigger stock adjustment in backend');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStockStatusBadge = (inv: Inventory) => {
    const avail = inv.quantityAvailable ?? (inv.quantityOnHand - inv.quantityReserved);
    if (avail <= 0) {
      return (
        <span className="badge badge-rose">
          <XCircle size={13} /> Out of Stock
        </span>
      );
    }
    if (inv.reorderNeeded || avail <= inv.reorderLevel) {
      return (
        <span className="badge badge-amber">
          <AlertTriangle size={13} /> Low Stock ({avail})
        </span>
      );
    }
    return (
      <span className="badge badge-emerald">
        <CheckCircle2 size={13} /> Healthy ({avail})
      </span>
    );
  };

  const filteredInventories = inventories.filter((inv) => {
    const matchesWarehouse =
      selectedWarehouse === 'ALL' || inv.warehouseCode === selectedWarehouse;
    const matchesSearch =
      inv.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.warehouseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWarehouse && matchesSearch;
  });

  return (
    <div className="page-shell">
      <PageHeader
        title="Multi-Warehouse Inventory Stock"
        description="Inspect warehouse stock balances, available quantities, optimistic lock versions, and trigger adjustments"
        action={
          <button
            onClick={openCreateModal}
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
            <Plus size={16} /> Assign Warehouse Stock
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
            <div style={{ position: 'relative', width: '280px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search SKU, Product, or WH..."
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
          </div>

          <button onClick={fetchData} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading warehouse stock balances from backend...</p>
          </div>
        ) : filteredInventories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No inventory records found for specified criteria.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Warehouse</th>
                <th>On Hand</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventories.map((inv) => (
                <tr key={inv.id}>
                  <td><code>{inv.productSku}</code></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.productName}</td>
                  <td><code>{inv.warehouseCode}</code></td>
                  <td style={{ fontWeight: 700 }}>{inv.quantityOnHand}</td>
                  <td style={{ color: 'var(--accent-amber)' }}>{inv.quantityReserved}</td>
                  <td style={{ fontWeight: 800, color: '#34d399' }}>{inv.quantityAvailable}</td>
                  <td>{inv.reorderLevel}</td>
                  <td>{getStockStatusBadge(inv)}</td>
                  <td>
                    <span className="badge badge-slate" title="Optimistic locking version in DB">
                      v{inv.version}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openAdjustModal(inv)}
                        style={{ padding: '0.35rem', color: 'var(--accent-amber)' }}
                        title="Adjust Stock Quantity"
                      >
                        <Sliders size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(inv)}
                        style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                        title="Edit Thresholds"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT INVENTORY MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingInventory ? 'Update Inventory Record' : 'Assign Product Stock to Warehouse'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="error-banner">
                    <div className="error-message">{formError}</div>
                  </div>
                )}

                {!editingInventory && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Select Product</label>
                      <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="form-select"
                        required
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Select Warehouse</label>
                      <select
                        value={warehouseCode}
                        onChange={(e) => setWarehouseCode(e.target.value)}
                        className="form-select"
                        required
                      >
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.code}>{w.code} ({w.name})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Quantity On Hand</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quantityOnHand}
                    onChange={(e) => setQuantityOnHand(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Reserved</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quantityReserved}
                    onChange={(e) => setQuantityReserved(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reorder Alert Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {formSubmitting ? 'Submitting...' : editingInventory ? 'Update Inventory' : 'Assign Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {isAdjustModalOpen && adjustInventory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Trigger Stock Adjustment</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="error-banner">
                    <div className="error-message">{formError}</div>
                  </div>
                )}

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div>Product: <strong>{adjustInventory.productName}</strong> (<code>{adjustInventory.productSku}</code>)</div>
                  <div>Warehouse: <code>{adjustInventory.warehouseCode}</code></div>
                  <div>Current Available: <strong>{adjustInventory.quantityAvailable}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Adjustment (+ / -)</label>
                  <input
                    type="number"
                    required
                    value={qtyAdjustment}
                    onChange={(e) => setQtyAdjustment(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Use positive numbers for addition (+15) and negative numbers for reduction (-10).
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Reason</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Annual stocktake reconciliation"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
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
                    backgroundColor: 'var(--accent-amber)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {formSubmitting ? 'Adjusting...' : 'Record Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
