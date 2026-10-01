import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Plus, Search, Edit2, Trash2, X, RefreshCw, Truck } from 'lucide-react';
import { supplierApi } from '../../services/supplierApi';
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../../types/supplier';

export const AdminSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [active, setActive] = useState<boolean>(true);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.getAllSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      console.error('Failed to load suppliers:', err);
      setError(err.message || 'Failed to fetch suppliers from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setCode(`SUP-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setCode(s.code);
    setName(s.name);
    setContactName(s.contactName);
    setEmail(s.email);
    setPhone(s.phone);
    setAddress(s.address);
    setActive(s.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);

      if (editingSupplier) {
        const updateReq: UpdateSupplierRequest = {
          name,
          contactName,
          email,
          phone,
          address,
          active,
        };
        await supplierApi.updateSupplier(editingSupplier.id, updateReq);
      } else {
        const createReq: CreateSupplierRequest = {
          code,
          name,
          contactName,
          email,
          phone,
          address,
          active,
        };
        await supplierApi.createSupplier(createReq);
      }

      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      console.error('Supplier save error:', err);
      setFormError(err.message || 'Failed to save supplier in backend');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${code}"?`)) return;

    try {
      await supplierApi.deleteSupplier(id);
      fetchSuppliers();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Could not delete supplier'}`);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-shell">
      <PageHeader
        title="Supplier Procurement Directory"
        description="Manage vendor supplier relationships, procurement contact information, and purchase order source routing"
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
            <Plus size={16} /> Add Supplier
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
                placeholder="Search supplier code, name, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <button onClick={fetchSuppliers} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Fetching supplier directory from backend...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No suppliers match your search query.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Supplier Name</th>
                <th>Contact Representative</th>
                <th>Email / Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.id}>
                  <td><code>{s.code}</code></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={16} style={{ color: 'var(--accent-amber)' }} />
                    {s.name}
                  </td>
                  <td>{s.contactName}</td>
                  <td>
                    <div>{s.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.phone}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{s.address}</td>
                  <td>
                    {s.active ? (
                      <span className="badge badge-emerald">Active</span>
                    ) : (
                      <span className="badge badge-rose">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(s)}
                        style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                        title="Edit Supplier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.code)}
                        style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                        title="Delete Supplier"
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
                {editingSupplier ? 'Edit Supplier Details' : 'Register New Vendor Supplier'}
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
                  <label className="form-label">Supplier Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingSupplier}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Apex Global Electronics Corp"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Robert Vance"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="sup-active-check"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="sup-active-check" className="form-label" style={{ cursor: 'pointer' }}>
                    Active Vendor Supplier Status
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
                  {formSubmitting ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
