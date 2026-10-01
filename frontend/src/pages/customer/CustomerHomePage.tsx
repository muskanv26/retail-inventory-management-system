import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { productApi } from '../../services/productApi';
import { inventoryApi } from '../../services/inventoryApi';
import type { Product } from '../../types/product';
import { ProductCard } from '../../components/customer/ProductCard';

export const CustomerHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        console.error('Failed to load products for homepage:', err);
        setError('Unable to load retail catalog. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Category Featured Collection Cards
  const CATEGORY_TILES = [
    {
      title: 'Everyday Wear',
      subtitle: 'Miraweave tops, stretch chinos & soft jersey tees',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      link: '/shop?category=Everyday+Wear',
    },
    {
      title: 'Layering & Knits',
      subtitle: 'Merino crewnecks, fleece zips & brushed flannels',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
      link: '/shop?category=Layering',
    },
    {
      title: 'Travel & Utility',
      subtitle: 'Zephyr anoraks, packable puffers & duffles',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      link: '/shop?category=Travel',
    },
    {
      title: 'Workwear & Tailored',
      subtitle: 'Structured blazers, trench coats & suit trousers',
      image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
      link: '/shop?category=Workwear',
    },
  ];

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="VELORA-homepage">
      {/* HERO CAMPAIGN SECTION */}
      <section className="VELORA-hero-section">
        <div className="hero-backdrop-image">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80"
            alt="VELORA Essential Collection"
            className="hero-bg-img"
          />
          <div className="hero-overlay-gradient"></div>
        </div>

        <div className="hero-content-container">
          <div className="hero-content-box">
            <span className="hero-tag">
              <Sparkles size={14} /> ESSENTIAL COLLECTION 2026
            </span>
            <h1 className="hero-headline">
              BUILT FOR MODERN <br />
              <em>VERSATILITY</em>
            </h1>
            <p className="hero-subheadline">
              Clean silhouettes, durable fabrics, and functional daily apparel designed for elevated living.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/shop" className="btn-VELORA-primary">
                <span>EXPLORE ALL CATALOG</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/shop?new=true" className="btn-VELORA-outline">
                <span>NEW ARRIVALS</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY DISCOVERY SECTION */}
      <section className="VELORA-section">
        <div className="section-header-centered">
          <span className="section-sub">CURATED TAXONOMY</span>
          <h2 className="section-title">Shop by Category</h2>
          <div className="title-gold-accent"></div>
        </div>

        <div className="category-tiles-grid">
          {CATEGORY_TILES.map((tile) => (
            <Link key={tile.title} to={tile.link} className="category-tile-card">
              <div className="tile-img-wrapper">
                <img src={tile.image} alt={tile.title} loading="lazy" />
                <div className="tile-gradient-overlay"></div>
              </div>
              <div className="tile-content">
                <h3 className="tile-title">{tile.title}</h3>
                <p className="tile-subtitle">{tile.subtitle}</p>
                <span className="tile-action">EXPLORE COLLECTION →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="VELORA-section bg-cream-soft">
        <div className="section-header-flex">
          <div>
            <span className="section-sub">RECENT RELEASE</span>
            <h2 className="section-title">Featured Inventory Items</h2>
          </div>
          <Link to="/shop" className="view-all-link">
            <span>VIEW ALL 50 PRODUCTS</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="fashion-skeleton-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="fashion-skeleton-card"></div>
            ))}
          </div>
        ) : error ? (
          <div className="fashion-error-box">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-VELORA-primary" style={{ marginTop: '1rem' }}>
              RETRY
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                availableStock={stockMap[product.id]}
              />
            ))}
          </div>
        )}
      </section>

      {/* EDITORIAL BANNER */}
      <section className="VELORA-editorial-banner">
        <div className="editorial-container">
          <div className="editorial-img-side">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop&q=80"
              alt="VELORA Utility & Accessories"
              loading="lazy"
            />
          </div>
          <div className="editorial-text-side">
            <span className="editorial-label">MATERIALS HIGHLIGHT</span>
            <h2 className="editorial-title">Travel &amp; Carry Essentials</h2>
            <p className="editorial-desc">
              Every tote, duffle, and backpack in the VELORA Elements line uses durable water-repellent canvas, reinforced stitching, and heavy-duty zippers built for long travel durability.
            </p>
            <Link to="/shop?category=Travel" className="btn-VELORA-primary">
              <span>DISCOVER TRAVEL GEAR</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* BEST SELLERS HIGHLIGHT */}
      <section className="VELORA-section">
        <div className="section-header-centered">
          <span className="section-sub">TOP RATED</span>
          <h2 className="section-title">Customer Favorites</h2>
          <p className="section-desc">Discover versatile staples rated highest for comfort, fit, and material quality.</p>
        </div>

        {!loading && products.length > 0 && (
          <div className="products-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                availableStock={stockMap[product.id]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

