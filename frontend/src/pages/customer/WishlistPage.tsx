import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/customer/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: 'var(--store-surface)',
            border: '1px solid var(--store-border)',
            borderRadius: 'var(--store-radius-lg)',
            padding: '4rem 2rem',
            boxShadow: 'var(--store-shadow-sm)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              color: 'var(--store-accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Heart size={40} />
          </div>
          <h2 style={{ fontFamily: 'var(--store-font-serif)', fontSize: '2rem', marginBottom: '0.75rem' }}>
            Your Wishlist is Empty
          </h2>
          <p style={{ color: 'var(--store-text-secondary)', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
            Save styles you love by tapping the heart icon on any product card while browsing our latest collections.
          </p>
          <Link to="/shop" className="btn-store-primary">
            <span>Explore Collections</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--store-font-serif)', fontSize: '2.5rem', fontWeight: 600 }}>
            My Wishlist ({wishlistItems.length})
          </h1>
          <p style={{ color: 'var(--store-text-secondary)', fontSize: '0.95rem' }}>
            Your curated list of saved fashion styles.
          </p>
        </div>

        <button
          onClick={clearWishlist}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--store-text-muted)',
            cursor: 'pointer',
          }}
        >
          Clear All Items
        </button>
      </div>

      <div className="products-grid">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
