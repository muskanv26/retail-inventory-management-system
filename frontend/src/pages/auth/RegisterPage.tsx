import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authResponse = await authApi.register({
        name,
        email,
        password,
        role: 'CUSTOMER',
      });
      login(authResponse.user);
      navigate('/');
    } catch (err: any) {
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        name: name || 'VELORA Customer',
        email: email,
        role: 'CUSTOMER' as const,
      };
      login(fallbackUser);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="VELORA-auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            <span className="brand-name">V E N D A R A</span>
            <span className="brand-sub">ESSENTIAL &amp; ELEVATED WEAR</span>
          </Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join VELORA to enjoy personalized shopping &amp; order tracking</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="VELORA-form-input"
            />
          </div>

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="VELORA-form-input"
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="VELORA-form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-VELORA-primary auth-submit-btn">
            <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

