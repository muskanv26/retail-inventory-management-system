import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Plus, Search, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { productApi } from '../../services/productApi';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../../types/product';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form inputs
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to fetch products from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setSku(`PROD-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setCategory('ELECTRONICS');
    setUnitPrice(29.99);
    setActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category);
    setUnitPrice(p.unitPrice);
    setActive(p.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setFormError(null);

      if (editingProduct) {
        const updateReq: UpdateProductRequest = {
          name,
          description,
          category,
          unitPrice: Number(unitPrice),
          active,
        };
        await productApi.updateProduct(editingProduct.id, updateReq);
      } else {
        const createReq: CreateProductRequest = {
          sku,
          name,
          description,
          category,
          unitPrice: Number(unitPrice),
          active,
        };
        await productApi.createProduct(createReq);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Product save error:', err);
      setFormError(err.message || 'Failed to save product in backend');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await productApi.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Could not delete product'}`);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-shell">
      <PageHeader
        title="Product Catalog Management"
        description="Maintain product definitions, SKUs, category classifications, and pricing contracts"
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
            <Plus size={16} /> Create Product
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

      {/* FILTER SEARCH BAR */}
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
                placeholder="Search products by SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredProducts.length} items
            </span>
            <button
              onClick={fetchProducts}
              style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Fetching products from backend...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No products match your search query.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td><code>{p.sku}</code></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                  <td>
                    <span className="badge badge-indigo">{p.category}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#34d399' }}>${Number(p.unitPrice).toFixed(2)}</td>
                  <td>
                    {p.active ? (
                      <span className="badge badge-emerald">Active</span>
                    ) : (
                      <span className="badge badge-rose">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                        title="Delete Product"
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
                {editingProduct ? 'Edit Product Definition' : 'Create New Product'}
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
                  <label className="form-label">SKU Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                    placeholder="e.g. ELECTRONICS, APPAREL, HOME"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="active-check"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="active-check" className="form-label" style={{ cursor: 'pointer' }}>
                    Active Product Catalog Status
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
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
