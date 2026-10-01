import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const CustomerHeader: React.FC = () => {
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="VELORA-header-sticky">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="VELORA-promo-bar">
        <div className="VELORA-promo-content">
          <span><Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} /> COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹999</span>
          <span className="promo-divider">•</span>
          <span>TAKE 15% OFF YOUR FIRST ORDER | CODE: <strong>VELORA15</strong></span>
        </div>
      </div>

      {/* MAIN HEADER CONTAINER */}
      <div className="VELORA-header-main">
        <div className="VELORA-header-inner">
          {/* MOBILE MENU TOGGLE */}
          <button
            className="VELORA-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* BRAND LOGO */}
          <Link to="/" className="VELORA-brand-logo">
            <span className="brand-name">V E N D A R A</span>
            <span className="brand-sub">ESSENTIAL &amp; ELEVATED WEAR</span>
          </Link>

          {/* MAIN CATEGORY NAVIGATION */}
          <nav className="VELORA-desktop-nav">
            <NavLink to="/shop?category=Everyday+Wear" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              EVERYDAY WEAR
            </NavLink>
            <NavLink to="/shop?category=Layering" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              LAYERING
            </NavLink>
            <NavLink to="/shop?category=Workwear" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              WORKWEAR
            </NavLink>
            <NavLink to="/shop?category=Casual" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              CASUAL
            </NavLink>
            <NavLink to="/shop?category=Travel" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              TRAVEL
            </NavLink>
            <NavLink to="/shop?category=Accessories" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              ACCESSORIES
            </NavLink>
            <NavLink to="/shop?category=Footwear" className={({ isActive }) => `VELORA-nav-link ${isActive ? 'active' : ''}`}>
              FOOTWEAR
            </NavLink>
            <NavLink to="/shop?new=true" className={({ isActive }) => `VELORA-nav-link highlight ${isActive ? 'active' : ''}`}>
              NEW ARRIVALS
            </NavLink>
          </nav>

          {/* RIGHT ACTION ICONS */}
          <div className="VELORA-header-actions">
            {/* SEARCH */}
            <div className={`VELORA-search-wrapper ${searchOpen ? 'expanded' : ''}`}>
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="VELORA-search-form">
                  <input
                    type="text"
                    placeholder="Search tops, trousers, jackets, tote..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="VELORA-search-input"
                  />
                  <button type="submit" className="search-btn">
                    <Search size={18} />
                  </button>
                  <button type="button" onClick={() => setSearchOpen(false)} className="close-search-btn">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="VELORA-action-icon" title="Search catalog">
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* WISHLIST */}
            <Link to="/wishlist" className="VELORA-action-icon" title="My Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            {/* ACCOUNT */}
            <Link to="/account" className="VELORA-action-icon" title={user ? `Account (${user.name})` : 'Account'}>
              <UserIcon size={20} />
            </Link>

            {/* BAG */}
            <Link to="/cart" className="VELORA-action-icon bag-icon-btn" title="Shopping Bag">
              <ShoppingBag size={20} />
              {totalItemsCount > 0 && <span className="action-badge bag-badge">{totalItemsCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="VELORA-mobile-drawer">
          <nav className="VELORA-mobile-nav">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link to="/shop?category=Everyday+Wear" onClick={() => setMobileMenuOpen(false)}>EVERYDAY WEAR</Link>
            <Link to="/shop?category=Layering" onClick={() => setMobileMenuOpen(false)}>LAYERING</Link>
            <Link to="/shop?category=Workwear" onClick={() => setMobileMenuOpen(false)}>WORKWEAR</Link>
            <Link to="/shop?category=Casual" onClick={() => setMobileMenuOpen(false)}>CASUAL WEAR</Link>
            <Link to="/shop?category=Travel" onClick={() => setMobileMenuOpen(false)}>TRAVEL &amp; UTILITY</Link>
            <Link to="/shop?category=Accessories" onClick={() => setMobileMenuOpen(false)}>ACCESSORIES</Link>
            <Link to="/shop?category=Footwear" onClick={() => setMobileMenuOpen(false)}>FOOTWEAR</Link>
            <Link to="/shop?new=true" onClick={() => setMobileMenuOpen(false)}>NEW ARRIVALS</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>ALL CATALOG</Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>MY ORDERS</Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)}>MY ACCOUNT</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

