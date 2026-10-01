import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Plus, Search, Edit2, Trash2, X, RefreshCw, Building2 } from 'lucide-react';
import { warehouseApi } from '../../services/warehouseApi';
import type { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../../types/warehouse';

export const AdminWarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Inputs
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number>(50000);
  const [active, setActive] = useState<boolean>(true);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await warehouseApi.getAllWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      console.error('Failed to load warehouses:', err);
      setError(err.message || 'Failed to fetch warehouses from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const openCreateModal = () => {
    setEditingWarehouse(null);
    setCode(`WH-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setLocation('');
    setCapacity(50000);
    setActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (w: Warehouse) => {
    setEditingWarehouse(w);
    setCode(w.code);
    setName(w.name);
    setLocation(w.location);
    setCapacity(w.capacity);
    setActive(w.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);

      if (editingWarehouse) {
        const updateReq: UpdateWarehouseRequest = {
          name,
          location,
          capacity: Number(capacity),
          active,
        };
        await warehouseApi.updateWarehouse(editingWarehouse.id, updateReq);
      } else {
        const createReq: CreateWarehouseRequest = {
          code,
          name,
          location,
          capacity: Number(capacity),
          active,
        };
        await warehouseApi.createWarehouse(createReq);
      }

      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      console.error('Warehouse save failure:', err);
      setFormError(err.message || 'Failed to save warehouse in backend');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete warehouse "${code}"?`)) return;

    try {
      await warehouseApi.deleteWarehouse(id);
      fetchWarehouses();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Could not delete warehouse'}`);
    }
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-shell">
      <PageHeader
        title="Multi-Warehouse Infrastructure"
        description="Configure physical warehouse codes, storage capacities, geographical locations, and routing availability"
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
            <Plus size={16} /> Create Warehouse
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

      <div className="table-container">
        <div className="table-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search warehouse code or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <button onClick={fetchWarehouses} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Fetching warehouse infrastructure from backend...</p>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No warehouses match your search query.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Warehouse Name</th>
                <th>Location</th>
                <th>Max Capacity</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map((w) => (
                <tr key={w.id}>
                  <td><code>{w.code}</code></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} style={{ color: 'var(--accent-indigo)' }} />
                    {w.name}
                  </td>
                  <td>{w.location}</td>
                  <td style={{ fontWeight: 700 }}>{w.capacity ? w.capacity.toLocaleString() : 'N/A'} units</td>
                  <td>
                    {w.active ? (
                      <span className="badge badge-emerald">Active Center</span>
                    ) : (
                      <span className="badge badge-rose">Inactive</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(w)}
                        style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                        title="Edit Warehouse"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id, w.code)}
                        style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                        title="Delete Warehouse"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingWarehouse ? 'Edit Warehouse Location' : 'Register New Warehouse'}
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

                <div className="form-group">
                  <label className="form-label">Warehouse Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingWarehouse}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. North Distribution Center"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Geographical Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Chicago, IL"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Storage Capacity (Units)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="wh-active-check"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="wh-active-check" className="form-label" style={{ cursor: 'pointer' }}>
                    Active Fulfillment Routing Center
                  </label>
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
                  {formSubmitting ? 'Saving...' : editingWarehouse ? 'Update Warehouse' : 'Register Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
