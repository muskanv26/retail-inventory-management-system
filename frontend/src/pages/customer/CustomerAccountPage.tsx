import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, CreditCard, HelpCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

export const CustomerAccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments' | 'help'>('profile');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="VALERUNE-account-page">
      <div className="account-container">
        <h1 className="account-title">MY ACCOUNT</h1>
        <p className="account-subtitle">Manage your profile, shipping addresses &amp; order history</p>

        <div className="account-layout-grid">
          {/* LEFT ACCOUNT NAVIGATION */}
          <aside className="account-sidebar-nav">
            <div className="user-brief-card">
              <div className="avatar-circle">
                {user?.name?.substring(0, 2).toUpperCase() || 'VN'}
              </div>
              <div className="user-details">
                <h3 className="user-name">{user?.name || 'VALERUNE Customer'}</h3>
                <span className="user-email">{user?.email || 'customer@VALERUNE.test'}</span>
              </div>
            </div>

            <nav className="account-nav-list">
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={18} />
                <span>My Profile</span>
              </button>

              <Link to="/orders" className="nav-tab-btn">
                <ShoppingBag size={18} />
                <span>My Orders</span>
              </Link>

              <Link to="/wishlist" className="nav-tab-btn">
                <Heart size={18} />
                <span>My Wishlist ({wishlistCount})</span>
              </Link>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`nav-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              >
                <MapPin size={18} />
                <span>Saved Shipping Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`nav-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                <span>Payment Options</span>
              </button>

              <button
                onClick={() => setActiveTab('help')}
                className={`nav-tab-btn ${activeTab === 'help' ? 'active' : ''}`}
              >
                <HelpCircle size={18} />
                <span>Help &amp; Support</span>
              </button>

              <button onClick={handleLogout} className="nav-tab-btn logout-btn">
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </nav>
          </aside>

          {/* RIGHT CONTENT BODY */}
          <main className="account-main-content">
            {activeTab === 'profile' && (
              <div className="account-panel">
                <h3 className="panel-title">Personal Details</h3>
                <div className="info-fields-grid">
                  <div className="info-field">
                    <label>Full Name</label>
                    <strong>{user?.name || 'Customer'}</strong>
                  </div>

                  <div className="info-field">
                    <label>Email Address</label>
                    <strong>{user?.email || 'customer@VALERUNE.test'}</strong>
                  </div>

                  <div className="info-field">
                    <label>Account Role</label>
                    <strong>{user?.role || 'CUSTOMER'}</strong>
                  </div>

                  <div className="info-field">
                    <label>Account Status</label>
                    <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={16} /> Verified VALERUNE Member
                    </span>
                  </div>
                </div>

                <div className="account-quick-links" style={{ marginTop: '2.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h4>
                  <div className="quick-buttons-row">
                    <Link to="/orders" className="btn-VALERUNE-primary">
                      <ShoppingBag size={16} /> VIEW RECENT ORDERS
                    </Link>
                    <Link to="/wishlist" className="btn-VALERUNE-outline">
                      <Heart size={16} /> VIEW SAVED WISHLIST
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="account-panel">
                <h3 className="panel-title">Saved Delivery Addresses</h3>
                <div className="saved-address-card">
                  <div className="address-type-tag">DEFAULT HOME ADDRESS</div>
                  <h4 className="address-recipient">{user?.name || 'Customer'}</h4>
                  <p className="address-text">
                    Worli Sea Face<br />
                    Mumbai, Maharashtra — 400018<br />
                    India
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="account-panel">
                <h3 className="panel-title">Saved Payment Options</h3>
                <p style={{ color: 'var(--store-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your saved payment methods for faster 1-click checkout.
                </p>
                <div className="saved-address-card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Instant UPI &amp; Cards</h4>
                  <p style={{ color: 'var(--store-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Google Pay, PhonePe, Paytm &amp; Visa / Mastercard enabled for secure checkout.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="account-panel">
                <h3 className="panel-title">VALERUNE Customer Support</h3>
                <p style={{ color: 'var(--store-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Have questions about an order, shipment, or return? Our dedicated support team is available 7 days a week.
                </p>

                <div className="help-contacts-grid">
                  <div className="help-contact-box">
                    <h4>EMAIL SUPPORT</h4>
                    <p>support@VALERUNE.test</p>
                  </div>
                  <div className="help-contact-box">
                    <h4>HELPLINE</h4>
                    <p>1800-200-VALERUNE (Mon-Sun 9AM - 8PM)</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};


