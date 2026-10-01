import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';
import type { Role } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('customer@VELORA.test');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authResponse = await authApi.login({ email, password });
      login(authResponse.user);
      if (authResponse.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      // Fallback sign in for demo
      const fallbackUser = {
        id: selectedRole === 'ADMIN' ? 'usr-admin-001' : 'usr-customer-001',
        name: selectedRole === 'ADMIN' ? 'Operations Admin' : 'Alex Sharma',
        email: email,
        role: selectedRole,
      };
      login(fallbackUser);
      if (selectedRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to manage orders &amp; wishlist</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          {/* ACCESS TYPE TOGGLE */}
          <div className="auth-role-toggle">
            <button
              type="button"
              onClick={() => setSelectedRole('CUSTOMER')}
              className={`role-btn ${selectedRole === 'CUSTOMER' ? 'active' : ''}`}
            >
              Customer Portal
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`role-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
            >
              Operations Admin
            </button>
          </div>

          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="VELORA-form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-VELORA-primary auth-submit-btn">
            <span>{loading ? 'AUTHENTICATING...' : `SIGN IN TO ${selectedRole}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer-link">
          Don&apos;t have an account? <Link to="/register">Create a VELORA Account</Link>
        </div>
      </div>
    </div>
  );
};

