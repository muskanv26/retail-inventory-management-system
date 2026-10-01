import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Award, ArrowRight, Check } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="VELORA-footer">
      {/* VALUE PROPOSITION STRIP */}
      <div className="VELORA-benefits-bar">
        <div className="benefits-inner">
          <div className="benefit-item">
            <Truck size={24} className="benefit-icon" />
            <div>
              <h4 className="benefit-title">Complimentary Shipping</h4>
              <p className="benefit-desc">Free express delivery on all orders above ₹999</p>
            </div>
          </div>

          <div className="benefit-item">
            <RotateCcw size={24} className="benefit-icon" />
            <div>
              <h4 className="benefit-title">15-Day Easy Returns</h4>
              <p className="benefit-desc">Hassle-free doorstep return &amp; exchange service</p>
            </div>
          </div>

          <div className="benefit-item">
            <ShieldCheck size={24} className="benefit-icon" />
            <div>
              <h4 className="benefit-title">100% Quality Assurance</h4>
              <p className="benefit-desc">Thoughtfully designed, durable fabrics</p>
            </div>
          </div>

          <div className="benefit-item">
            <Award size={24} className="benefit-icon" />
            <div>
              <h4 className="benefit-title">Secure Payments</h4>
              <p className="benefit-desc">Encrypted checkout via UPI, Cards &amp; COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER NAVIGATION */}
      <div className="VELORA-footer-main">
        <div className="footer-columns">
          {/* BRAND & NEWSLETTER */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand-logo">
              <span className="brand-name">V E N D A R A</span>
              <span className="brand-sub">ESSENTIAL &amp; ELEVATED WEAR</span>
            </Link>
            <p className="footer-brand-desc">
              Essential apparel and accessories built for modern daily wear. Clean silhouettes, enduring fabrics, and functional versatility.
            </p>

            <div className="footer-newsletter">
              <h5 className="newsletter-title">Subscribe to The Dispatch</h5>
              <p className="newsletter-desc">Get early access to seasonal edits, restocks, and product releases.</p>
              {subscribed ? (
                <div className="newsletter-success">
                  <Check size={16} /> Thank you for subscribing to VELORA.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-submit">
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ONLINE SHOPPING */}
          <div className="footer-col">
            <h4 className="footer-col-title">SHOP CATEGORIES</h4>
            <ul className="footer-links">
              <li><Link to="/shop?category=Everyday+Wear">Everyday Wear</Link></li>
              <li><Link to="/shop?category=Layering">Layering &amp; Sweaters</Link></li>
              <li><Link to="/shop?category=Workwear">Workwear &amp; Tailored</Link></li>
              <li><Link to="/shop?category=Casual">Casual Apparel</Link></li>
              <li><Link to="/shop?category=Travel">Travel &amp; Outerwear</Link></li>
              <li><Link to="/shop?category=Accessories">Bags &amp; Accessories</Link></li>
              <li><Link to="/shop?category=Footwear">Footwear</Link></li>
            </ul>
          </div>

          {/* CUSTOMER CARE */}
          <div className="footer-col">
            <h4 className="footer-col-title">CUSTOMER CARE</h4>
            <ul className="footer-links">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/account">My Account</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><a href="#shipping">Shipping &amp; Delivery</a></li>
              <li><a href="#returns">Returns &amp; Exchanges</a></li>
              <li><a href="#size-guide">Size Guide</a></li>
              <li><a href="#faqs">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* ABOUT VELORA */}
          <div className="footer-col">
            <h4 className="footer-col-title">ABOUT VELORA</h4>
            <ul className="footer-links">
              <li><a href="#story">Our Design Ethos</a></li>
              <li><a href="#sustainability">Materials &amp; Craft</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li style={{ marginTop: '0.75rem' }}>
                <Link to="/admin" className="staff-portal-link">
                  Operations &amp; Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="VELORA-footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} VELORA Essential &amp; Elevated Wear. All rights reserved.</p>
          <div className="payment-badges">
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">MASTERCARD</span>
            <span className="pay-badge">UPI</span>
            <span className="pay-badge">NET BANKING</span>
            <span className="pay-badge">CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

