import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { inventoryApi } from '../../services/inventoryApi';
import type { Product } from '../../types/product';
import { ProductCard } from '../../components/customer/ProductCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state from URL query or local state
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);

    const s = searchParams.get('search');
    if (s) setSearchQuery(s);
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodsData, invData] = await Promise.all([
        productApi.getAllProducts(),
        inventoryApi.getAllInventory(),
      ]);

      setProducts(prodsData);

      const map: Record<string, number> = {};
      invData.forEach((inv) => {
        map[inv.productId] = (map[inv.productId] || 0) + (inv.quantityAvailable ?? 0);
      });
      setStockMap(map);
    } catch (err: any) {
      console.error('Failed to load shop catalog:', err);
      setError('Failed to retrieve catalog items. Please check backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesGender =
          selectedGender === 'ALL' ||
          !p.gender ||
          p.gender.toLowerCase() === selectedGender.toLowerCase() ||
          p.gender.toLowerCase() === 'unisex';

        let matchesPrice = true;
        const price = Number(p.unitPrice);
        if (selectedPriceRange === 'under-2000') matchesPrice = price < 2000;
        else if (selectedPriceRange === '2000-4000') matchesPrice = price >= 2000 && price <= 4000;
        else if (selectedPriceRange === 'above-4000') matchesPrice = price > 4000;

        const available = stockMap[p.id] ?? 0;
        const matchesStock = !inStockOnly || available > 0;

        return matchesSearch && matchesCategory && matchesGender && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.unitPrice) - Number(b.unitPrice);
        if (sortBy === 'price-desc') return Number(b.unitPrice) - Number(a.unitPrice);
        if (sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
        return 0; // recommended / default
      });
  }, [products, stockMap, searchQuery, selectedCategory, selectedGender, selectedPriceRange, inStockOnly, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedGender('ALL');
    setSelectedPriceRange('ALL');
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="VALERUNE-shop-page">
      {/* BREADCRUMB */}
      <div className="shop-breadcrumb">
        <Link to="/">HOME</Link>
        <span>/</span>
        <span className="current">SHOP CATALOG</span>
      </div>

      {/* HEADER BAR */}
      <div className="shop-header-title-bar">
        <div>
          <h1 className="shop-title">
            {selectedCategory !== 'ALL' ? selectedCategory : 'All Products'}
          </h1>
          <p className="shop-subtitle">
            Showing {processedProducts.length} curated inventory items
          </p>
        </div>

        <div className="shop-top-actions">
          {/* SEARCH INPUT */}
          <div className="shop-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search products, SKUs, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                <X size={14} />
              </button>
            )}
          </div>

          {/* SORT DROPDOWN */}
          <div className="shop-sort-box">
            <span className="sort-label">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="shop-sort-select"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {/* MOBILE FILTER TOGGLE */}
          <button onClick={() => setFilterDrawerOpen(true)} className="mobile-filter-btn">
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT: SIDEBAR + GRID */}
      <div className="shop-layout">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="shop-sidebar-filters">
          <div className="sidebar-filter-header">
            <h3>FILTERS</h3>
            {(selectedCategory !== 'ALL' || selectedGender !== 'ALL' || selectedPriceRange !== 'ALL' || searchQuery || inStockOnly) && (
              <button onClick={handleClearFilters} className="clear-all-link">
                Clear All
              </button>
            )}
          </div>

          {/* CATEGORIES */}
          <div className="filter-group">
            <h4 className="filter-group-title">Category</h4>
            <div className="filter-options">
              {categories.map((cat) => (
                <label key={cat} className={`filter-radio-label ${selectedCategory === cat ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* GENDER */}
          <div className="filter-group">
            <h4 className="filter-group-title">Gender / Fit</h4>
            <div className="filter-options">
              {['ALL', 'Women', 'Men', 'Unisex'].map((g) => (
                <label key={g} className={`filter-radio-label ${selectedGender === g ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    checked={selectedGender === g}
                    onChange={() => setSelectedGender(g)}
                  />
                  <span>{g === 'ALL' ? 'All Fits' : g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* PRICE RANGE */}
          <div className="filter-group">
            <h4 className="filter-group-title">Price Range</h4>
            <div className="filter-options">
              {[
                { label: 'All Prices', value: 'ALL' },
                { label: 'Under ₹1,999', value: 'under-2000' },
                { label: '₹2,000 - ₹4,000', value: '2000-4000' },
                { label: 'Above ₹4,000', value: 'above-4000' },
              ].map((p) => (
                <label key={p.value} className={`filter-radio-label ${selectedPriceRange === p.value ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPriceRange === p.value}
                    onChange={() => setSelectedPriceRange(p.value)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* IN STOCK TOGGLE */}
          <div className="filter-group">
            <label className="checkbox-filter-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* PRODUCTS GRID AREA */}
        <main className="shop-products-main">
          {loading ? (
            <div className="fashion-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="fashion-skeleton-card"></div>
              ))}
            </div>
          ) : error ? (
            <div className="fashion-error-box">
              <p>{error}</p>
              <button onClick={fetchData} className="btn-VALERUNE-primary" style={{ marginTop: '1rem' }}>
                <RefreshCw size={14} style={{ marginRight: '6px' }} /> Retry Loading
              </button>
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="fashion-empty-box">
              <h3>No items found</h3>
              <p>We couldn&apos;t find any products matching your selected filters or search terms.</p>
              <button onClick={handleClearFilters} className="btn-VALERUNE-primary" style={{ marginTop: '1rem' }}>
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {processedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  availableStock={stockMap[product.id]}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {filterDrawerOpen && (
        <div className="mobile-filter-modal-backdrop" onClick={() => setFilterDrawerOpen(false)}>
          <div className="mobile-filter-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>Filters</h3>
              <button onClick={() => setFilterDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="mobile-drawer-body">
              {/* Category pills */}
              <div className="drawer-section">
                <h4>Category</h4>
                <div className="drawer-pills">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`drawer-pill ${selectedCategory === c ? 'active' : ''}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mobile-drawer-footer">
              <button onClick={handleClearFilters} className="btn-VALERUNE-outline" style={{ flex: 1 }}>Reset</button>
              <button onClick={() => setFilterDrawerOpen(false)} className="btn-VALERUNE-primary" style={{ flex: 1 }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


